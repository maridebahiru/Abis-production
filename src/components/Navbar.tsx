'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Calendar, Search, Image as ImageIcon, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-bg/90 backdrop-blur-md border-b border-gold-500/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-dark-bg/90 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition-transform duration-300">
              <Camera className="w-5 h-5 text-dark-bg" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-gold-gradient uppercase">
                Abis Production
              </span>
              <span className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-light -mt-1">
                Studio & Cinema
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    isActive ? 'text-gold-400 font-semibold' : 'text-zinc-300 hover:text-gold-300'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 to-amber-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Status Lookup & Track Order */}
            <Link
              href="/track-order"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gold-500/30 bg-zinc-900/80 text-xs font-semibold text-gold-300 hover:text-gold-400 hover:border-gold-400 shadow-gold-sm transition-all"
              title="Track Order & Select Photos"
            >
              <Search className="w-3.5 h-3.5 text-gold-400" />
              <span>Track Order</span>
            </Link>

            {/* Client Gallery Portal */}
            <Link
              href="/track-order"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/60 text-xs font-medium text-zinc-300 hover:text-gold-400 hover:border-gold-500/40 transition-all"
              title="Client Photo Portal"
            >
              <ImageIcon className="w-3.5 h-3.5 text-gold-400" />
              <span>Client Portal</span>
            </Link>

            {/* Book Now */}
            <Link
              href="/booking"
              className="gold-btn px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/booking"
              className="gold-btn px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Now</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-gold-400 focus:outline-none"
              aria-label="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bg-dark-bg/95 backdrop-blur-xl border-b border-gold-500/20 p-6 shadow-2xl animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium py-2 border-b border-zinc-900 ${
                  pathname === link.href ? 'text-gold-400 font-semibold' : 'text-zinc-300'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-2 grid grid-cols-2 gap-3">
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gold-500/30 bg-zinc-900 text-xs font-semibold text-gold-300"
              >
                <Search className="w-4 h-4 text-gold-400" />
                <span>Track Order</span>
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300"
              >
                <ImageIcon className="w-4 h-4 text-gold-400" />
                <span>Client Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
