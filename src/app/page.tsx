'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Camera, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Search, 
  Film, 
  Award, 
  Image as ImageIcon 
} from 'lucide-react';
import { bookingStore, INITIAL_WEBSITE_SETTINGS } from '@/lib/bookingStore';
import { getServiceCoverImage } from '@/lib/mockData';
import LightboxModal from '@/components/LightboxModal';
import { PortfolioItem, Service, WebsiteSettings } from '@/types';

export default function HomePage() {
  const [selectedLightboxIndex, setSelectedLightboxIndex] = useState<number | null>(null);
  const [siteSettings, setSiteSettings] = useState<WebsiteSettings>(INITIAL_WEBSITE_SETTINGS);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    async function loadLiveData() {
      const settings = await bookingStore.getWebsiteSettings();
      const sList = await bookingStore.getServices();
      const pList = await bookingStore.getPortfolioItems();

      setSiteSettings(settings);
      setServices(sList.filter((s) => s.isEnabled !== false));
      setPortfolioItems(pList);
    }
    loadLiveData();
  }, []);

  const activeItem: PortfolioItem | null =
    selectedLightboxIndex !== null ? portfolioItems[selectedLightboxIndex] : null;

  const heroImgSrc = siteSettings.heroImage || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000";

  return (
    <div className="space-y-24 pb-16 overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[88vh] flex items-center justify-center -mt-24 pt-32 pb-16 px-4">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={heroImgSrc}
            alt="Abis Production background"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-dark-bg/60" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Abis Production | Luxury Photo & Cinema Studio</span>
          </div>

          {/* Hero Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-100 leading-[1.2]">
            {siteSettings.heroTitle}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
            {siteSettings.heroSubtitle}
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/booking"
              className="gold-btn w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-gold-glow"
            >
              <Calendar className="w-5 h-5" />
              <span>Book a Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/portfolio"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-zinc-200 text-xs sm:text-sm font-semibold hover:border-gold-500/50 hover:text-gold-400 transition-all flex items-center justify-center gap-2"
            >
              <Film className="w-5 h-5 text-gold-400" />
              <span>View Portfolio</span>
            </Link>
          </div>

          {/* Fast Lookup Bar */}
          <div className="pt-8">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-md max-w-xl mx-auto">
              <div className="flex items-center gap-2 px-3 text-xs text-zinc-400">
                <Search className="w-4 h-4 text-gold-400" />
                <span>Already booked?</span>
              </div>
              <Link
                href="/lookup"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-gold-300 flex items-center justify-center gap-2 transition-all"
              >
                <span>Check Order Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/client-gallery"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 flex items-center justify-center gap-2 transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5 text-gold-400" />
                <span>Client Photo Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STUDIO STATS ================= */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-zinc-900/60 border border-gold-500/15 backdrop-blur-xl">
          <div className="text-center space-y-1">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">500+</div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Weddings Filmed</div>
          </div>
          <div className="text-center space-y-1 border-l border-zinc-800">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">1,200+</div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Happy Clients</div>
          </div>
          <div className="text-center space-y-1 border-l border-zinc-800">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">4.9 ★</div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Client Satisfaction</div>
          </div>
          <div className="text-center space-y-1 border-l border-zinc-800">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">4K Cinema</div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">4K Cinema & Drone</div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES SPECIALIZATION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Our Specializations</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-100">
              Services & Photography Categories
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={getServiceCoverImage(service)}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-80" />

                <span className="absolute top-3 right-3 px-3 py-1 bg-dark-bg/80 border border-gold-500/30 text-gold-300 text-[11px] font-semibold rounded-full backdrop-blur-md">
                  {service.estimatedDuration}
                </span>
              </div>

              <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-zinc-100 group-hover:text-gold-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end">
                  <Link
                    href={`/booking?service=${service.id}`}
                    className="gold-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-full justify-center"
                  >
                    <span>Book Now</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PORTFOLIO SHOWCASE TEASER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Portfolio Showcase
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-100">
            Our Latest Visual Works
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Click on any image to open the lightbox gallery and view full details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolioItems.slice(0, 6).map((item, index) => (
            <div
              key={item.id}
              onClick={() => setSelectedLightboxIndex(index)}
              className="relative h-80 rounded-2xl overflow-hidden cursor-pointer group border border-zinc-800 hover:border-gold-500/40 transition-all shadow-xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 inset-x-0 p-6 space-y-2">
                <span className="px-2.5 py-1 bg-gold-500/20 border border-gold-500/40 text-gold-300 text-[10px] font-semibold uppercase tracking-wider rounded-md">
                  {item.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-zinc-100 group-hover:text-gold-300 transition-colors">
                  {item.title}
                </h3>
                <span className="text-xs text-gold-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Click to View Lightbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/portfolio"
            className="gold-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            <span>View Full Portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ================= PAYMENT METHODS BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 via-dark-card to-zinc-950 border border-gold-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Local & Direct Payments</span>
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-100">
              Pay Easily via Telebirr, CBE Birr & Direct Bank Transfer
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              After placing your booking online, upload your payment receipt (screenshot or PDF) to instantly confirm your order.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link
              href="/booking"
              className="gold-btn px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
            >
              Book Session Now
            </Link>
            <Link
              href="/lookup"
              className="px-6 py-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold hover:border-gold-500/40 text-center"
            >
              Track Booking Status
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <LightboxModal
        item={activeItem}
        onClose={() => setSelectedLightboxIndex(null)}
        onPrev={() =>
          setSelectedLightboxIndex((prev) =>
            prev !== null ? (prev === 0 ? portfolioItems.length - 1 : prev - 1) : null
          )
        }
        onNext={() =>
          setSelectedLightboxIndex((prev) =>
            prev !== null ? (prev === portfolioItems.length - 1 ? 0 : prev + 1) : null
          )
        }
      />
    </div>
  );
}
