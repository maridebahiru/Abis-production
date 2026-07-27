'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Lock, 
  LogOut, 
  Edit, 
  Plus, 
  Trash2,
  Upload,
  Sparkles,
  MoveUp,
  MoveDown,
  Star,
  Globe,
  CreditCard,
  LayoutDashboard,
  FolderKanban,
  Package as PackageIcon,
  UserCheck,
  Settings,
  X,
  Check,
  Film,
  Camera,
  MessageSquare,
  Send,
  Layers
} from 'lucide-react';
import { 
  Booking, 
  PaymentStatusType, 
  BookingStatusType, 
  ClientGalleryPhoto,
  BlockedDate, 
  Package, 
  Service,
  PortfolioItem,
  PaymentAccountDetails,
  WebsiteSettings,
  ServiceCategory,
  AdminUser,
  AdminUserRole
} from '@/types';
import { bookingStore, INITIAL_WEBSITE_SETTINGS } from '@/lib/bookingStore';

type AdminTab = 
  | 'dashboard'
  | 'bookings'
  | 'portfolio'
  | 'services'
  | 'packages'
  | 'customers'
  | 'admin_users'
  | 'payments'
  | 'calendar'
  | 'settings'
  | 'account';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth Protection State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Data Stores State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentAccountDetails[]>([]);
  const [siteSettings, setSiteSettings] = useState<WebsiteSettings>(INITIAL_WEBSITE_SETTINGS);

  // Admin Users / Staff Access State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUserModalOpen, setAdminUserModalOpen] = useState<boolean>(false);
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminRole, setNewAdminRole] = useState<AdminUserRole>('admin');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('AdminPassword123!');
  const [adminUserError, setAdminUserError] = useState<string>('');
  const [adminUserSuccess, setAdminUserSuccess] = useState<string>('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals & Forms State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Portfolio Modal State
  const [portfolioModalOpen, setPortfolioModalOpen] = useState<boolean>(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isUploadingPortfolioImage, setIsUploadingPortfolioImage] = useState<boolean>(false);
  const [isUploadingBtsVideo, setIsUploadingBtsVideo] = useState<boolean>(false);
  const [isUploadingServiceImage, setIsUploadingServiceImage] = useState<boolean>(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    category: 'Wedding' as ServiceCategory,
    image: '',
    clientName: '',
    date: '',
    description: '',
    btsVideoUrl: '',
    isFeatured: false,
    isVideo: false,
  });

  const [batchImageFiles, setBatchImageFiles] = useState<File[]>([]);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');

  // Date Block State
  const [newBlockDate, setNewBlockDate] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('Studio Maintenance');

  const handleBtsVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant zero-lag preview for UI thread (0ms latency, zero RAM overhead)
    if (typeof window !== 'undefined' && window.URL) {
      const instantBlobUrl = URL.createObjectURL(file);
      setPortfolioForm((prev) => ({ ...prev, btsVideoUrl: instantBlobUrl, isVideo: true }));
    }

    setIsUploadingBtsVideo(true);
    try {
      const url = await bookingStore.uploadMediaFile(file);
      if (url) {
        setPortfolioForm((prev) => ({ ...prev, btsVideoUrl: url, isVideo: true }));
      }
    } catch (err) {
      console.error('BTS video file upload error', err);
    } finally {
      setIsUploadingBtsVideo(false);
    }
  };

  const handlePortfolioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setIsUploadingPortfolioImage(true);
    try {
      if (files.length === 1) {
        setUploadProgressText('Compressing and optimizing photo...');
        const url = await bookingStore.uploadMediaFile(files[0]);
        setPortfolioForm((prev) => ({ ...prev, image: url }));
        setBatchImageFiles([]);
      } else {
        setUploadProgressText(`Selected ${files.length} photos for batch upload...`);
        setBatchImageFiles(files);
        // Process first photo for live modal thumbnail preview
        const firstUrl = await bookingStore.uploadMediaFile(files[0]);
        setPortfolioForm((prev) => ({ ...prev, image: firstUrl }));
      }
    } catch (err) {
      console.error('Portfolio file upload error', err);
      alert('Failed to process image files. Please try again.');
    } finally {
      setIsUploadingPortfolioImage(false);
      setUploadProgressText('');
    }
  };

  const handleServiceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingServiceImage(true);
    try {
      const url = await bookingStore.uploadMediaFile(file);
      setServiceForm((prev) => ({ ...prev, coverImage: url }));
    } catch (err) {
      console.error('Service file upload error', err);
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setIsUploadingServiceImage(false);
    }
  };

  // Service Modal State
  const [serviceModalOpen, setServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'Wedding',
    description: '',
    coverImage: '',
    startingPrice: 20000,
    estimatedDuration: '3 to 6 Hours',
    isEnabled: true,
  });

  // Package Modal State
  const [packageModalOpen, setPackageModalOpen] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageForm, setPackageForm] = useState({
    serviceId: 'serg',
    name: '',
    tagline: '',
    price: 35000,
    duration: '6 Hours Coverage',
    photographersCount: 1,
    featuresText: '',
    isPopular: false,
  });

  // Date Block State
  const [newBlockDate, setNewBlockDate] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('Studio Maintenance');

  // Load Initial Data
  useEffect(() => {
    if (!bookingStore.isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    refreshData();
  }, [router]);

  const refreshData = async () => {
    const b = await bookingStore.getBookings();
    const s = await bookingStore.getServices();
    const p = await bookingStore.getPackages();
    const bd = await bookingStore.getBlockedDates();
    const port = await bookingStore.getPortfolioItems();
    const pay = await bookingStore.getPaymentSettings();
    const setts = await bookingStore.getWebsiteSettings();

    setBookings(b);
    setServices(s);
    setPackages(p);
    setBlockedDates(bd);
    setPortfolioItems(port);
    setPaymentSettings(pay);
    setSiteSettings(setts);
  };

  const handleLogout = async () => {
    await bookingStore.logoutAdmin();
    router.push('/admin/login');
  };

  // --- PORTFOLIO HANDLERS ---
  const handleOpenPortfolioModal = (item?: PortfolioItem) => {
    if (item) {
      setEditingPortfolioItem(item);
      setPortfolioForm({
        title: item.title,
        category: (item.category as ServiceCategory) || 'Wedding',
        image: item.image,
        clientName: item.clientName || '',
        date: item.date || '',
        description: item.description || '',
        btsVideoUrl: item.btsVideoUrl || '',
        isFeatured: Boolean(item.isFeatured),
        isVideo: Boolean(item.isVideo),
      });
    } else {
      setEditingPortfolioItem(null);
      setPortfolioForm({
        title: '',
        category: 'Wedding',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
        clientName: '',
        date: 'July 2026',
        description: '',
        btsVideoUrl: '',
        isFeatured: false,
        isVideo: false,
      });
    }
    setPortfolioModalOpen(true);
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (batchImageFiles.length > 1) {
      setIsUploadingPortfolioImage(true);
      setUploadProgressText(`Compressing & saving ${batchImageFiles.length} photos into IndexedDB...`);
      const newItems: PortfolioItem[] = [];

      for (let i = 0; i < batchImageFiles.length; i++) {
        const file = batchImageFiles[i];
        const url = await bookingStore.uploadMediaFile(file);
        newItems.push({
          id: `port-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          title: portfolioForm.title ? `${portfolioForm.title} (${i + 1}/${batchImageFiles.length})` : `Photo (${i + 1}/${batchImageFiles.length})`,
          category: portfolioForm.category,
          image: url,
          clientName: portfolioForm.clientName,
          date: portfolioForm.date || '2026',
          description: portfolioForm.description,
          btsVideoUrl: portfolioForm.btsVideoUrl,
          isFeatured: portfolioForm.isFeatured && i === 0,
          isVideo: portfolioForm.isVideo,
          displayOrder: portfolioItems.length + i,
        });
      }

      await bookingStore.saveMultiplePortfolioItems(newItems);
      setIsUploadingPortfolioImage(false);
      setBatchImageFiles([]);
      setUploadProgressText('');
      setPortfolioModalOpen(false);
      refreshData();
      return;
    }

    const itemToSave: PortfolioItem = {
      id: editingPortfolioItem ? editingPortfolioItem.id : `port-${Date.now()}`,
      title: portfolioForm.title,
      category: portfolioForm.category,
      image: portfolioForm.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
      clientName: portfolioForm.clientName,
      date: portfolioForm.date,
      description: portfolioForm.description,
      btsVideoUrl: portfolioForm.btsVideoUrl,
      isFeatured: portfolioForm.isFeatured,
      isVideo: portfolioForm.isVideo,
      displayOrder: editingPortfolioItem ? editingPortfolioItem.displayOrder : portfolioItems.length,
    };
    await bookingStore.savePortfolioItem(itemToSave);
    setPortfolioModalOpen(false);
    refreshData();
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await bookingStore.deletePortfolioItem(id);
    refreshData();
  };

  const handleMovePortfolio = async (index: number, direction: 'up' | 'down') => {
    const updated = [...portfolioItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    await bookingStore.reorderPortfolioItems(updated);
    refreshData();
  };

  // --- SERVICE HANDLERS ---
  const handleOpenServiceModal = (s?: Service) => {
    if (s) {
      setEditingService(s);
      setServiceForm({
        title: s.title,
        category: s.category,
        description: s.description,
        coverImage: s.coverImage,
        startingPrice: s.startingPrice,
        estimatedDuration: s.estimatedDuration,
        isEnabled: s.isEnabled !== false,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        title: '',
        category: 'Wedding',
        description: '',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
        startingPrice: 25000,
        estimatedDuration: '4 Hours',
        isEnabled: true,
      });
    }
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const serviceToSave: Service = {
      id: editingService ? editingService.id : `serv-${Date.now()}`,
      title: serviceForm.title,
      category: serviceForm.category,
      description: serviceForm.description,
      coverImage: serviceForm.coverImage,
      startingPrice: Number(serviceForm.startingPrice),
      estimatedDuration: serviceForm.estimatedDuration,
      isEnabled: serviceForm.isEnabled,
    };
    await bookingStore.saveService(serviceToSave);
    setServiceModalOpen(false);
    refreshData();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await bookingStore.deleteService(id);
    refreshData();
  };

  // --- PACKAGE HANDLERS ---
  const handleOpenPackageModal = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageForm({
        serviceId: pkg.serviceId,
        name: pkg.name,
        tagline: pkg.tagline,
        price: pkg.price,
        duration: pkg.duration,
        photographersCount: pkg.photographersCount,
        featuresText: pkg.features.join('\n'),
        isPopular: Boolean(pkg.isPopular),
      });
    } else {
      setEditingPackage(null);
      setPackageForm({
        serviceId: services[0]?.id || 'serg',
        name: '',
        tagline: '',
        price: 35000,
        duration: '6 Hours Coverage',
        photographersCount: 1,
        featuresText: '1 Lead Photographer\n250+ Edited Photos\nOnline Gallery',
        isPopular: false,
      });
    }
    setPackageModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const featuresList = packageForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const packageToSave: Package = {
      id: editingPackage ? editingPackage.id : `pkg-${Date.now()}`,
      serviceId: packageForm.serviceId,
      name: packageForm.name,
      tagline: packageForm.tagline,
      price: Number(packageForm.price),
      duration: packageForm.duration,
      photographersCount: Number(packageForm.photographersCount),
      features: featuresList,
      isPopular: packageForm.isPopular,
    };
    await bookingStore.savePackage(packageToSave);
    setPackageModalOpen(false);
    refreshData();
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    await bookingStore.deletePackage(id);
    refreshData();
  };

  // --- PAYMENT SETTINGS HANDLER ---
  const handleSavePaymentSetting = async (setting: PaymentAccountDetails) => {
    await bookingStore.savePaymentSetting(setting);
    refreshData();
  };

  // --- WEBSITE SETTINGS HANDLER ---
  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await bookingStore.saveWebsiteSettings(siteSettings);
    alert('Website content settings updated successfully!');
    refreshData();
  };

  // --- BOOKING STATUS ACTIONS ---
  const handleUpdateStatus = async (
    bookingId: string, 
    payStatus: PaymentStatusType, 
    bookStatus: BookingStatusType
  ) => {
    await bookingStore.updateBookingStatus(bookingId, payStatus, bookStatus);
    refreshData();
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        paymentStatus: payStatus,
        bookingStatus: bookStatus,
      });
    }
  };

  const handleToggleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;
    await bookingStore.toggleBlockDate(newBlockDate, undefined, blockReason);
    setNewBlockDate('');
    refreshData();
  };

  // Filter Bookings logic
  const filteredBookings = bookings.filter((b) => {
    const ref = b.referenceNumber || '';
    const name = b.customerName || '';
    const email = b.customerEmail || '';
    const phone = b.customerPhone || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      ref.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      phone.includes(searchQuery);

    const matchesPayment = paymentFilter === 'All' || b.paymentStatus === paymentFilter;
    const matchesService = serviceFilter === 'All' || b.serviceId === serviceFilter;
    const matchesDate = !dateFilter || b.bookingDate === dateFilter;

    return matchesSearch && matchesPayment && matchesService && matchesDate;
  });

  // KPI Calculations
  const verifiedRevenue = bookings
    .filter((b) => b.paymentStatus === 'Verified')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const pendingReceiptsCount = bookings.filter((b) => b.paymentStatus === 'Pending Review').length;

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-dark-bg text-zinc-100 flex flex-col md:flex-row -mt-24 pt-24">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-950 border-r border-zinc-800 p-6 space-y-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-zinc-100 text-sm">Abis Admin</h2>
            <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider">Control Panel</span>
          </div>
        </div>

        <nav className="space-y-1.5 text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'bookings', label: 'Bookings', icon: FileText, badge: pendingReceiptsCount },
            { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
            { id: 'services', label: 'Services', icon: Sparkles },
            { id: 'packages', label: 'Packages', icon: PackageIcon },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'admin_users', label: 'Admin & Staff Users', icon: ShieldCheck },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
            { id: 'settings', label: 'Website Settings', icon: Globe },
            { id: 'account', label: 'Account', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 font-bold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-dark-bg text-[10px] font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="pt-4 border-t border-zinc-900">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-zinc-100 capitalize">
              {activeTab === 'settings' ? 'Website Content Settings' : activeTab} Management
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time synchronization with live public site & database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-gold-400"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-gold-500/20 space-y-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Verified Revenue</span>
                <div className="font-serif text-3xl font-bold text-gold-gradient">
                  ETB {verifiedRevenue.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Confirmed Transfers</span>
                </span>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Total Bookings</span>
                <div className="font-serif text-3xl font-bold text-zinc-100">{bookings.length}</div>
                <span className="text-[11px] text-zinc-400">All registered requests</span>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Pending Receipts</span>
                <div className="font-serif text-3xl font-bold text-amber-400">{pendingReceiptsCount}</div>
                <span className="text-[11px] text-amber-300">Action required</span>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Portfolio Items</span>
                <div className="font-serif text-3xl font-bold text-zinc-100">{portfolioItems.length}</div>
                <span className="text-[11px] text-gold-400">Active showcase media</span>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="font-serif text-lg font-bold text-zinc-100">Quick Operations</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="px-4 py-2.5 rounded-xl bg-gold-500 text-dark-bg text-xs font-bold flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review Pending Bookings ({pendingReceiptsCount})</span>
                </button>
                <button
                  onClick={() => handleOpenPortfolioModal()}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-gold-400 border border-zinc-700 text-xs font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Portfolio Image</span>
                </button>
                <button
                  onClick={() => handleOpenServiceModal()}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-gold-400 border border-zinc-700 text-xs font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Service</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search & Filters Bar */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ref, customer name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:border-gold-400 focus:outline-none"
                >
                  <option value="All">All Payment Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:border-gold-400 focus:outline-none"
                >
                  <option value="All">All Services</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Ref & Customer</th>
                      <th className="p-4">Service & Package</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4">Booking Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          No bookings found.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="p-4 space-y-1">
                            <span className="font-mono font-bold text-gold-400 block">{b.referenceNumber}</span>
                            <span className="font-semibold text-zinc-100 block">{b.customerName}</span>
                            <span className="text-[11px] text-zinc-400 block">{b.customerPhone} | {b.customerEmail}</span>
                          </td>

                          <td className="p-4 space-y-1">
                            <span className="font-semibold text-zinc-200 block">{b.serviceName}</span>
                            <span className="text-[11px] text-zinc-400 block">{b.packageName}</span>
                            <span className="font-serif font-bold text-gold-gradient block">ETB {b.totalPrice.toLocaleString()}</span>
                          </td>

                          <td className="p-4 space-y-1">
                            <span className="font-medium text-zinc-200 block">{b.bookingDate}</span>
                            <span className="text-gold-400 font-semibold block">{b.bookingTime}</span>
                          </td>

                          <td className="p-4 space-y-1">
                            <span className="font-semibold text-zinc-300 block">{b.paymentMethod}</span>
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="text-[11px] text-gold-400 underline hover:text-gold-300 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Receipt</span>
                            </button>
                          </td>

                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              b.paymentStatus === 'Verified'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : b.paymentStatus === 'Rejected'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </td>

                          <td className="p-4">
                            <select
                              value={b.bookingStatus}
                              onChange={(e) => handleUpdateStatus(b.id, b.paymentStatus, e.target.value as BookingStatusType)}
                              className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:border-gold-400 focus:outline-none"
                            >
                              <option value="Pending Payment Verification">Pending Payment Verification</option>
                              <option value="Payment Verified">Payment Verified</option>
                              <option value="Booking Confirmed">Booking Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PORTFOLIO MANAGEMENT */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-zinc-100">Media Portfolio Manager</h2>
                <p className="text-xs text-zinc-400">Upload photos/videos, assign categories, toggle featured, and reorder display sequence.</p>
              </div>
              <button
                onClick={() => handleOpenPortfolioModal()}
                className="gold-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Media</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item, idx) => (
                <div key={item.id} className="glass-card rounded-2xl overflow-hidden border border-zinc-800 space-y-3 p-4 flex flex-col justify-between">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden bg-black">
                    <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    {item.isFeatured && (
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-gold-500 text-dark-bg text-[10px] font-bold uppercase flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-zinc-900/90 text-gold-300 text-[10px] font-semibold">
                      {item.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-zinc-100 text-base">{item.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                    {item.clientName && <span className="text-[11px] text-zinc-500 block">Client: {item.clientName} ({item.date})</span>}
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMovePortfolio(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMovePortfolio(idx, 'down')}
                        disabled={idx === portfolioItems.length - 1}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenPortfolioModal(item)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(item.id)}
                        className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-zinc-100">Service Category Manager</h2>
                <p className="text-xs text-zinc-400">Add, edit, change pricing, upload cover images, or disable services dynamically.</p>
              </div>
              <button
                onClick={() => handleOpenServiceModal()}
                className="gold-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s.id} className="glass-card rounded-2xl overflow-hidden border border-zinc-800 p-5 space-y-4 flex flex-col justify-between">
                  <div className="relative h-44 w-full rounded-xl overflow-hidden">
                    <Image src={s.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"} alt={s.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    <span className="absolute top-2 right-2 px-3 py-1 rounded-full bg-zinc-900/90 text-gold-300 text-[10px] font-bold">
                      {s.estimatedDuration}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-zinc-100">{s.title}</h3>
                      <span className="font-bold text-gold-gradient text-sm">ETB {s.startingPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{s.description}</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${s.isEnabled !== false ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                      {s.isEnabled !== false ? 'Enabled' : 'Disabled'}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenServiceModal(s)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PACKAGES MANAGEMENT */}
        {activeTab === 'packages' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-zinc-100">Package Tiers Manager</h2>
                <p className="text-xs text-zinc-400">Configure Basic, Premium, Gold, or Luxury tiers per service with custom feature lists.</p>
              </div>
              <button
                onClick={() => handleOpenPackageModal()}
                className="gold-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Package Tier</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const parentService = services.find((s) => s.id === pkg.serviceId);
                return (
                  <div key={pkg.id} className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 block">
                        Service: {parentService?.title || pkg.serviceId}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-zinc-100">{pkg.name}</h3>
                      <p className="text-xs text-zinc-400">{pkg.tagline}</p>
                      <div className="font-serif text-2xl font-bold text-gold-gradient pt-1">
                        ETB {pkg.price.toLocaleString()}
                      </div>
                      <span className="text-xs text-zinc-400 block">{pkg.duration}</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-zinc-300 border-t border-zinc-800 pt-3">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenPackageModal(pkg)}
                        className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS CRM */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="font-serif text-2xl font-bold text-zinc-100">Customer Records</h2>
            <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Total Bookings</th>
                    <th className="p-4 text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {Array.from(new Set(bookings.map((b) => b.customerEmail))).map((email) => {
                    const custBookings = bookings.filter((b) => b.customerEmail === email);
                    const first = custBookings[0];
                    const totalSpent = custBookings.reduce((sum, b) => sum + b.totalPrice, 0);
                    return (
                      <tr key={email}>
                        <td className="p-4 font-bold text-zinc-100">{first.customerName}</td>
                        <td className="p-4 text-zinc-300">{first.customerPhone}</td>
                        <td className="p-4 text-zinc-400">{first.customerEmail}</td>
                        <td className="p-4 font-semibold text-gold-400">{custBookings.length} session(s)</td>
                        <td className="p-4 text-right font-serif font-bold text-gold-gradient">ETB {totalSpent.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: PAYMENT SETTINGS */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-100">Payment Account Settings</h2>
              <p className="text-xs text-zinc-400">Configure Telebirr, CBE Birr, and Bank Transfer accounts without touching code.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentSettings.map((pm) => (
                <div key={pm.method} className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
                  <h3 className="font-serif text-xl font-bold text-gold-gradient">{pm.method} Configuration</h3>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold block">Account Name</label>
                      <input
                        type="text"
                        value={pm.accountName}
                        onChange={(e) => handleSavePaymentSetting({ ...pm, accountName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold block">Account / Phone Number</label>
                      <input
                        type="text"
                        value={pm.accountNumber}
                        onChange={(e) => handleSavePaymentSetting({ ...pm, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold block">Payment Instructions</label>
                      <textarea
                        rows={3}
                        value={pm.instructions}
                        onChange={(e) => handleSavePaymentSetting({ ...pm, instructions: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: CALENDAR & DATE BLOCKING */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="font-serif text-2xl font-bold text-zinc-100">Calendar & Blocked Dates</h2>
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-6">
              <form onSubmit={handleToggleBlockDate} className="flex flex-col sm:flex-row gap-4 items-end max-w-2xl">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-semibold text-zinc-300">Target Date to Block</label>
                  <input
                    type="date"
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 flex-1">
                  <label className="text-xs font-semibold text-zinc-300">Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Studio Maintenance"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newBlockDate}
                  className="gold-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Block Date
                </button>
              </form>

              <div className="pt-2">
                <span className="text-xs font-semibold text-zinc-400 block mb-2">Blocked Dates:</span>
                <div className="flex flex-wrap gap-2">
                  {blockedDates.map((bd) => (
                    <div key={bd.id} className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                      <span>{bd.blockedDate} ({bd.reason})</span>
                      <button onClick={() => bookingStore.toggleBlockDate(bd.blockedDate)} className="hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: WEBSITE CONTENT SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveWebsiteSettings} className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-100">Live Website Content CMS</h2>
              <p className="text-xs text-zinc-400">Edit homepage titles, hero image, about text, address, and contact lines with immediate public site updates.</p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-6">
              <h3 className="font-serif text-lg font-bold text-gold-gradient border-b border-zinc-800 pb-2">Homepage Hero Banner</h3>
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Hero Title</label>
                  <input
                    type="text"
                    value={siteSettings.heroTitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={siteSettings.heroSubtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Hero Background Image URL</label>
                  <input
                    type="text"
                    value={siteSettings.heroImage}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroImage: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <h3 className="font-serif text-lg font-bold text-gold-gradient border-b border-zinc-800 pb-2 pt-4">About Us & Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-zinc-300 font-semibold">About Us Intro Text</label>
                  <textarea
                    rows={3}
                    value={siteSettings.aboutContent}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutContent: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-zinc-300 font-semibold">Studio Office Address</label>
                  <input
                    type="text"
                    value={siteSettings.officeAddress}
                    onChange={(e) => setSiteSettings({ ...siteSettings, officeAddress: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Main Phone Line</label>
                  <input
                    type="text"
                    value={siteSettings.phone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Emergency Hotline</label>
                  <input
                    type="text"
                    value={siteSettings.hotline}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hotline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Studio Email</label>
                  <input
                    type="email"
                    value={siteSettings.email}
                    onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">WhatsApp Chat URL</label>
                  <input
                    type="text"
                    value={siteSettings.whatsappUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, whatsappUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Website Settings</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 9: ADMIN & STAFF USER MANAGEMENT (SUPER ADMIN) */}
        {activeTab === 'admin_users' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Super Admin Controls</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-zinc-100">
                  Administrator & Staff Management ({adminUsers.length})
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  As a Super Admin, you can invite and manage as many admin users, managers, and studio staff accounts as needed.
                </p>
              </div>

              <button
                onClick={() => {
                  setAdminUserError('');
                  setAdminUserSuccess('');
                  setAdminUserModalOpen(true);
                }}
                className="gold-btn px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Admin / Staff User</span>
              </button>
            </div>

            {/* Admin Users Table */}
            <div className="glass-card rounded-3xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="p-4">User Account</th>
                      <th className="p-4">Role & Access Level</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {adminUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-4 font-semibold text-zinc-100 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-zinc-100">{user.email}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">ID: {user.id}</div>
                          </div>
                        </td>

                        <td className="p-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeAdminRole(user.id, e.target.value as AdminUserRole)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase ${
                              user.role === 'super_admin'
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : user.role === 'admin'
                                ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                            }`}
                          >
                            <option value="super_admin" className="bg-zinc-900 text-zinc-100">Super Admin (Full Access)</option>
                            <option value="admin" className="bg-zinc-900 text-zinc-100">Admin (Standard)</option>
                            <option value="editor" className="bg-zinc-900 text-zinc-100">Editor (Content Only)</option>
                          </select>
                        </td>

                        <td className="p-4 text-zinc-400 font-mono">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteAdminUser(user.id, user.email)}
                            className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-400 hover:bg-red-900 text-xs font-bold inline-flex items-center gap-1 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke Access</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add New Admin Modal */}
            {adminUserModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-xl animate-in fade-in duration-200">
                <div className="relative w-full max-w-lg bg-zinc-950 border border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Super Admin Action</span>
                      <h3 className="font-serif text-xl font-bold text-zinc-100">Register New Admin / Staff User</h3>
                    </div>
                    <button
                      onClick={() => setAdminUserModalOpen(false)}
                      className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {adminUserError && (
                    <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-300 text-center font-medium">
                      {adminUserError}
                    </div>
                  )}

                  {adminUserSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 text-center font-medium">
                      {adminUserSuccess}
                    </div>
                  )}

                  <form onSubmit={handleAddAdminUser} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-300">Staff Email Address *</label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="manager@abisproduction.com"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-300">Default Login Password *</label>
                      <input
                        type="password"
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-300">Role & Access Level *</label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value as AdminUserRole)}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-gold-400 focus:outline-none"
                      >
                        <option value="super_admin">Super Admin (Full Administrative Rights)</option>
                        <option value="admin">Admin (Manage Bookings, Portfolio, Services)</option>
                        <option value="editor">Editor (Portfolio & Content Updates Only)</option>
                      </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setAdminUserModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-zinc-100 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="gold-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                      >
                        Register Staff Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 10: ACCOUNT */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
            <h2 className="font-serif text-2xl font-bold text-zinc-100">Admin Security Credentials</h2>
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-zinc-400 block">Authenticated Admin User:</span>
                <span className="font-mono font-bold text-gold-400 text-sm">admin@luxphotography.com</span>
                <span className="text-[11px] text-emerald-400 block">Supabase Session Active</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- PORTFOLIO ITEM MODAL --- */}
      {portfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-zinc-100">
                {editingPortfolioItem ? 'Edit Portfolio Item' : 'Upload New Portfolio Media'}
              </h3>
              <button onClick={() => setPortfolioModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePortfolio} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Media Title *</label>
                  <input
                    type="text"
                    required
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                    placeholder="e.g. Royal Wedding at Sheraton"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Category *</label>
                  <select
                    value={portfolioForm.category}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value as ServiceCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Family">Family</option>
                    <option value="Studio">Studio</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Pre-Wedding">Pre-Wedding</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Christening">Christening</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="font-semibold text-zinc-300 block">Upload Portfolio Image / Cover Photo *</label>
                  
                  <div className="border-2 border-dashed border-zinc-700 hover:border-gold-500/50 rounded-2xl p-4 text-center bg-zinc-900/60 relative transition-all">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePortfolioFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="space-y-1.5 pointer-events-none">
                      <Upload className="w-6 h-6 text-gold-400 mx-auto" />
                      <div className="text-xs text-zinc-300">
                        {isUploadingPortfolioImage || uploadProgressText ? (
                          <span className="font-semibold text-gold-400 animate-pulse">
                            {uploadProgressText || 'Compressing & storing image...'}
                          </span>
                        ) : (
                          <span>
                            <span className="font-semibold text-gold-400">Click or drag one or multiple photos</span> to upload
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        {batchImageFiles.length > 1
                          ? `${batchImageFiles.length} photos ready for batch upload`
                          : 'Select single or multiple JPG, PNG, WEBP files'}
                      </span>
                    </div>
                  </div>

                  {portfolioForm.image && (
                    <div className="relative h-44 w-full rounded-xl overflow-hidden border border-zinc-800 bg-black mt-2">
                      <Image src={portfolioForm.image} alt="Portfolio Preview" fill sizes="100vw" className="object-contain" />
                    </div>
                  )}

                  <details className="text-[11px] text-zinc-400 pt-1">
                    <summary className="cursor-pointer hover:text-gold-400">Or paste image web URL manually</summary>
                    <input
                      type="text"
                      value={portfolioForm.image}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full mt-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-xs"
                    />
                  </details>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Client Name</label>
                  <input
                    type="text"
                    value={portfolioForm.clientName}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, clientName: e.target.value })}
                    placeholder="e.g. Selam & Henok"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-zinc-300 block">Upload BTS Video (Optional)</label>
                  
                  <div className="border-2 border-dashed border-zinc-700 hover:border-gold-500/50 rounded-2xl p-3.5 text-center bg-zinc-900/60 relative transition-all">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleBtsVideoFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="space-y-1 pointer-events-none">
                      <Film className="w-5 h-5 text-gold-400 mx-auto" />
                      <div className="text-xs text-zinc-300">
                        {isUploadingBtsVideo ? (
                          <span className="font-semibold text-gold-400 animate-pulse">Uploading BTS Video file...</span>
                        ) : (
                          <span>
                            <span className="font-semibold text-gold-400">Click or drag video file</span> (MP4, WEBM)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {portfolioForm.btsVideoUrl && (
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gold-400 font-semibold flex items-center gap-1">
                          <Film className="w-3.5 h-3.5" />
                          <span>BTS Video Attached</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setPortfolioForm((prev) => ({ ...prev, btsVideoUrl: '' }))}
                          className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold"
                        >
                          Remove
                        </button>
                      </div>
                      {portfolioForm.btsVideoUrl.startsWith('data:video') || portfolioForm.btsVideoUrl.endsWith('.mp4') || portfolioForm.btsVideoUrl.endsWith('.webm') ? (
                        <video src={portfolioForm.btsVideoUrl} controls className="w-full h-28 rounded-lg bg-black object-contain" />
                      ) : null}
                    </div>
                  )}

                  <details className="text-[11px] text-zinc-400 pt-1">
                    <summary className="cursor-pointer hover:text-gold-400">Or paste YouTube / Vimeo web URL manually</summary>
                    <input
                      type="text"
                      value={portfolioForm.btsVideoUrl}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, btsVideoUrl: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full mt-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-xs"
                    />
                  </details>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-zinc-300">Description</label>
                  <textarea
                    rows={2}
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={portfolioForm.isFeatured}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, isFeatured: e.target.checked })}
                  />
                  <label htmlFor="isFeatured" className="text-zinc-300">Mark as Featured Showcase</label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPortfolioModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-btn px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SERVICE MODAL --- */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-zinc-100">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Starting Price (ETB)</label>
                  <input
                    type="number"
                    value={serviceForm.startingPrice}
                    onChange={(e) => setServiceForm({ ...serviceForm, startingPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Duration</label>
                  <input
                    type="text"
                    value={serviceForm.estimatedDuration}
                    onChange={(e) => setServiceForm({ ...serviceForm, estimatedDuration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-zinc-300 block">Upload Service Cover Image *</label>
                <div className="border-2 border-dashed border-zinc-700 hover:border-gold-500/50 rounded-2xl p-4 text-center bg-zinc-900/60 relative transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleServiceFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="space-y-1.5 pointer-events-none">
                    <Upload className="w-6 h-6 text-gold-400 mx-auto" />
                    <div className="text-xs text-zinc-300">
                      {isUploadingServiceImage ? (
                        <span className="font-semibold text-gold-400 animate-pulse">Uploading file...</span>
                      ) : (
                        <span>
                          <span className="font-semibold text-gold-400">Click or drag cover image here</span> to upload
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {serviceForm.coverImage && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-zinc-800 bg-black mt-2">
                    <Image src={serviceForm.coverImage} alt="Service Cover Preview" fill sizes="100vw" className="object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={serviceForm.isEnabled}
                  onChange={(e) => setServiceForm({ ...serviceForm, isEnabled: e.target.checked })}
                />
                <label htmlFor="isEnabled" className="text-zinc-300">Enable service on website</label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-btn px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PACKAGE MODAL --- */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-zinc-100">
                {editingPackage ? 'Edit Package Tier' : 'Create Package Tier'}
              </h3>
              <button onClick={() => setPackageModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Target Service</label>
                  <select
                    value={packageForm.serviceId}
                    onChange={(e) => setPackageForm({ ...packageForm, serviceId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Package Name *</label>
                  <input
                    type="text"
                    required
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    placeholder="e.g. Gold Royal Package"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Duration</label>
                  <input
                    type="text"
                    value={packageForm.duration}
                    onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Tagline</label>
                <input
                  type="text"
                  value={packageForm.tagline}
                  onChange={(e) => setPackageForm({ ...packageForm, tagline: e.target.value })}
                  placeholder="e.g. Full day coverage with album & cinema video"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Features List (1 per line)</label>
                <textarea
                  rows={4}
                  value={packageForm.featuresText}
                  onChange={(e) => setPackageForm({ ...packageForm, featuresText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={packageForm.isPopular}
                  onChange={(e) => setPackageForm({ ...packageForm, isPopular: e.target.checked })}
                />
                <label htmlFor="isPopular" className="text-zinc-300">Mark as Most Popular / Featured Tier</label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPackageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-btn px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RECEIPT & PHOTO MANAGEMENT MODAL --- */}
      {selectedBooking && (
        <AdminBookingReviewModal
          selectedBooking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
          onPhotosUpdated={(updatedBooking) => {
            setSelectedBooking(updatedBooking);
            setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
          }}
        />
      )}
    </div>
  );
}

interface AdminBookingReviewModalProps {
  selectedBooking: Booking;
  onClose: () => void;
  onUpdateStatus: (id: string, payStatus: PaymentStatusType, bookStatus: BookingStatusType) => void;
  onPhotosUpdated: (updatedBooking: Booking) => void;
}

function AdminBookingReviewModal({
  selectedBooking,
  onClose,
  onUpdateStatus,
  onPhotosUpdated,
}: AdminBookingReviewModalProps) {
  const [modalTab, setModalTab] = useState<'receipt' | 'upload' | 'selections'>('receipt');
  const [isUploadingShots, setIsUploadingShots] = useState<boolean>(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>('');

  const handleShotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setIsUploadingShots(true);
    setUploadProgressMsg(`Processing ${files.length} shot photos...`);

    try {
      const newItems: ClientGalleryPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressMsg(`Compressing & uploading ${i + 1} of ${files.length}...`);
        const url = await bookingStore.uploadMediaFile(file);
        newItems.push({
          id: `shot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          url: url,
          highResUrl: url,
          status: 'Pending',
        });
      }

      const existing = selectedBooking.galleryPhotos || [];
      const combined = [...existing, ...newItems];
      const updated = await bookingStore.uploadOrderShotPhotos(selectedBooking.id, combined);
      if (updated) {
        onPhotosUpdated(updated);
        alert(`Successfully uploaded ${newItems.length} photos! Order status changed to "Photos Uploaded" and customer notified.`);
      }
    } catch (err) {
      console.error('Error uploading shot photos', err);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setIsUploadingShots(false);
      setUploadProgressMsg('');
    }
  };

  const galleryPhotos = selectedBooking.galleryPhotos || [];
  const selectedPhotos = galleryPhotos.filter((p) => p.status === 'Selected');
  const rejectedPhotos = galleryPhotos.filter((p) => p.status === 'Rejected');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6 sm:p-8 space-y-6">
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Order Management</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300 font-bold">
                PIN: {selectedBooking.galleryPin}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-zinc-100 flex items-center gap-2">
              Ref: <span className="font-mono text-gold-400">{selectedBooking.referenceNumber}</span>
              <span className="text-sm font-sans font-normal text-zinc-400">({selectedBooking.customerName})</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-100 self-start sm:self-auto">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-xs">
          <button
            onClick={() => setModalTab('receipt')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              modalTab === 'receipt'
                ? 'bg-gold-500 text-dark-bg shadow-gold-glow'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Receipt & Payment</span>
          </button>

          <button
            onClick={() => setModalTab('upload')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              modalTab === 'upload'
                ? 'bg-gold-500 text-dark-bg shadow-gold-glow'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Bulk Shot Photo Upload ({galleryPhotos.length})</span>
          </button>

          <button
            onClick={() => setModalTab('selections')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              modalTab === 'selections'
                ? 'bg-gold-500 text-dark-bg shadow-gold-glow'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Client Selections ({selectedPhotos.length})</span>
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          {/* TAB 1: RECEIPT & PAYMENT VERIFICATION */}
          {modalTab === 'receipt' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Payment Receipt Proof:
                </span>
                <div className="relative h-72 w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                  {(() => {
                    const isPdf = selectedBooking.receiptFileType === 'application/pdf' || selectedBooking.receiptUrl?.includes('application/pdf') || selectedBooking.receiptUrl?.endsWith('.pdf');

                    if (isPdf) {
                      return (
                        <div className="p-6 text-center space-y-3">
                          <FileText className="w-12 h-12 text-gold-400 mx-auto" />
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-zinc-100 block">PDF Receipt File Attached</span>
                            <span className="text-xs text-zinc-400 block">{selectedBooking.receiptFileName || 'receipt.pdf'}</span>
                          </div>
                          <a
                            href={selectedBooking.receiptUrl}
                            download={selectedBooking.receiptFileName || 'receipt.pdf'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 text-dark-bg text-xs font-bold uppercase tracking-wider"
                          >
                            <Download className="w-4 h-4" />
                            <span>Open PDF Receipt</span>
                          </a>
                        </div>
                      );
                    }

                    return (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={selectedBooking.receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'}
                        alt="Uploaded Payment Receipt"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                    );
                  })()}
                </div>

                <div className="flex justify-end">
                  <a
                    href={selectedBooking.receiptUrl || '#'}
                    download={selectedBooking.receiptFileName || 'receipt.jpg'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-gold-400 hover:border-gold-500/40 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </a>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <span className="text-xs font-bold uppercase text-zinc-300 block">
                  Update Payment Status:
                </span>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedBooking.id, 'Verified', 'Payment Confirmed');
                      alert(`Order ${selectedBooking.referenceNumber} payment verified & confirmed!`);
                    }}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Payment (Confirm Order)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Reject payment and cancel Order ${selectedBooking.referenceNumber}?`)) {
                        onUpdateStatus(selectedBooking.id, 'Rejected', 'Cancelled');
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-red-950 border border-red-500 text-red-300 hover:bg-red-900 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Payment</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BULK SHOT PHOTO UPLOAD */}
          {modalTab === 'upload' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/80 border border-gold-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-zinc-100">Upload Session Shot Photos</h4>
                    <p className="text-xs text-zinc-400">Bulk upload raw/shot photos for Order <strong className="text-gold-400">{selectedBooking.referenceNumber}</strong></p>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-400 bg-black px-3 py-1 rounded-lg border border-zinc-800">
                    Total Uploaded: {galleryPhotos.length}
                  </span>
                </div>

                <div className="border-2 border-dashed border-zinc-700 hover:border-gold-500/50 rounded-2xl p-8 text-center bg-zinc-950/60 relative transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleShotUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    disabled={isUploadingShots}
                  />
                  <div className="space-y-2 pointer-events-none">
                    <Upload className="w-10 h-10 text-gold-400 mx-auto" />
                    {isUploadingShots ? (
                      <span className="text-xs font-bold text-gold-400 animate-pulse block">
                        {uploadProgressMsg || 'Uploading photos...'}
                      </span>
                    ) : (
                      <>
                        <div className="text-xs font-bold text-zinc-200">
                          <span className="text-gold-400 underline">Click to select files</span> or drag and drop multiple photo files
                        </div>
                        <span className="text-[10px] text-zinc-500 block">JPG, PNG, WEBP files up to 25MB each</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Uploaded Shot Thumbnails */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Uploaded Photos Grid</h5>
                {galleryPhotos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                    No shot photos uploaded yet for this order. Use the uploader above.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {galleryPhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-zinc-200">
                          <span className="font-semibold truncate">{photo.title}</span>
                          <span className={`font-bold ${photo.status === 'Selected' ? 'text-emerald-400' : photo.status === 'Rejected' ? 'text-red-400' : 'text-zinc-400'}`}>
                            Status: {photo.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT SELECTIONS & RETOUCH NOTES */}
          {modalTab === 'selections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div>
                  <h4 className="font-serif text-lg font-bold text-zinc-100">Customer Selection Review</h4>
                  <p className="text-xs text-zinc-400">Order Status: <strong className="text-gold-400">{selectedBooking.bookingStatus}</strong></p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                    Keep: {selectedPhotos.length}
                  </div>
                  <div className="text-xs px-3 py-1.5 rounded-xl bg-red-950 border border-red-800 text-red-400 font-bold">
                    Pass: {rejectedPhotos.length}
                  </div>
                  {selectedBooking.bookingStatus !== 'Completed' && (
                    <button
                      onClick={() => {
                        onUpdateStatus(selectedBooking.id, selectedBooking.paymentStatus, 'Completed');
                        alert(`Order ${selectedBooking.referenceNumber} marked as Completed!`);
                      }}
                      className="gold-btn px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Mark Order Completed
                    </button>
                  )}
                </div>
              </div>

              {/* Selected Photos List with Retouch Notes */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selected Photos for Editing ({selectedPhotos.length})</span>
                </h5>

                {selectedPhotos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                    Customer has not submitted final selections yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedPhotos.map((photo) => (
                      <div key={photo.id} className="p-3 rounded-2xl bg-zinc-900 border border-emerald-500/40 flex gap-3">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1 text-xs overflow-hidden flex-1">
                          <span className="font-semibold text-zinc-100 block truncate">{photo.title}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold inline-block">
                            SELECTED
                          </span>
                          {photo.comment ? (
                            <div className="p-2 rounded-lg bg-black/60 border border-zinc-800 text-[11px] text-gold-300 italic mt-1">
                              💬 "{photo.comment}"
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-500 block">No retouch note</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
