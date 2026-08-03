import { Service, Package, PaymentAccountDetails, PortfolioItem, Booking } from '@/types';

// Service Cover Images from local assets
import weddingCover from '@/assets/Wedding Photography/0A3A4136.JPG';
import birthdayCover from '@/assets/birthday/0A3A0836 copy.jpg';
import christeningCover from '@/assets/Christening/0A3A1184 copy.jpg';
import engagementCover from '@/assets/Engagement/0A3A4136.JPG';
import outdoorCover from '@/assets/Outdoor/0A3A7785.JPG';
import graduationCover from '@/assets/graduation/0A3A1019 copy.jpg';

// Portfolio Showcase Images from local assets
import weddingPort from '@/assets/Wedding Photography/0A3A8193 copy.jpg';
import outdoorPort from '@/assets/Outdoor/0A3A7814.JPG';
import christeningPort from '@/assets/Christening/0A3A1187 copy.jpg';
import birthdayPort from '@/assets/birthday/0A3A0848 copy.jpg';
import engagementPort from '@/assets/Engagement/0A3A4160.JPG';
import graduationPort from '@/assets/graduation/0A3A1170 copy.jpg';

export const TIME_SLOTS = [
  '08:00 AM',
  '10:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM',
];

export const SERVICE_ASSET_MAP: Record<string, string> = {
  serg: weddingCover.src,
  wedding: weddingCover.src,
  ledet: birthdayCover.src,
  birthday: birthdayCover.src,
  kerestna: christeningCover.src,
  christening: christeningCover.src,
  shimaglina: engagementCover.src,
  engagement: engagementCover.src,
  mesk: outdoorCover.src,
  outdoor: outdoorCover.src,
  merreg: graduationCover.src,
  graduation: graduationCover.src,
};

export function getServiceCoverImage(service: { id?: string; title?: string; category?: string; coverImage?: string }): string {
  if (service.coverImage && (service.coverImage.startsWith('data:') || service.coverImage.startsWith('http') || service.coverImage.startsWith('/'))) {
    return service.coverImage;
  }
  const idKey = (service.id || '').toLowerCase();
  const titleKey = (service.title || '').toLowerCase();
  const catKey = (service.category || '').toLowerCase();

  return (
    SERVICE_ASSET_MAP[idKey] ||
    SERVICE_ASSET_MAP[titleKey] ||
    SERVICE_ASSET_MAP[catKey] ||
    weddingCover.src
  );
}

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'serg',
    title: 'Wedding',
    category: 'Wedding',
    description: 'Capture the elegance, romance, and joyful moments of your wedding day with master 4K cinematography and luxury photography.',
    coverImage: weddingCover.src,
    startingPrice: 35000,
    estimatedDuration: 'Full Day',
  },
  {
    id: 'ledet',
    title: 'Birthday',
    category: 'Birthday',
    description: 'Celebrate your special day, family laughter, and unforgettable memories with stunning high-resolution photography and video highlights.',
    coverImage: birthdayCover.src,
    startingPrice: 15000,
    estimatedDuration: '3 to 5 Hours',
  },
  {
    id: 'kerestna',
    title: 'Christening',
    category: 'Christening',
    description: 'Preserve sacred family blessings, infant baptism rituals, and heartfelt family gatherings with artistic photography and video.',
    coverImage: christeningCover.src,
    startingPrice: 18000,
    estimatedDuration: '2 to 4 Hours',
  },
  {
    id: 'shimaglina',
    title: 'Engagement',
    category: 'Engagement',
    description: 'Document traditional engagement ceremonies, family blessings, and marital pledge celebrations in rich cinematic detail.',
    coverImage: engagementCover.src,
    startingPrice: 25000,
    estimatedDuration: '4 to 6 Hours',
  },
  {
    id: 'mesk',
    title: 'Outdoor',
    category: 'Outdoor',
    description: 'Exquisite portrait and video sessions set against breathtaking natural landscapes and iconic outdoor destinations.',
    coverImage: outdoorCover.src,
    startingPrice: 20000,
    estimatedDuration: '3 to 6 Hours',
  },
  {
    id: 'merreg',
    title: 'Graduation',
    category: 'Graduation',
    description: 'Honor your academic milestones and family pride with editorial graduation portraiture and ceremony highlights.',
    coverImage: graduationCover.src,
    startingPrice: 16000,
    estimatedDuration: '2 to 4 Hours',
  },
];

