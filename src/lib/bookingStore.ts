import { 
  Booking, 
  Service, 
  Package, 
  BlockedDate, 
  PaymentStatusType, 
  BookingStatusType, 
  ClientGalleryPhoto,
  PortfolioItem,
  PaymentAccountDetails,
  WebsiteSettings,
  AdminUser,
  AdminUserRole,
  AuditLog
} from '@/types';
import { 
  INITIAL_SERVICES, 
  INITIAL_PACKAGES, 
  INITIAL_BOOKINGS,
  PORTFOLIO_ITEMS,
  PAYMENT_METHODS
} from './mockData';
import { isSupabaseConfigured, supabase } from './supabase';
import { getIDBData, setIDBData, compressImage } from './idbStore';
import { sanitizeText } from './sanitizer';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './rateLimiter';

import heroHeroImg from '@/assets/Wedding Photography/0A3A4136.JPG';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'admin@luxphotography.com',
    role: 'super_admin',
    createdAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'admin-2',
    email: 'admin@abisproduction.com',
    role: 'super_admin',
    createdAt: '2026-07-01T00:00:00Z',
  },
];

const STORAGE_KEYS = {
  BOOKINGS: 'abis_photo_bookings_v5',
  SERVICES: 'abis_photo_services_v4',
  PACKAGES: 'abis_photo_packages_v3',
  BLOCKED_DATES: 'abis_photo_blocked_dates_v3',
  PORTFOLIO: 'abis_photo_portfolio_v4',
  PAYMENTS: 'abis_photo_payments_v3',
  SETTINGS: 'abis_photo_settings_v4',
  ADMIN_AUTH: 'abis_photo_admin_auth_v3',
  ADMIN_USERS: 'abis_photo_admin_users_v3',
};

// Flags to silently fallback to IndexedDB if remote Supabase buckets don't exist yet
let supabaseStorageDisabled = false;

// Silently flag if remote audit_logs table is missing to prevent repeated 404 console logs
let isAuditLogsDisabled = false;

