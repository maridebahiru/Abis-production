'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Info, 
  ArrowRight
} from 'lucide-react';
import { Service, Package } from '@/types';
import { bookingStore } from '@/lib/bookingStore';
import { getServiceCoverImage } from '@/lib/mockData';
import OptimizedImage from '@/components/OptimizedImage';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeServiceModal, setActiveServiceModal] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const s = await bookingStore.getServices();
      const p = await bookingStore.getPackages();
      setServices(s.filter((serv) => serv.isEnabled !== false));
      setPackages(p);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const getServicePackages = (serv: Service | string) => {
    const sId = typeof serv === 'string' ? serv : serv.id;
    const sTitle = typeof serv === 'string' ? '' : serv.title || '';
    const sCategory = typeof serv === 'string' ? '' : serv.category || '';

    const sIdClean = sId.toLowerCase();
    const sTitleClean = sTitle.toLowerCase();
    const sCatClean = sCategory.toLowerCase();

    return packages.filter((p) => {
      const pSid = (p.serviceId || (p as any).service_id || '').toLowerCase();
      return (
        pSid === sIdClean ||
        (sTitleClean && pSid === sTitleClean) ||
        (sCatClean && pSid === sCatClean)
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Services & Packages</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-100">
          Abis Production Services & Packages
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
          Comprehensive 4K photography and cinema coverage for weddings, birthdays, christenings, engagements, and outdoor shoots.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-3xl h-[420px] p-6 space-y-6 border border-zinc-800 animate-pulse">
                <div className="h-64 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer" />
                <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                <div className="h-4 w-1/2 bg-zinc-800 rounded" />
              </div>
            ))
          : services.map((service) => {
              const servicePkgs = getServicePackages(service);
              return (
                <div
                  key={service.id}
                  className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-gold-500/15"
                >
                  {/* Cover Image */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <OptimizedImage
                      src={getServiceCoverImage(service)}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-zinc-900/80 border border-gold-500/30 text-gold-300 text-xs font-semibold rounded-full backdrop-blur-md">
                    {service.category}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-zinc-100">
                      {service.title}
                    </h2>
                    <span className="text-xs text-zinc-300 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5 text-gold-400" />
                      Duration: {service.estimatedDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Body */}
              <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {service.description}
                </p>

                {/* Packages list */}
                {servicePkgs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                      Package Options:
                    </span>
                    <div className="space-y-1.5">
                      {servicePkgs.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-zinc-200">{pkg.name}</div>
                            <div className="text-[10px] text-zinc-400">{pkg.duration}</div>
                          </div>
                          {pkg.price && (
                            <span className="font-bold text-gold-400 text-xs shrink-0">
                              {pkg.price.toLocaleString()} ETB
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveServiceModal(service)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:border-gold-500/40 hover:text-gold-400 transition-all flex items-center gap-1.5"
                  >
                    <Info className="w-4 h-4 text-gold-400" />
                    <span>View Packages ({servicePkgs.length})</span>
                  </button>

                  <Link
                    href={`/booking?service=${service.id}`}
                    className="gold-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Now</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Package Breakdown Modal */}
      {activeServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                  Package Breakdown
                </span>
                <h2 className="font-serif text-2xl font-bold text-zinc-100">
                  {activeServiceModal.title} Package Tier Breakdown
                </h2>
              </div>
              <button
                onClick={() => setActiveServiceModal(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {getServicePackages(activeServiceModal).length > 0 ? (
                getServicePackages(activeServiceModal).map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-6 rounded-2xl border ${
                      pkg.isPopular
                        ? 'bg-gold-500/10 border-gold-500/50 shadow-gold-sm'
                        : 'bg-zinc-900/80 border-zinc-800'
                    } space-y-4`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-xl font-bold text-zinc-100">
                            {pkg.name}
                          </h3>
                          {pkg.isPopular && (
                            <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-dark-bg text-[10px] font-bold uppercase tracking-wider">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">{pkg.tagline}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-bold text-gold-400 block">
                          {pkg.price ? `${pkg.price.toLocaleString()} ETB` : ''}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400 block">{pkg.duration}</span>
                      </div>
                    </div>

                    {pkg.features && pkg.features.length > 0 && (
                      <div className="pt-2 border-t border-zinc-800/60">
                        <span className="text-xs font-semibold text-zinc-300 block mb-2">
                          Included Features & Deliverables:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/booking?service=${activeServiceModal.id}&package=${pkg.id}`}
                        className="gold-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                      >
                        <span>Select {pkg.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-4">
                  <p className="text-sm text-zinc-300">
                    Custom tailored sessions are available for {activeServiceModal.title}.
                  </p>
                  <p className="text-xs text-zinc-400">
                    Starting price from {activeServiceModal.startingPrice?.toLocaleString()} ETB. Contact us directly or start a booking to configure your session.
                  </p>
                  <Link
                    href={`/booking?service=${activeServiceModal.id}`}
                    className="gold-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase"
                  >
                    <span>Book {activeServiceModal.title} Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
