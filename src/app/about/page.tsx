import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Sparkles, Award, ShieldCheck, Film, Users, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Craftsmanship & Artistry</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-100">
          About Abis Production
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
          Founded on the pursuit of visual perfection, Abis Production is East Africa&apos;s luxury photography and videography studio dedicated to immortalizing royal heritage, emotional celebrations, and commercial editorials.
        </p>
      </div>

      {/* Story & Philosophy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative h-[480px] rounded-3xl overflow-hidden border border-gold-500/20 shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=1200"
            alt="Abis Production Master Camera Team"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

          <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md">
            <span className="font-serif text-xl font-bold text-gold-gradient block">
              10+ Years of Visual Excellence
            </span>
            <span className="text-xs text-zinc-300 block mt-1">
              Capturing over 500 royal weddings and high-profile corporate galas across Ethiopia & abroad.
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-100">
            Our Passion for Emotional Heritage
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Every photograph is a window through time. At Abis Production, we combine high-fashion lighting techniques with candid photojournalism to ensure every glance, smile, and vow is preserved with pristine fidelity.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-zinc-100">Master Sony Cinema Rigs</h4>
                <p className="text-xs text-zinc-400">Shot on full-frame Sony FX6, FX3, and Hasselblad medium format sensors.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-zinc-100">4K Drone Aerial Filming</h4>
                <p className="text-xs text-zinc-400">Licensed aerial pilots capturing panoramic estate grounds and grand outdoor venues.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-zinc-100">Editorial Flush-Mount Albums</h4>
                <p className="text-xs text-zinc-400">Italian leather binding with archival museum-grade photo prints built to last generations.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/booking"
              className="gold-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              <span>Book Your Session With Us</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
