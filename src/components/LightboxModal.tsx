'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Video, Quote, Calendar, User } from 'lucide-react';
import { PortfolioItem } from '@/types';

interface LightboxModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function renderBtsVideo(url: string) {
  if (!url) return null;

  const cleanUrl = url.trim();

  // YouTube Embed Handling
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    let embedUrl = cleanUrl;
    if (cleanUrl.includes('youtube.com/watch?v=')) {
      const videoId = cleanUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (cleanUrl.includes('youtu.be/')) {
      const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return (
      <iframe
        src={embedUrl}
        title="Behind the scenes video"
        className="w-full h-full border-0 rounded-xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Vimeo Embed Handling
  if (cleanUrl.includes('vimeo.com')) {
    const videoId = cleanUrl.split('vimeo.com/')[1]?.split('?')[0];
    const embedUrl = `https://player.vimeo.com/video/${videoId}`;
    return (
      <iframe
        src={embedUrl}
        title="Vimeo video"
        className="w-full h-full border-0 rounded-xl"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Direct Video File (DataURL, Supabase Storage, Blob, MP4, WEBM, MOV)
  return (
    <video
      src={cleanUrl}
      controls
      autoPlay
      playsInline
      preload="auto"
      className="w-full h-full object-contain bg-black rounded-xl"
    >
      <source src={cleanUrl} />
      Your browser does not support playing this video format.
    </video>
  );
}

export default function LightboxModal({ item, onClose, onPrev, onNext }: LightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-gold-400 hover:border-gold-500/50 transition-all shadow-xl"
        aria-label="Close Lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev / Next Navigation Controls */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-gold-400 hover:border-gold-500/50 transition-all shadow-xl hidden md:flex items-center justify-center"
        aria-label="Previous Image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-gold-400 hover:border-gold-500/50 transition-all shadow-xl hidden md:flex items-center justify-center"
        aria-label="Next Image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Lightbox Content Container */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-zinc-950 border border-gold-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row my-auto">
        {/* Main Photo Area */}
        <div className="relative flex-1 min-h-[350px] lg:min-h-[550px] bg-black flex items-center justify-center">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-contain"
            priority
          />

          <span className="absolute top-4 left-4 px-3 py-1 bg-zinc-900/80 border border-gold-500/30 text-gold-400 text-xs font-semibold rounded-full backdrop-blur-md">
            {item.category}
          </span>
        </div>

        {/* Sidebar Info & Testimonial Details */}
        <div className="w-full lg:w-[380px] p-6 lg:p-8 bg-zinc-900/90 overflow-y-auto flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800">
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-100 mb-2">
                {item.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  {item.clientName || 'Abis Studio'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" />
                  {item.date || '2026'}
                </span>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {item.description}
            </p>

            {/* Testimonial if present */}
            {item.testimonial && (
              <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/20 relative">
                <Quote className="w-5 h-5 text-gold-400/40 absolute top-3 right-3" />
                <p className="text-xs italic text-zinc-200 mb-2 leading-relaxed">
                  &ldquo;{item.testimonial.quote}&rdquo;
                </p>
                <div className="text-[11px] font-semibold text-gold-400">
                  — {item.testimonial.author} {item.testimonial.role && `(${item.testimonial.role})`}
                </div>
              </div>
            )}

            {/* Behind-The-Scenes Video Player */}
            {item.btsVideoUrl && (
              <div className="pt-2">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800">
                  {renderBtsVideo(item.btsVideoUrl)}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Abis Production Showcase</span>
            <div className="flex gap-2 lg:hidden">
              <button
                onClick={onPrev}
                className="px-3 py-1.5 bg-zinc-800 rounded text-xs text-zinc-300"
              >
                Prev
              </button>
              <button
                onClick={onNext}
                className="px-3 py-1.5 bg-zinc-800 rounded text-xs text-zinc-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
