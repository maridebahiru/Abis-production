'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  KeyRound, 
  Lock, 
  Image as ImageIcon, 
  Download, 
  Heart, 
  Sparkles
} from 'lucide-react';
import { Booking, ClientGalleryPhoto } from '@/types';
import { bookingStore } from '@/lib/bookingStore';

export default function ClientGalleryPage() {
  const [refNumber, setRefNumber] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [photos, setPhotos] = useState<ClientGalleryPhoto[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'All' | 'Favorites'>('All');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber.trim() || !pin.trim()) return;

    setIsSearching(true);
    setErrorMsg('');

    const res = await bookingStore.lookupClientGallery(refNumber, pin);
    if (!res) {
      setErrorMsg('Invalid Booking Reference or Security PIN. Please verify your credentials and try again.');
      setBooking(null);
    } else {
      setBooking(res);
      setPhotos(res.galleryPhotos || []);
    }
    setIsSearching(false);
  };

  const toggleFavorite = (photoId: string) => {
    const updated = photos.map((p) =>
      p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    setPhotos(updated);
    if (booking) {
      bookingStore.updateGalleryPhotos(booking.id, updated);
    }
  };

  const displayedPhotos =
    activeTab === 'Favorites' ? photos.filter((p) => p.isFavorite) : photos;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
          <KeyRound className="w-4 h-4" />
          <span>Client Private Photo Portal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-100">
          Client Photo Portal
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300">
          Access, view, select favorites, and download your high-resolution photos securely.
        </p>
      </div>

      {/* Login Card */}
      {!booking ? (
        <div className="glass-card max-w-md mx-auto p-8 rounded-3xl border border-gold-500/20 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-zinc-100 pt-2">Client Portal Login</h2>
            <p className="text-xs text-zinc-400">Enter your Booking Reference and Security PIN to access your gallery</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Booking Reference</label>
              <input
                type="text"
                placeholder="e.g., PHOTO-260721-0012"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 font-mono uppercase text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Security PIN (6-Digit PIN)</label>
              <input
                type="password"
                maxLength={6}
                placeholder="e.g., 882194"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 font-mono text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || !refNumber.trim() || !pin.trim()}
              className="gold-btn w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Enter Photo Gallery</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="pt-2 border-t border-zinc-800 text-center">
            <button
              onClick={() => {
                setRefNumber('PHOTO-260721-0012');
                setPin('882194');
              }}
              className="text-[11px] text-gold-400 hover:underline"
            >
              Click for Demo Fill (PHOTO-260721-0012 / PIN 882194)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Gallery Bar */}
          <div className="glass-card p-6 rounded-3xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                Client Photo Collection
              </span>
              <h2 className="font-serif text-2xl font-bold text-zinc-100">
                {booking.serviceName} — {booking.customerName}
              </h2>
              <span className="text-xs text-zinc-400 block">
                Shoot Date: {booking.bookingDate} | Ref: {booking.referenceNumber}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setActiveTab('All')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === 'All' ? 'bg-gold-500 text-dark-bg font-bold' : 'text-zinc-300'
                  }`}
                >
                  All ({photos.length})
                </button>
                <button
                  onClick={() => setActiveTab('Favorites')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === 'Favorites' ? 'bg-gold-500 text-dark-bg font-bold' : 'text-zinc-300'
                  }`}
                >
                  Favorites ({photos.filter((p) => p.isFavorite).length})
                </button>
              </div>

              <a
                href={photos[0]?.highResUrl || '#'}
                download="abis_gallery_bundle.zip"
                className="gold-btn px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download All (ZIP)</span>
              </a>

              <button
                onClick={() => setBooking(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-100"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Photos Grid */}
          {displayedPhotos.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400 bg-zinc-900/60 rounded-3xl border border-zinc-800 space-y-2">
              <ImageIcon className="w-8 h-8 text-gold-400 mx-auto" />
              <p>No photos found in this album.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {displayedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative h-80 rounded-2xl overflow-hidden border border-zinc-800 hover:border-gold-500/40 transition-all shadow-xl bg-zinc-950"
                >
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => toggleFavorite(photo.id)}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        photo.isFavorite
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-zinc-900/80 text-zinc-300 hover:text-red-400'
                      }`}
                      title="Toggle Favorite"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-zinc-900/90 p-3 rounded-xl border border-zinc-800/80 backdrop-blur-md">
                    <div>
                      <span className="font-serif text-sm font-bold text-zinc-100 block">
                        {photo.title}
                      </span>
                    </div>

                    <a
                      href={photo.highResUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 text-xs font-semibold flex items-center gap-1"
                      title="Download High-Resolution"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>HD</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
