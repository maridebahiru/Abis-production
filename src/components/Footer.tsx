'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import { bookingStore, INITIAL_WEBSITE_SETTINGS } from '@/lib/bookingStore';
import { WebsiteSettings } from '@/types';

export default function Footer() {
  const [settings, setSettings] = useState<WebsiteSettings>(INITIAL_WEBSITE_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      const s = await bookingStore.getWebsiteSettings();
      setSettings(s);
    }
    loadSettings();
  }, []);

  return (
    <footer className="bg-dark-surface border-t border-zinc-800/80 pt-16 pb-12 relative overflow-hidden">
      {/* Decorative Gold Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gold-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shadow-gold-sm">
                <Camera className="w-5 h-5 text-dark-bg" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-wider text-gold-gradient uppercase">
                  Abis Production
                </span>
                <span className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-light -mt-1">
                  Studio & Cinema
                </span>
              </div>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Abis Production - Immortalizing life&apos;s unforgettable moments with luxury photography and cinematic video excellence.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.whatsappUrl || "https://wa.me/251911234567"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-base font-semibold text-zinc-100 mb-4 tracking-wide border-b border-gold-500/20 pb-2 inline-block">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/services" className="hover:text-gold-400 transition-colors">
                  Services & Packages
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-gold-400 transition-colors">
                  Portfolio Gallery
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-gold-400 transition-colors">
                  Online Booking
                </Link>
              </li>
              <li>
                <Link href="/lookup" className="hover:text-gold-400 transition-colors">
                  Order Status Tracking
                </Link>
              </li>
              <li>
                <Link href="/client-gallery" className="hover:text-gold-400 transition-colors">
                  Client Photo Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details & Hours */}
          <div>
            <h3 className="font-serif text-base font-semibold text-zinc-100 mb-4 tracking-wide border-b border-gold-500/20 pb-2 inline-block">
              Contact & Studio Hours
            </h3>
            <ul className="space-y-3 text-xs text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <span>{settings.officeAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-amber-400 font-medium">Hotline: {settings.hotline}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-center gap-2.5 pt-1 text-[11px] text-zinc-400">
                <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Mon – Sat: 8:30 AM – 7:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Social Media & Payment Badges */}
          <div>
            <h3 className="font-serif text-base font-semibold text-zinc-100 mb-4 tracking-wide border-b border-gold-500/20 pb-2 inline-block">
              Connect With Us
            </h3>

            <div className="flex flex-wrap gap-2 mb-6">
              <a
                href={settings.instagramUrl || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-pink-400 hover:border-pink-500/40 transition-all flex items-center gap-1.5"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={settings.tiktokUrl || "https://tiktok.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
              >
                <span>TikTok</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={settings.facebookUrl || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-blue-400 hover:border-blue-500/40 transition-all flex items-center gap-1.5"
              >
                <span>Facebook</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
                Accepted Payment Methods:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-1 bg-blue-950/60 border border-blue-800/50 text-blue-300 text-[10px] font-semibold rounded">
                  Telebirr
                </span>
                <span className="px-2 py-1 bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[10px] font-semibold rounded">
                  CBE Birr
                </span>
                <span className="px-2 py-1 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[10px] font-semibold rounded">
                  Bank Transfer
                </span>
                <span className="px-2 py-1 bg-purple-950/60 border border-purple-800/50 text-purple-300 text-[10px] font-semibold rounded">
                  Cash Deposit
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} Abis Production Studio & Cinema. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/lookup" className="hover:text-gold-400 transition-colors">
              Track Order
            </Link>
            <Link href="/client-gallery" className="hover:text-gold-400 transition-colors">
              Client Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