export const INITIAL_PACKAGES: Package[] = [
  // Wedding Tiers
  {
    id: 'serg-silver',
    serviceId: 'serg',
    name: 'Silver Wedding Package',
    tagline: 'Ideal for intimate weddings and essential ceremony highlights',
    price: 35000,
    duration: '6 Hours Coverage',
    photographersCount: 1,
    features: [
      '1 Lead Senior Photographer',
      'Up to 6 Hours Coverage',
      '250+ Professionally Edited High-Res Photos',
      'Private Online Photo Gallery',
      'Sneak Peek Photos within 48 Hours',
    ],
  },
  {
    id: 'serg-gold',
    serviceId: 'serg',
    name: 'Gold Royal Wedding Package',
    tagline: 'Full-day coverage complete with luxury photo album and cinema film',
    price: 55000,
    duration: '10 Hours Coverage',
    photographersCount: 2,
    isPopular: true,
    features: [
      '2 Senior Photographers',
      'Up to 10 Hours Full-Day Coverage',
      '500+ Handpicked & Master-Edited Photos',
      'Premium Leather-Bound Photo Album (30 Pages)',
      'Pre-Wedding Shoot Session',
      'Private Online Gallery with Full-Resolution Downloads',
    ],
  },
  {
    id: 'serg-platinum',
    serviceId: 'serg',
    name: 'Platinum Cinema Wedding Package',
    tagline: 'Ultimate luxury wedding coverage with 4K drone cinematography and full documentary film',
    price: 85000,
    duration: 'Full Day & Evening',
    photographersCount: 3,
    features: [
      '3 Photo & Video Specialists + Professional Lighting Crew',
      'Unlimited Full-Day & Evening Coverage',
      '800+ Master-Edited Photos',
      '2 Custom Leather Albums (Bride & Groom + Parents)',
      '4K Drone Aerial Cinematic Filming',
      'Custom Wooden USB Drive Gift Box',
    ],
  },

  // Birthday Tiers
  {
    id: 'ledet-standard',
    serviceId: 'ledet',
    name: 'Standard Birthday Package',
    tagline: 'Perfect for capturing joyous birthday celebrations',
    price: 15000,
    duration: '3 Hours Coverage',
    photographersCount: 1,
    features: [
      '1 Professional Photographer',
      '3 Hours Party Coverage',
      '50+ Professionally Edited Photos',
      'Online Gallery Download',
    ],
  },
  {
    id: 'ledet-vip',
    serviceId: 'ledet',
    name: 'VIP Birthday & Video Package',
    tagline: 'Complete birthday coverage with cinematic highlight film and photo prints',
    price: 25000,
    duration: '5 Hours Coverage',
    photographersCount: 2,
    isPopular: true,
    features: [
      '1 Photographer + 1 Videographer',
      '5 Hours Event Coverage',
      '100+ Edited High-Res Photos',
      '3-Minute Cinematic Birthday Highlight Film',
      '1 Framed Wall Photo Print',
    ],
  },

  // Christening Tiers
  {
    id: 'kerestna-std',
    serviceId: 'kerestna',
    name: 'Christening Ceremony Package',
    tagline: 'Sacred baptism and family blessing coverage',
    price: 18000,
    duration: '3 Hours',
    photographersCount: 1,
    features: [
      '1 Professional Photographer',
      'Church Ceremony & Family Reception Coverage',
      '60+ Professionally Edited Photos',
      'Online Photo Gallery Access',
    ],
  },

  // Engagement Tiers
  {
    id: 'shimaglina-std',
    serviceId: 'shimaglina',
    name: 'Traditional Engagement Package',
    tagline: 'Cultural engagement & family pledge ceremony coverage',
    price: 25000,
    duration: '4 Hours',
    photographersCount: 1,
    features: [
      '1 Photographer + Video Coverage',
      'Ceremony & Luncheon Coverage',
      '80+ Professionally Edited Photos',
      'Short Video Highlight Film',
    ],
  },

  // Outdoor Tiers
  {
    id: 'mesk-std',
    serviceId: 'mesk',
    name: 'Outdoor Portrait Package',
    tagline: 'Scenic portrait photography in breathtaking natural settings',
    price: 20000,
    duration: '3 Hours',
    photographersCount: 1,
    features: [
      '1 Lead Photographer',
      'Up to 2 Outfit Changes',
      '40+ High-Resolution Master-Edited Outdoor Photos',
      'Online High-Speed Download Gallery',
    ],
  },

  // Graduation Tiers
  {
    id: 'merreg-std',
    serviceId: 'merreg',
    name: 'Graduation Celebration Package',
    tagline: 'Academic milestone portraits with family & friends',
    price: 16000,
    duration: '2 Hours',
    photographersCount: 1,
    features: [
      '1 Senior Photographer',
      'Individual & Family Group Portraits',
      '40+ Professionally Retouched High-Res Photos',
      'Digital Delivery via Private Online Gallery',
    ],
  },
  {
    id: 'merreg-vip',
    serviceId: 'merreg',
    name: 'VIP Graduation & Cinematic Reel',
    tagline: 'Complete graduation shoot with video reel and printed canvas',
    price: 26000,
    duration: '4 Hours',
    photographersCount: 2,
    isPopular: true,
    features: [
      '1 Photographer + 1 Videographer',
      'On-Campus & Outdoor Location Shoots',
      '80+ Retouched Photos',
      'Instagram 4K Graduation Reel / Cinematic Video',
      '1 Framed Canvas Portrait',
    ],
  },
];

