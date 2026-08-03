export type ServiceCategory = 
  | 'Wedding'
  | 'Graduation'
  | 'Birthday'
  | 'Family'
  | 'Studio'
  | 'Corporate'
  | 'Pre-Wedding'
  | 'Outdoor'
  | 'Engagement'
  | 'Christening';

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  startingPrice: number;
  estimatedDuration: string;
  isEnabled?: boolean;
}

export interface Package {
  id: string;
  serviceId: string;
  name: string;
  tagline: string;
  price: number;
  duration: string;
  photographersCount: number;
  features: string[];
  isPopular?: boolean;
}

export type PaymentMethodType = 'Telebirr' | 'CBE Birr' | 'Bank Transfer' | 'Cash Deposit';

export type PaymentStatusType = 'Pending Review' | 'Verified' | 'Rejected';

export type BookingStatusType = 
  | 'Pending Payment Verification'
  | 'Payment Verified'
  | 'Payment Confirmed'
  | 'Booking Confirmed'
  | 'Photos Uploaded'
  | 'Awaiting Selection'
  | 'Selection Submitted'
  | 'Completed'
  | 'Cancelled';

export interface ClientGalleryPhoto {
  id: string;
  title: string;
  url: string;
  highResUrl?: string;
  category?: string;
  isFavorite?: boolean;
  status?: 'Selected' | 'Rejected' | 'Pending';
  comment?: string;
}

export interface Booking {
  id: string;
  referenceNumber: string; // e.g. PS-2026-9B4E12
  serviceId: string;
  serviceName: string;
  packageName: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // e.g. "08:00 AM"
  totalPrice: number;
  
  // Customer info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventAddress: string;
  eventType: string;
  numberOfGuests?: number;
  additionalNotes?: string;
  
  // Payment info & Proof
  paymentMethod: PaymentMethodType;
  amountPaid: number;
  transactionId?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  receiptFileType?: string;
  
  // Statuses
  paymentStatus: PaymentStatusType;
  bookingStatus: BookingStatusType;
  
  // Client Gallery Access & Selection
  galleryPin?: string;
  galleryPhotos?: ClientGalleryPhoto[];
  maxSelectionCount?: number;
  selectionSubmittedAt?: string;
  
  createdAt: string;
}

export interface BlockedDate {
  id: string;
  blockedDate: string; // YYYY-MM-DD
  timeSlot?: string;
  reason: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: ServiceCategory | string;
  image: string;
  clientName: string;
  date: string;
  description: string;
  btsVideoUrl?: string;
  isFeatured?: boolean;
  displayOrder?: number;
  isVideo?: boolean;
  testimonial?: {
    quote: string;
    author: string;
    role?: string;
  };
}

export interface PaymentAccountDetails {
  method: PaymentMethodType;
  accountName: string;
  accountNumber: string;
  instructions: string;
  qrCodeUrl?: string;
  color: string;
}

export interface WebsiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutContent: string;
  officeAddress: string;
  phone: string;
  hotline: string;
  email: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
}

export type AdminUserRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminUserRole;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  action: string;
  targetTable: string;
  targetId?: string;
  details?: Record<string, any>;
  createdAt: string;
}