function isUUID(str: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

function applyBookingFilter(query: any, idVal: string, refVal?: string) {
  const cleanId = (idVal || '').trim();
  const cleanRef = (refVal || '').trim();

  if (isUUID(cleanId)) {
    if (cleanRef) {
      return query.or(`id.eq.${cleanId},reference_number.eq.${cleanRef}`);
    }
    return query.or(`id.eq.${cleanId},reference_number.eq.${cleanId}`);
  }

  if (cleanRef && isUUID(cleanRef)) {
    return query.or(`id.eq.${cleanRef},reference_number.eq.${cleanId}`);
  }

  const targetRef = cleanRef || cleanId;
  return query.eq('reference_number', targetRef);
}

export const INITIAL_WEBSITE_SETTINGS: WebsiteSettings = {
  heroTitle: "Immortalizing Life's Moments With Elegance & Masterful Quality",
  heroSubtitle: "Premier 4K video and photography for weddings, birthdays, christenings, traditional engagements, and outdoor sessions. Book seamlessly online.",
  heroImage: heroHeroImg.src,
  aboutContent: "Founded on the pursuit of visual perfection, Abis Production is East Africa's luxury photography and videography studio dedicated to immortalizing royal heritage, emotional celebrations, and commercial editorials.",
  officeAddress: "Bole Atlas, Next to Bole Medhanealem, Addis Ababa, Ethiopia",
  phone: "+251 911 234 567",
  hotline: "+251 922 888 999",
  email: "info@abisproduction.com",
  instagramUrl: "https://instagram.com",
  tiktokUrl: "https://tiktok.com",
  facebookUrl: "https://facebook.com",
  whatsappUrl: "https://wa.me/251911234567"
};

export function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PS-${year}-${randomHex}`;
}

export function generateGalleryPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function dataURLtoBlob(dataurl: string): Blob {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    return new Blob([], { type: 'image/jpeg' });
  }
}

export function mapSupabaseServiceToService(row: any): Service {
  if (!row) return row;
  return {
    id: row.id ? String(row.id) : `serv-${Date.now()}`,
    title: row.title || '',
    category: row.category || '',
    description: row.description || '',
    coverImage: row.cover_image || row.coverImage || '',
    startingPrice: Number(row.starting_price ?? row.startingPrice ?? 0),
    estimatedDuration: row.estimated_duration || row.estimatedDuration || '',
    isEnabled: row.is_enabled !== undefined ? Boolean(row.is_enabled) : (row.isEnabled !== undefined ? Boolean(row.isEnabled) : true),
  };
}

export function mapSupabasePackageToPackage(row: any): Package {
  if (!row) return row;
  return {
    id: row.id ? String(row.id) : `pkg-${Date.now()}`,
    serviceId: row.service_id || row.serviceId || '',
    name: row.name || '',
    tagline: row.tagline || '',
    price: Number(row.price ?? 0),
    duration: row.duration || '',
    photographersCount: Number(row.photographers_count ?? row.photographersCount ?? 1),
    features: Array.isArray(row.features) ? row.features : (typeof row.features === 'string' ? JSON.parse(row.features) : []),
    isPopular: Boolean(row.is_popular ?? row.isPopular ?? false),
  };
}

export function mapSupabasePortfolioItemToPortfolioItem(row: any): PortfolioItem {
  if (!row) return row;
  return {
    id: row.id ? String(row.id) : `port-${Date.now()}`,
    title: row.title || '',
    category: row.category || 'Wedding',
    image: row.image || '',
    clientName: row.client_name || row.clientName || '',
    date: row.date || '',
    description: row.description || '',
    btsVideoUrl: row.bts_video_url || row.btsVideoUrl || '',
    testimonial: row.testimonial || undefined,
    isFeatured: Boolean(row.is_featured ?? row.isFeatured ?? false),
    isVideo: Boolean(row.is_video ?? row.isVideo ?? false),
    displayOrder: Number(row.display_order ?? row.displayOrder ?? 0),
  };
}

export function mapPortfolioItemToSupabaseRow(item: PortfolioItem): any {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    image: item.image,
    client_name: item.clientName || '',
    date: item.date || '',
    description: item.description || '',
    bts_video_url: item.btsVideoUrl || '',
    testimonial: item.testimonial || null,
    is_featured: Boolean(item.isFeatured),
    display_order: Number(item.displayOrder || 0),
  };
}

export function mapSupabaseBookingToBooking(row: any): Booking {
  if (!row) return row;
  return {
    id: row.id ? String(row.id) : `book-${Date.now()}`,
    referenceNumber: row.reference_number || row.referenceNumber || '',
    serviceId: row.service_id || row.serviceId || '',
    serviceName: row.service_name || row.serviceName || 'Photography Service',
    packageName: row.package_name || row.packageName || 'Standard Package',
    bookingDate: row.booking_date || row.bookingDate || '',
    bookingTime: row.booking_time || row.bookingTime || '',
    totalPrice: Number(row.total_price ?? row.totalPrice ?? 0),
    customerName: row.customer_name || row.customerName || '',
    customerPhone: row.customer_phone || row.customerPhone || '',
    customerEmail: row.customer_email || row.customerEmail || '',
    eventAddress: row.event_address || row.eventAddress || '',
    eventType: row.event_type || row.eventType || 'Event',
    numberOfGuests: Number(row.number_of_guests ?? row.numberOfGuests ?? 1),
    additionalNotes: row.additional_notes || row.additionalNotes || '',
    paymentMethod: row.payment_method || row.paymentMethod || 'Telebirr',
    amountPaid: Number(row.amount_paid ?? row.amountPaid ?? 0),
    transactionId: row.transaction_id || row.transactionId || '',
    receiptUrl: row.receipt_url || row.receiptUrl || '',
    receiptFileName: row.receipt_file_name || row.receiptFileName || '',
    receiptFileType: row.receipt_file_type || row.receiptFileType || '',
    paymentStatus: row.payment_status || row.paymentStatus || 'Pending Review',
    bookingStatus: row.booking_status || row.bookingStatus || 'Pending Payment Verification',
    galleryPin: row.gallery_pin || row.galleryPin || '123456',
    maxSelectionCount: Number(row.max_selection_count ?? row.maxSelectionCount ?? 30),
    selectionSubmittedAt: row.selection_submitted_at || row.selectionSubmittedAt || undefined,
    galleryPhotos: row.gallery_photos || row.galleryPhotos || [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

async function getStoredData<T>(key: string, defaultValue: T): Promise<T> {
  return getIDBData<T>(key, defaultValue);
}

async function setStoredData<T>(key: string, data: T): Promise<void> {
  return setIDBData<T>(key, data);
}

function setAuthCookie(authenticated: boolean) {
  if (typeof document === 'undefined') return;
  if (authenticated) {
    document.cookie = "abis_admin_token=authenticated; path=/; max-age=86400; SameSite=Lax";
  } else {
    document.cookie = "abis_admin_token=; path=/; max-age=0";
  }
}

export const bookingStore = {
  // --- SERVICES CRUD ---
  async getServices(): Promise<Service[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('services').select('*');
        if (!error && data && data.length > 0) {
          return data.map(mapSupabaseServiceToService);
        }
      } catch (e) {
        console.warn('getServices exception', e);
      }
    }
    const localServices = await getStoredData<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    return localServices.map(mapSupabaseServiceToService);
  },

  async saveService(service: Service): Promise<Service> {
    if (service.coverImage && service.coverImage.startsWith('data:image')) {
      service.coverImage = await compressImage(service.coverImage, 1920, 1920, 0.82);
    }
    const services = await getStoredData<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const index = services.findIndex((s) => s.id === service.id);
    let updated: Service[];
    if (index >= 0) {
      updated = [...services];
      updated[index] = service;
    } else {
      updated = [...services, service];
    }
    await setStoredData(STORAGE_KEYS.SERVICES, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('services').upsert([service]);
      } catch (e) {
        // Silently handled
      }
    }
    return service;
  },

  async deleteService(id: string): Promise<boolean> {
    const services = await getStoredData<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const updated = services.filter((s) => s.id !== id);
    await setStoredData(STORAGE_KEYS.SERVICES, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (e) {
        // Silently handled
      }
    }
    return true;
  },

  // --- PACKAGES CRUD ---
  async getPackages(serviceId?: string): Promise<Package[]> {
    let allPackages: Package[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('packages').select('*');
        if (!error && data && data.length > 0) {
          allPackages = data.map(mapSupabasePackageToPackage);
        }
      } catch (e) {
        console.warn('getPackages exception', e);
      }
    }
    if (allPackages.length === 0) {
      const stored = await getStoredData<Package[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
      allPackages = stored.map(mapSupabasePackageToPackage);
    }
    if (serviceId) {
      const sidClean = serviceId.toLowerCase();
      return allPackages.filter((p) => {
        const pSid = (p.serviceId || (p as any).service_id || '').toLowerCase();
        return pSid === sidClean;
      });
    }
    return allPackages;
  },

  async savePackage(pkg: Package): Promise<Package> {
    const packages = await getStoredData<Package[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    const index = packages.findIndex((p) => p.id === pkg.id);
    let updated: Package[];
    if (index >= 0) {
      updated = [...packages];
      updated[index] = pkg;
    } else {
      updated = [...packages, pkg];
    }
    await setStoredData(STORAGE_KEYS.PACKAGES, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('packages').upsert([pkg]);
      } catch (e) {
        // Silently handled
      }
    }
    return pkg;
  },

  async deletePackage(id: string): Promise<boolean> {
    const packages = await getStoredData<Package[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    const updated = packages.filter((p) => p.id !== id);
    await setStoredData(STORAGE_KEYS.PACKAGES, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('packages').delete().eq('id', id);
      } catch (e) {
        // Silently handled
      }
    }
    return true;
  },

  // --- PORTFOLIO CRUD & COMPRESSED MEDIA UPLOADS ---
  async uploadMediaFile(file: File): Promise<string> {
    if (!file) return '';

    const MAX_VIDEO_SIZE = 524288000; // 500MB limit
    if (file.type.startsWith('video/')) {
      if (file.size > MAX_VIDEO_SIZE) {
        throw new Error(`Video file size exceeds maximum limit of 500MB (${(file.size / (1024 * 1024)).toFixed(1)}MB provided).`);
      }

      if (isSupabaseConfigured && supabase && !supabaseStorageDisabled) {
        const fileExt = file.name.split('.').pop() || 'mp4';
        const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file, { upsert: true, contentType: file.type });

        if (error) {
          console.error('Supabase storage video upload error:', error);
          throw new Error(`Supabase video upload failed: ${error.message}`);
        }

        if (data) {
          const { data: publicUrlData } = supabase.storage
            .from('portfolio')
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      }

      // Persistent DataURL for local video uploads in demo mode
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = (e) => reject(new Error('Failed to read video file.'));
        reader.readAsDataURL(file);
      });
    }

    if (isSupabaseConfigured && supabase && !supabaseStorageDisabled && file.type.startsWith('image/')) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpeg';
        const fileName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const uploadPromise = supabase.storage
          .from('portfolio')
          .upload(filePath, file, { upsert: true, contentType: file.type });
        const timeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Storage upload timeout')), 5000)
        );

        const res = (await Promise.race([uploadPromise, timeoutPromise])) as any;
        if (res?.data && !res?.error) {
          const { data: publicUrlData } = supabase.storage
            .from('portfolio')
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        } else if (res?.error) {
          console.warn('Supabase storage image upload warning:', res.error);
        }
      } catch (e) {
        console.warn('Image upload exception/timeout, using local compressed dataURL:', e);
      }
    }

    // Fast client-side image compression to lightweight dataURL
    const compressedDataUrl = await compressImage(file, 1600, 1600, 0.78);
    if (compressedDataUrl && compressedDataUrl.length > 50) {
      return compressedDataUrl;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  },

  async uploadReceiptFile(file: File, referenceNumber?: string): Promise<string> {
    if (!file) return '';

    const MAX_RECEIPT_SIZE = 20971520; // 20MB limit
    if (file.size > MAX_RECEIPT_SIZE) {
      throw new Error(`Receipt file size exceeds maximum limit of 20MB (${(file.size / (1024 * 1024)).toFixed(1)}MB provided).`);
    }

    const ref = referenceNumber ? referenceNumber.replace(/[^a-zA-Z0-9_-]/g, '_') : `ref_${Date.now()}`;
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `receipts/${ref}/${Date.now()}_${sanitizedName}`;

    if (isSupabaseConfigured && supabase && !supabaseStorageDisabled) {
      try {
        const { data, error } = await supabase.storage
          .from('receipts')
          .upload(filePath, file, { upsert: true, contentType: file.type });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        } else if (error) {
          console.warn('Supabase receipts upload warning:', error);
        }
      } catch (e) {
        console.warn('Receipt upload exception:', e);
      }
    }

    if (file.type.startsWith('image/')) {
      const compressed = await compressImage(file, 1600, 1600, 0.82);
      if (compressed && compressed.length > 50) return compressed;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  },

  async getPortfolioItems(): Promise<PortfolioItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('portfolio_items').select('*').order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(mapSupabasePortfolioItemToPortfolioItem);
        }
      } catch (e) {
        console.warn('getPortfolioItems exception', e);
      }
    }
    const stored = await getStoredData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, PORTFOLIO_ITEMS);
    return stored.map(mapSupabasePortfolioItemToPortfolioItem);
  },

  async savePortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
    if (item.image && item.image.startsWith('data:image')) {
      item.image = await compressImage(item.image, 1920, 1920, 0.82);
    }
    const items = await getStoredData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, PORTFOLIO_ITEMS);
    const index = items.findIndex((p) => p.id === item.id);
    let updated: PortfolioItem[];
    if (index >= 0) {
      updated = [...items];
      updated[index] = item;
    } else {
      updated = [item, ...items];
    }
    await setStoredData(STORAGE_KEYS.PORTFOLIO, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const dbRow = mapPortfolioItemToSupabaseRow(item);
        const { error } = await supabase.from('portfolio_items').upsert([dbRow]);
        if (error) {
          console.warn('Supabase portfolio item save error:', error.message);
        }
      } catch (e) {
        console.warn('Supabase portfolio item save exception:', e);
      }
    }
    return item;
  },

  async saveMultiplePortfolioItems(newItems: PortfolioItem[]): Promise<PortfolioItem[]> {
    const existing = await getStoredData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, PORTFOLIO_ITEMS);
    const processed: PortfolioItem[] = [];

    for (const item of newItems) {
      let finalImg = item.image;
      if (finalImg && finalImg.startsWith('data:image')) {
        finalImg = await compressImage(finalImg, 1920, 1920, 0.82);
      }
      processed.push({ ...item, image: finalImg });
    }

    const updated = [...processed, ...existing];
    await setStoredData(STORAGE_KEYS.PORTFOLIO, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const dbRows = processed.map(mapPortfolioItemToSupabaseRow);
        await supabase.from('portfolio_items').upsert(dbRows);
      } catch (e) {
        // Silently handled
      }
    }
    return updated;
  },

  async deletePortfolioItem(id: string): Promise<boolean> {
    const items = await getStoredData<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, PORTFOLIO_ITEMS);
    const updated = items.filter((p) => p.id !== id);
    await setStoredData(STORAGE_KEYS.PORTFOLIO, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('portfolio_items').delete().eq('id', id);
      } catch (e) {
        // Silently handled
      }
    }
    return true;
  },

  async reorderPortfolioItems(items: PortfolioItem[]): Promise<PortfolioItem[]> {
    const reordered = items.map((item, idx) => ({ ...item, displayOrder: idx }));
    await setStoredData(STORAGE_KEYS.PORTFOLIO, reordered);

    if (isSupabaseConfigured && supabase) {
      try {
        for (const item of reordered) {
          await supabase.from('portfolio_items').update({ display_order: item.displayOrder }).eq('id', item.id);
        }
      } catch (e) {
        // Silently handled
      }
    }
    return reordered;
  },

  // --- PAYMENT SETTINGS CRUD ---
  async getPaymentSettings(): Promise<PaymentAccountDetails[]> {
    let supabaseSettings: PaymentAccountDetails[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('payment_settings').select('*');
        if (!error && data && data.length > 0) {
          supabaseSettings = data.map((row: any) => ({
            method: row.method || 'Telebirr',
            accountName: row.account_name ?? row.accountName ?? '',
            accountNumber: row.account_number ?? row.accountNumber ?? '',
            instructions: row.instructions ?? '',
            qrCodeUrl: row.qr_code_url ?? row.qrCodeUrl ?? '',
            color: row.color ?? 'from-gold-500 to-amber-600',
          }));
        }
      } catch (e) {
        console.warn('getPaymentSettings exception', e);
      }
    }
    const localSettings = await getStoredData<PaymentAccountDetails[]>(STORAGE_KEYS.PAYMENTS, PAYMENT_METHODS);
    if (supabaseSettings.length > 0) {
      const mergedMap = new Map<string, PaymentAccountDetails>();
      localSettings.forEach((p) => mergedMap.set(p.method, p));
      supabaseSettings.forEach((p) => mergedMap.set(p.method, p));
      return Array.from(mergedMap.values());
    }
    return localSettings;
  },

  async savePaymentSetting(setting: PaymentAccountDetails): Promise<PaymentAccountDetails> {
    const current = await getStoredData<PaymentAccountDetails[]>(STORAGE_KEYS.PAYMENTS, PAYMENT_METHODS);
    const index = current.findIndex((p) => p.method === setting.method);
    let updated: PaymentAccountDetails[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = setting;
    } else {
      updated = [...current, setting];
    }
    await setStoredData(STORAGE_KEYS.PAYMENTS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const dbRow = {
          method: setting.method,
          account_name: setting.accountName,
          account_number: setting.accountNumber,
          instructions: setting.instructions,
          qr_code_url: setting.qrCodeUrl || '',
          color: setting.color || 'from-gold-500 to-amber-600',
        };
        await supabase.from('payment_settings').upsert([dbRow], { onConflict: 'method' });
      } catch (e) {
        console.warn('savePaymentSetting error:', e);
      }
    }
    return setting;
  },

  async saveAllPaymentSettings(settings: PaymentAccountDetails[]): Promise<PaymentAccountDetails[]> {
    await setStoredData(STORAGE_KEYS.PAYMENTS, settings);

    if (isSupabaseConfigured && supabase) {
      try {
        const dbRows = settings.map((s) => ({
          method: s.method,
          account_name: s.accountName,
          account_number: s.accountNumber,
          instructions: s.instructions,
          qr_code_url: s.qrCodeUrl || '',
          color: s.color || 'from-gold-500 to-amber-600',
        }));
        await supabase.from('payment_settings').upsert(dbRows, { onConflict: 'method' });
      } catch (e) {
        console.warn('saveAllPaymentSettings error:', e);
      }
    }
    return settings;
  },

  // --- WEBSITE CONTENT SETTINGS CRUD ---
  async getWebsiteSettings(): Promise<WebsiteSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').eq('key', 'main_config').maybeSingle();
        if (!error && data && data.value) {
          return data.value as WebsiteSettings;
        }
      } catch (e) {
        console.warn('getWebsiteSettings exception', e);
      }
    }
    return getStoredData<WebsiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_WEBSITE_SETTINGS);
  },

  async saveWebsiteSettings(settings: WebsiteSettings): Promise<WebsiteSettings> {
    if (settings.heroImage && settings.heroImage.startsWith('data:image')) {
      settings.heroImage = await compressImage(settings.heroImage, 1920, 1920, 0.82);
    }
    await setStoredData(STORAGE_KEYS.SETTINGS, settings);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('site_settings').upsert([{ key: 'main_config', value: settings }]);
      } catch (e) {
        // Silently handled
      }
    }
    return settings;
  },

  // --- BOOKINGS & RECEIPTS CRUD ---
  async getBookings(): Promise<Booking[]> {
    let supabaseBookings: Booking[] = [];
    let isSupabaseLoaded = false;
    if (isSupabaseConfigured && supabase) {
      try {
        const fetchPromise = supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        const timeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Supabase getBookings timeout')), 4000)
        );
        const res = (await Promise.race([fetchPromise, timeoutPromise])) as any;
        if (res?.data && !res.error) {
          supabaseBookings = res.data.map(mapSupabaseBookingToBooking);
          isSupabaseLoaded = true;
        } else if (res?.error) {
          console.warn('Supabase getBookings notice:', res.error.message);
        }
      } catch (e) {
        console.warn('Supabase getBookings timeout/exception, using local storage:', e);
      }
    }
    const localBookings = await getStoredData<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const deletedIds = await getStoredData<string[]>('abis_deleted_booking_ids', ['ps-2026-884920', 'ps-2026-449102', 'book-101', 'book-102']);
    const deletedSet = new Set(deletedIds.map((id) => id.toLowerCase()));

    // Filter out locally deleted IDs
    const validLocalBookings = localBookings.filter((b) => {
      const idKey = (b.id || '').toLowerCase();
      const refKey = (b.referenceNumber || '').toLowerCase();
      return !deletedSet.has(idKey) && !deletedSet.has(refKey);
    });

    const combinedMap = new Map<string, Booking>();

    // Populated from Supabase DB
    supabaseBookings.forEach((b) => {
      const key = (b.referenceNumber || b.id).toLowerCase();
      if (!deletedSet.has(key)) {
        combinedMap.set(key, b);
      }
    });

    // If Supabase returned a valid query response, purge local cache of bookings deleted directly from DB
    if (isSupabaseLoaded) {
      const supabaseKeys = new Set(
        supabaseBookings.map((b) => (b.referenceNumber || b.id).toLowerCase())
      );

      const activeLocal = validLocalBookings.filter((b) => {
        const key = (b.referenceNumber || b.id || '').toLowerCase();
        if (supabaseKeys.has(key)) return true;
        // Keep offline/recent local bookings (created within last 10 minutes)
        const ageMs = Date.now() - new Date(b.createdAt || 0).getTime();
        return ageMs < 10 * 60 * 1000;
      });

      await setStoredData(STORAGE_KEYS.BOOKINGS, activeLocal);
    }

    validLocalBookings.forEach((b) => {
      const key = (b.referenceNumber || b.id || '').toLowerCase();
      if (!key || deletedSet.has(key)) return;
      const existing = combinedMap.get(key);
      if (!existing) {
        combinedMap.set(key, b);
      } else {
        if (b.paymentStatus && b.paymentStatus !== 'Pending Review') {
          existing.paymentStatus = b.paymentStatus;
        }
        if (b.bookingStatus && b.bookingStatus !== 'Pending Payment Verification') {
          existing.bookingStatus = b.bookingStatus;
        }
        if (b.galleryPhotos && b.galleryPhotos.length > 0) {
          existing.galleryPhotos = b.galleryPhotos;
        }
        if (b.galleryPin) {
          existing.galleryPin = b.galleryPin;
        }
        if (b.amountPaid && b.amountPaid > 0) {
          existing.amountPaid = b.amountPaid;
        }
      }
    });

    return Array.from(combinedMap.values());
  },

  async createBooking(bookingData: Omit<Booking, 'id' | 'referenceNumber' | 'createdAt' | 'galleryPin'>): Promise<Booking> {
    const referenceNumber = generateReferenceNumber();
    const galleryPin = generateGalleryPin();
    
    let receiptUrl = bookingData.receiptUrl;
    if (receiptUrl && receiptUrl.startsWith('data:image')) {
      receiptUrl = await compressImage(receiptUrl, 1920, 1920, 0.82);
    }

    const newBooking: Booking = {
      ...bookingData,
      customerName: sanitizeText(bookingData.customerName),
      customerPhone: sanitizeText(bookingData.customerPhone),
      customerEmail: sanitizeText(bookingData.customerEmail),
      eventAddress: sanitizeText(bookingData.eventAddress),
      eventType: sanitizeText(bookingData.eventType),
      additionalNotes: sanitizeText(bookingData.additionalNotes || ''),
      receiptUrl,
      id: `book-${Date.now()}`,
      referenceNumber,
      galleryPin,
      galleryPhotos: [],
      createdAt: new Date().toISOString(),
    };

    const currentBookings = await getStoredData<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updatedBookings = [newBooking, ...currentBookings];
    await setStoredData(STORAGE_KEYS.BOOKINGS, updatedBookings);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bookings').insert([
          {
            reference_number: newBooking.referenceNumber,
            service_id: newBooking.serviceId,
            service_name: newBooking.serviceName,
            package_name: newBooking.packageName,
            booking_date: newBooking.bookingDate,
            booking_time: newBooking.bookingTime,
            total_price: newBooking.totalPrice,
            customer_name: newBooking.customerName,
            customer_phone: newBooking.customerPhone,
            customer_email: newBooking.customerEmail,
            event_address: newBooking.eventAddress,
            event_type: newBooking.eventType,
            number_of_guests: newBooking.numberOfGuests,
            additional_notes: newBooking.additionalNotes,
            payment_method: newBooking.paymentMethod,
            amount_paid: newBooking.amountPaid,
            transaction_id: newBooking.transactionId,
            receipt_url: newBooking.receiptUrl,
            receipt_file_name: newBooking.receiptFileName,
            receipt_file_type: newBooking.receiptFileType,
            payment_status: newBooking.paymentStatus,
            booking_status: newBooking.bookingStatus,
            gallery_pin: newBooking.galleryPin,
          },
        ]);
      } catch (err) {
        // Silently handled
      }
    }

    return newBooking;
  },

  async lookupBooking(referenceNumber: string, email: string): Promise<Booking | null> {
    const cleanRef = sanitizeText(referenceNumber).toUpperCase();
    const cleanEmail = sanitizeText(email).toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('lookup_client_booking', {
          p_ref_number: cleanRef,
          p_email: cleanEmail,
        });
        if (!error && data && data.length > 0) {
          return mapSupabaseBookingToBooking(data[0]);
        }
      } catch (e) {
        console.warn('lookupBooking RPC exception', e);
      }
    }

    const allBookings = await this.getBookings();
    const found = allBookings.find(
      (b) =>
        ((b.referenceNumber && b.referenceNumber.toUpperCase() === cleanRef) ||
         (b.id && b.id.toUpperCase() === cleanRef)) &&
        b.customerEmail && b.customerEmail.toLowerCase() === cleanEmail
    );

    return found || null;
  },

  async lookupClientGallery(referenceNumber: string, pin: string): Promise<Booking | null> {
    const cleanRef = sanitizeText(referenceNumber).toUpperCase();
    const cleanPin = sanitizeText(pin);

    // Rate Limiting Security Check against brute-force PIN guessing
    const rateLimit = checkRateLimit(`pin_${cleanRef}`);
    if (!rateLimit.allowed) {
      throw new Error(`Too many failed PIN attempts. Access locked for ${rateLimit.retryAfterSeconds} seconds.`);
    }

    const allBookings = await this.getBookings();
    const found = allBookings.find(
      (b) =>
        ((b.referenceNumber && b.referenceNumber.toUpperCase() === cleanRef) ||
         (b.id && b.id.toUpperCase() === cleanRef)) &&
        (b.galleryPin === cleanPin || (b.galleryPin && b.galleryPin.substring(0, 6) === cleanPin))
    );

    if (!found) {
      recordFailedAttempt(`pin_${cleanRef}`);
      return null;
    }

    resetRateLimit(`pin_${cleanRef}`);
    return found;
  },

  // --- AUDIT LOGS CRUD ---
  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase && !isAuditLogsDisabled) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          isAuditLogsDisabled = true;
        } else if (data) {
          return data.map((row: any) => ({
            id: String(row.id),
            actorEmail: row.actor_email || 'system',
            action: row.action || 'ACTION',
            targetTable: row.target_table || 'unknown',
            targetId: row.target_id || '',
            details: row.details || {},
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      } catch (e) {
        isAuditLogsDisabled = true;
      }
    }
    return getStoredData<AuditLog[]>('abis_photo_audit_logs', []);
  },

  async createAuditLog(action: string, targetTable: string, targetId: string = '', details: Record<string, any> = {}): Promise<void> {
    const activeAdminEmail = typeof window !== 'undefined' ? localStorage.getItem('abis_admin_session_email') || 'admin@abisproduction.com' : 'system';
    const logItem: AuditLog = {
      id: `audit-${Date.now()}`,
      actorEmail: activeAdminEmail,
      action,
      targetTable,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    };
    const current = await getStoredData<AuditLog[]>('abis_photo_audit_logs', []);
    await setStoredData('abis_photo_audit_logs', [logItem, ...current]);

    if (isSupabaseConfigured && supabase && !isAuditLogsDisabled) {
      try {
        await supabase.from('audit_logs').insert([{
          actor_email: activeAdminEmail,
          action,
          target_table: targetTable,
          target_id: targetId,
          details,
        }]);
      } catch (e) {
        isAuditLogsDisabled = true;
      }
    }
  },

  async updateBookingStatus(
    bookingId: string, 
    paymentStatus: PaymentStatusType, 
    bookingStatus: BookingStatusType
  ): Promise<Booking | null> {
    const allBookings = await this.getBookings();
    const cleanId = String(bookingId).toLowerCase();
    
    let target = allBookings.find(
      (b) => String(b.id).toLowerCase() === cleanId || String(b.referenceNumber).toLowerCase() === cleanId
    );

    if (!target) return null;

    target.paymentStatus = paymentStatus;
    target.bookingStatus = bookingStatus;
    
    const currentBookings = await getStoredData<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const index = currentBookings.findIndex(
      (b) => String(b.id).toLowerCase() === cleanId || String(b.referenceNumber).toLowerCase() === cleanId
    );
    if (index >= 0) {
      currentBookings[index].paymentStatus = paymentStatus;
      currentBookings[index].bookingStatus = bookingStatus;
      await setStoredData(STORAGE_KEYS.BOOKINGS, currentBookings);
    } else {
      await setStoredData(STORAGE_KEYS.BOOKINGS, [target, ...currentBookings]);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let q = supabase
          .from('bookings')
          .update({
            payment_status: paymentStatus,
            booking_status: bookingStatus,
          });
        q = applyBookingFilter(q, target.id, target.referenceNumber);
        await q;
      } catch (e) {
        console.warn('Supabase status update fallback', e);
      }
    }

    return target;
  },

  async deleteBooking(bookingId: string): Promise<boolean> {
    const cleanId = (bookingId || '').trim().toLowerCase();
    if (!cleanId) return false;

    // 1. Record deleted ID in tracking list
    const deletedIds = await getStoredData<string[]>('abis_deleted_booking_ids', []);
    if (!deletedIds.includes(cleanId)) {
      await setStoredData('abis_deleted_booking_ids', [...deletedIds, cleanId]);
    }

    // 2. Remove from local IndexedDB storage
    const currentBookings = await getStoredData<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updatedBookings = currentBookings.filter(
      (b) =>
        (b.id || '').trim().toLowerCase() !== cleanId &&
        (b.referenceNumber || '').trim().toLowerCase() !== cleanId
    );
    await setStoredData(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // 3. Delete from Supabase Database
    if (isSupabaseConfigured && supabase) {
      try {
        let q = supabase.from('bookings').delete();
        q = applyBookingFilter(q, bookingId);
        await q;
      } catch (e) {
        console.warn('Supabase deleteBooking exception:', e);
      }
    }

    return true;
  },

  async cancelBooking(bookingId: string, customerEmail: string): Promise<boolean> {
    const currentBookings = await getStoredData<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const index = currentBookings.findIndex(
      (b) => (b.id === bookingId || b.referenceNumber === bookingId) && b.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );

    if (index === -1) return false;

    const target = currentBookings[index];
    if (target.bookingStatus === 'Booking Confirmed' || target.bookingStatus === 'Completed') {
      return false;
    }

    target.bookingStatus = 'Cancelled';
    target.paymentStatus = 'Rejected';
    await setStoredData(STORAGE_KEYS.BOOKINGS, currentBookings);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('bookings')
          .update({
            booking_status: 'Cancelled',
            payment_status: 'Rejected',
          })
          .eq('reference_number', target.referenceNumber);
      } catch (e) {
        // Silently handled
      }
    }

    return true;
  },

  async updateGalleryPhotos(bookingId: string, photos: ClientGalleryPhoto[]): Promise<boolean> {
    const currentBookings = await getStoredData<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const cleanId = (bookingId || '').trim().toLowerCase();
    const index = currentBookings.findIndex((b) =>
      (b.id && b.id.trim().toLowerCase() === cleanId) ||
      (b.referenceNumber && b.referenceNumber.trim().toLowerCase() === cleanId)
    );
    if (index !== -1) {
      currentBookings[index].galleryPhotos = photos;
      await setStoredData(STORAGE_KEYS.BOOKINGS, currentBookings);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let q = supabase
          .from('bookings')
          .update({ gallery_photos: photos });
        q = applyBookingFilter(q, bookingId);
        await q;
      } catch (e) {
        // Silently handled
      }
    }
    return true;
  },

  async uploadOrderShotPhotos(bookingId: string, photos: ClientGalleryPhoto[]): Promise<Booking | null> {
    const currentBookings = await getStoredData<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const cleanId = (bookingId || '').trim().toLowerCase();
    let index = currentBookings.findIndex((b) =>
      (b.id && b.id.trim().toLowerCase() === cleanId) ||
      (b.referenceNumber && b.referenceNumber.trim().toLowerCase() === cleanId)
    );

    let updatedBooking: Booking;
    if (index !== -1) {
      currentBookings[index].galleryPhotos = photos;
      currentBookings[index].bookingStatus = 'Photos Uploaded';
      updatedBooking = currentBookings[index];
      await setStoredData(STORAGE_KEYS.BOOKINGS, currentBookings);
    } else {
      const matchInitial = INITIAL_BOOKINGS.find((b) =>
        (b.id && b.id.trim().toLowerCase() === cleanId) ||
        (b.referenceNumber && b.referenceNumber.trim().toLowerCase() === cleanId)
      );
      if (matchInitial) {
        updatedBooking = { ...matchInitial, galleryPhotos: photos, bookingStatus: 'Photos Uploaded' };
      } else {
        updatedBooking = {
          id: bookingId,
          referenceNumber: bookingId.startsWith('PS-') ? bookingId : `PS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          serviceId: 'serg',
          serviceName: 'Photography Session',
          packageName: 'Standard Package',
          bookingDate: new Date().toISOString().split('T')[0],
          bookingTime: '10:00 AM',
          totalPrice: 0,
          customerName: 'Client',
          customerPhone: '',
          customerEmail: '',
          eventType: 'Studio Session',
          eventAddress: 'Studio',
          paymentMethod: 'Telebirr',
          amountPaid: 0,
          paymentStatus: 'Verified',
          bookingStatus: 'Photos Uploaded',
          galleryPin: generateGalleryPin(),
          galleryPhotos: photos,
          createdAt: new Date().toISOString(),
        };
      }
      await setStoredData(STORAGE_KEYS.BOOKINGS, [updatedBooking, ...currentBookings]);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let q = supabase
          .from('bookings')
          .update({
            gallery_photos: photos,
            booking_status: 'Photos Uploaded',
          });
        q = applyBookingFilter(q, bookingId);
        await q;
      } catch (e) {
        // Silently handled
      }
    }
    return updatedBooking;
  },

  async submitCustomerPhotoSelection(bookingId: string, photos: ClientGalleryPhoto[]): Promise<Booking | null> {
    const currentBookings = await getStoredData<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const cleanId = (bookingId || '').trim().toLowerCase();
    let index = currentBookings.findIndex((b) =>
      (b.id && b.id.trim().toLowerCase() === cleanId) ||
      (b.referenceNumber && b.referenceNumber.trim().toLowerCase() === cleanId)
    );

    let updatedBooking: Booking;
    if (index !== -1) {
      currentBookings[index].galleryPhotos = photos;
      currentBookings[index].bookingStatus = 'Selection Submitted';
      currentBookings[index].selectionSubmittedAt = new Date().toISOString();
      updatedBooking = currentBookings[index];
      await setStoredData(STORAGE_KEYS.BOOKINGS, currentBookings);
    } else {
      const matchInitial = INITIAL_BOOKINGS.find((b) =>
        (b.id && b.id.trim().toLowerCase() === cleanId) ||
        (b.referenceNumber && b.referenceNumber.trim().toLowerCase() === cleanId)
      );
      if (matchInitial) {
        updatedBooking = {
          ...matchInitial,
          galleryPhotos: photos,
          bookingStatus: 'Selection Submitted',
          selectionSubmittedAt: new Date().toISOString(),
        };
      } else {
        updatedBooking = {
          id: bookingId,
          referenceNumber: bookingId.startsWith('PS-') ? bookingId : `PS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          serviceId: 'serg',
          serviceName: 'Photography Session',
          packageName: 'Standard Package',
          bookingDate: new Date().toISOString().split('T')[0],
          bookingTime: '10:00 AM',
          totalPrice: 0,
          customerName: 'Client',
          customerPhone: '',
          customerEmail: '',
          eventType: 'Studio Session',
          eventAddress: 'Studio',
          paymentMethod: 'Telebirr',
          amountPaid: 0,
          paymentStatus: 'Verified',
          bookingStatus: 'Selection Submitted',
          selectionSubmittedAt: new Date().toISOString(),
          galleryPin: generateGalleryPin(),
          galleryPhotos: photos,
          createdAt: new Date().toISOString(),
        };
      }
      await setStoredData(STORAGE_KEYS.BOOKINGS, [updatedBooking, ...currentBookings]);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let q = supabase
          .from('bookings')
          .update({
            gallery_photos: photos,
            booking_status: 'Selection Submitted',
          });
        q = applyBookingFilter(q, bookingId);
        await q;
      } catch (e) {
        // Silently handled
      }
    }
    return updatedBooking;
  },

  async getBlockedDates(): Promise<BlockedDate[]> {
    return getStoredData<BlockedDate[]>(STORAGE_KEYS.BLOCKED_DATES, [
      { id: 'b-1', blockedDate: '2026-08-15', reason: 'Studio Private Maintenance' },
    ]);
  },

  async toggleBlockDate(dateStr: string, timeSlot?: string, reason: string = 'Unavailable'): Promise<BlockedDate[]> {
    const current = await getStoredData<BlockedDate[]>(STORAGE_KEYS.BLOCKED_DATES, []);
    const existingIndex = current.findIndex(
      (b) => b.blockedDate === dateStr && b.timeSlot === timeSlot
    );

    let updated: BlockedDate[];
    if (existingIndex >= 0) {
      updated = current.filter((_, i) => i !== existingIndex);
    } else {
      updated = [...current, { id: `b-${Date.now()}`, blockedDate: dateStr, timeSlot, reason }];
    }
    await setStoredData(STORAGE_KEYS.BLOCKED_DATES, updated);
    return updated;
  },

  async checkSlotAvailability(dateStr: string, slot: string): Promise<boolean> {
    const blockedDates = await this.getBlockedDates();
    const isDateBlocked = blockedDates.some(
      (b) => b.blockedDate === dateStr && (!b.timeSlot || b.timeSlot === slot)
    );
    if (isDateBlocked) return false;

    const bookings = await this.getBookings();
    const isBooked = bookings.some(
      (b) =>
        b.bookingDate === dateStr &&
        b.bookingTime === slot &&
        b.bookingStatus !== 'Cancelled'
    );

    return !isBooked;
  },

  // --- Admin Security & Passcode ---
  isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  setAdminAuthenticated(status: boolean): void {
    if (typeof window === 'undefined') return;
    if (status) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      setAuthCookie(true);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      setAuthCookie(false);
    }
  },

  async ensureAdminUserInDB(email: string, role: AdminUserRole = 'super_admin'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('admin_users').upsert(
          [{ email: email.toLowerCase(), role }],
          { onConflict: 'email' }
        );
      } catch (e) {
        // Silently handled
      }
    }
  },

  // --- ADMIN USERS / STAFF MANAGEMENT ---
  async getAdminUsers(): Promise<AdminUser[]> {
    let supabaseAdmins: AdminUser[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('admin_users').select('*');
        if (!error && data && data.length > 0) {
          supabaseAdmins = data.map((r: any) => ({
            id: r.id ? String(r.id) : `admin-${Date.now()}`,
            email: r.email || '',
            role: (r.role as AdminUserRole) || 'admin',
            createdAt: r.created_at || r.createdAt || new Date().toISOString(),
          }));
        }
      } catch (e) {
        // Fallback
      }
    }

    const localAdmins = await getStoredData<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS, INITIAL_ADMIN_USERS);
    const combinedMap = new Map<string, AdminUser>();

    INITIAL_ADMIN_USERS.forEach((a) => combinedMap.set(a.email.toLowerCase(), a));
    localAdmins.forEach((a) => combinedMap.set(a.email.toLowerCase(), a));
    supabaseAdmins.forEach((a) => combinedMap.set(a.email.toLowerCase(), a));

    return Array.from(combinedMap.values());
  },

  async createAdminUser(
    email: string,
    role: AdminUserRole = 'admin',
    password: string = 'AdminPassword123!'
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const currentAdmins = await this.getAdminUsers();
    if (currentAdmins.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `An admin account with email "${cleanEmail}" already exists.` };
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email: cleanEmail,
      role,
      createdAt: new Date().toISOString(),
    };

    const updatedAdmins = [...currentAdmins, newAdmin];
    await setStoredData(STORAGE_KEYS.ADMIN_USERS, updatedAdmins);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('admin_users').upsert(
          [{ email: cleanEmail, role }],
          { onConflict: 'email' }
        );
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { role, name: 'Studio Staff' } },
        });
      } catch (e) {
        // Silently handled
      }
    }

    return { success: true, user: newAdmin };
  },

  async deleteAdminUser(emailOrId: string): Promise<boolean> {
    const cleanKey = emailOrId.toLowerCase();
    const currentAdmins = await this.getAdminUsers();
    const updated = currentAdmins.filter(
      (a) => a.id.toLowerCase() !== cleanKey && a.email.toLowerCase() !== cleanKey
    );
    await setStoredData(STORAGE_KEYS.ADMIN_USERS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('admin_users').delete().or(`id.eq.${emailOrId},email.eq.${cleanKey}`);
      } catch (e) {
        // Silently handled
      }
    }

    return true;
  },

  async updateAdminUserRole(emailOrId: string, role: AdminUserRole): Promise<boolean> {
    const cleanKey = emailOrId.toLowerCase();
    const currentAdmins = await this.getAdminUsers();
    const target = currentAdmins.find(
      (a) => a.id.toLowerCase() !== cleanKey || a.email.toLowerCase() === cleanKey
    );

    if (target) {
      target.role = role;
      await setStoredData(STORAGE_KEYS.ADMIN_USERS, currentAdmins);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('admin_users')
          .update({ role })
          .or(`id.eq.${emailOrId},email.eq.${cleanKey}`);
      } catch (e) {
        // Silently handled
      }
    }

    return true;
  },

  // --- Supabase Authentication Helpers ---
  async loginAdminWithSupabase(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Step 1: Authenticate via Supabase Auth signInWithPassword
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (error) {
          return {
            success: false,
            error: error.message || 'Invalid email or password. Please verify your credentials or run seed_admin.sql in Supabase.',
          };
        }

        if (data.session || data.user) {
          const authEmail = data.user?.email?.trim().toLowerCase() || cleanEmail;
          const { data: adminRow } = await supabase
            .from('admin_users')
            .select('email')
            .eq('email', authEmail)
            .maybeSingle();

          if (!adminRow && authEmail !== 'admin@luxphotography.com' && authEmail !== 'admin@abisproduction.com') {
            await supabase.auth.signOut();
            return {
              success: false,
              error: 'Access denied. Account authenticated, but it is not registered in public.admin_users.',
            };
          }

          this.setAdminAuthenticated(true);
          return { success: true };
        }

        return { success: false, error: 'Authentication failed. Invalid email or password.' };
      } catch (err: any) {
        const msg = err?.message || 'An unexpected authentication error occurred.';
        return { success: false, error: typeof msg === 'string' ? msg : 'Authentication error.' };
      }
    }

    // Fallback for local demo mode without Supabase connection
    const admins = await this.getAdminUsers();
    const isRegisteredAdmin = admins.some((a) => a.email.toLowerCase() === cleanEmail);

    if (!isRegisteredAdmin && !cleanEmail.includes('admin') && cleanEmail !== 'admin@luxphotography.com') {
      return { success: false, error: 'Only authorized administrator or staff accounts can log in.' };
    }

    this.setAdminAuthenticated(true);
    await this.ensureAdminUserInDB(cleanEmail, 'super_admin');
    return { success: true };
  },

  async logoutAdmin(): Promise<void> {
    this.setAdminAuthenticated(false);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // Silently handled
      }
    }
  }
};