export const PAYMENT_METHODS: PaymentAccountDetails[] = [
  {
    method: 'Telebirr',
    accountName: 'ABIS PRODUCTION PHOTO STUDIO',
    accountNumber: '+251 911 234 567',
    instructions: 'Transfer the required amount to the phone number above via the Telebirr app or *127#. Enter your transaction ID and upload payment proof below.',
    color: 'from-blue-600 to-sky-500',
  },
  {
    method: 'CBE Birr',
    accountName: 'ABIS MEDIA & PRODUCTIONS',
    accountNumber: '1000 4829 1948 2',
    instructions: 'Send payment to account number 1000 4829 1948 2 using the CBE Birr app or *889#. Upload a screenshot or PDF of the receipt below.',
    color: 'from-amber-600 to-yellow-500',
  },
  {
    method: 'Bank Transfer',
    accountName: 'ABIS CREATIVE STUDIO PLC',
    accountNumber: '1000 9928 3412 (CBE) / 0132 9981 (Awash)',
    instructions: 'Transfer funds directly to our Commercial Bank of Ethiopia (CBE) or Awash Bank accounts. Include your full name as the payment reference.',
    color: 'from-emerald-600 to-teal-500',
  },
  {
    method: 'Cash Deposit',
    accountName: 'ABIS STUDIO BRANCH ADDIS ABABA',
    accountNumber: 'CBE Account: 1000 4829 1948 2',
    instructions: 'Visit any Commercial Bank of Ethiopia (CBE) branch to deposit cash into account 1000 4829 1948 2. Upload a clear photo of the bank teller slip.',
    color: 'from-purple-600 to-indigo-500',
  },
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'Selam & Henok Wedding Ceremony',
    category: 'Wedding',
    image: weddingPort.src,
    clientName: 'Selam & Henok',
    date: 'June 2026',
    description: 'A magnificent wedding celebration at the Sheraton Addis, blending traditional Habesha attire with luxury modern styling.',
    btsVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    testimonial: {
      quote: 'Abis Production captured our wedding day with breathtaking elegance. Every time we look at the photos, we relive the joy!',
      author: 'Selam Gebremichael',
      role: 'Bride',
    },
  },
  {
    id: 'port-2',
    title: 'Yared Tadesse Outdoor Session',
    category: 'Outdoor',
    image: outdoorPort.src,
    clientName: 'Yared Tadesse',
    date: 'May 2026',
    description: 'Editorial portrait shoot captured across Addis Ababa University grounds and scenic outdoor parks.',
    testimonial: {
      quote: 'The image sharpness and lighting quality blew me away. Truly world-class photography!',
      author: 'Yared Tadesse',
      role: 'Model',
    },
  },
  {
    id: 'port-3',
    title: 'Bekele Family Christening & Blessing',
    category: 'Christening',
    image: christeningPort.src,
    clientName: 'Bekele Family',
    date: 'April 2026',
    description: 'Heartfelt family baptism ceremony capturing multi-generational heritage and sacred moments.',
    testimonial: {
      quote: 'They were so patient and warm with our entire family. The family portraits are exquisite!',
      author: 'Dr. Almaz Bekele',
      role: 'Mother',
    },
  },
  {
    id: 'port-4',
    title: 'Joyful Birthday Celebration',
    category: 'Birthday',
    image: birthdayPort.src,
    clientName: 'Meron Abebe',
    date: 'March 2026',
    description: 'Vibrant birthday celebration filled with laughter, candid moments, and family joy.',
  },
  {
    id: 'port-5',
    title: 'Traditional Engagement Ceremony',
    category: 'Engagement',
    image: engagementPort.src,
    clientName: 'Solyana & Michael',
    date: 'February 2026',
    description: 'Cinematic coverage of a traditional Ethiopian engagement ceremony and family union.',
  },
  {
    id: 'port-6',
    title: 'University Graduation Ceremony',
    category: 'Graduation',
    image: graduationPort.src,
    clientName: 'Kaleb Tilahun',
    date: 'January 2026',
    description: 'Special graduation portrait session highlighting academic achievement and family celebrations.',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [];
