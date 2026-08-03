'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { bookingStore } from '@/lib/bookingStore';
import { PortfolioItem, ServiceCategory } from '@/types';
import { Sparkles, Film, ArrowRight } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

const LightboxModal = lazy(() => import('@/components/LightboxModal'));

type CategoryFilter = 'All' | ServiceCategory;

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [selectedLightboxIndex, setSelectedLightboxIndex] = useState<number | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPortfolio() {
      setIsLoading(true);
      const fetched = await bookingStore.getPortfolioItems();
      setItems(fetched);
      setIsLoading(false);
    }
    loadPortfolio();
  }, []);

  const categories: CategoryFilter[] = [
    'All',
    'Wedding',
    'Graduation',
    'Birthday',
    'Family',
    'Studio',
    'Corporate',
    'Pre-Wedding',
    'Outdoor',
    'Engagement',
    'Christening',
  ];

  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category === activeCategory);

  const activeItem: PortfolioItem | null =
    selectedLightboxIndex !== null ? filteredItems[selectedLightboxIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Portfolio Gallery</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-100">
          Abis Production Visual Showcase
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
          Explore our luxury photography portfolio filtered by category below.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all border ${
              activeCategory === cat
                ? 'bg-gold-gradient text-dark-bg border-gold-400 shadow-gold-sm font-bold scale-105'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-gold-300 hover:border-gold-500/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer border border-zinc-800"
              />
            ))
          : filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedLightboxIndex(idx)}
                className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer border border-zinc-800/80 hover:border-gold-500/40 transition-all shadow-xl bg-zinc-950"
              >
                <OptimizedImage
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Badges */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="px-3 py-1 bg-gold-500/20 border border-gold-500/40 text-gold-300 text-[10px] font-semibold uppercase tracking-wider rounded-md backdrop-blur-md">
                    {item.category}
                  </span>
                  {item.btsVideoUrl && (
                    <span className="px-2.5 py-1 bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-semibold uppercase tracking-wider rounded-md flex items-center gap-1 backdrop-blur-md">
                      <Film className="w-3 h-3" />
                      <span>BTS Video</span>
                    </span>
                  )}
                </div>

                {/* Card Footer Info */}
                <div className="absolute bottom-0 inset-x-0 p-6 space-y-2 z-20">
                  <h3 className="font-serif text-xl font-bold text-zinc-100 group-hover:text-gold-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-gold-400 font-semibold">
                    <span>Click for Lightbox View</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Lightbox Modal */}
      <Suspense fallback={null}>
        {selectedLightboxIndex !== null && (
          <LightboxModal
            item={activeItem}
            onClose={() => setSelectedLightboxIndex(null)}
            onPrev={() =>
              setSelectedLightboxIndex((prev) =>
                prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : null
              )
            }
            onNext={() =>
              setSelectedLightboxIndex((prev) =>
                prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : null
              )
            }
          />
        )}
      </Suspense>
    </div>
  );
}
