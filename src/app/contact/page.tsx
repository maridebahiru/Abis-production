'use client';

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { bookingStore, INITIAL_WEBSITE_SETTINGS } from '@/lib/bookingStore';
import { WebsiteSettings } from '@/types';

export default function ContactPage() {
  const [settings, setSettings] = useState<WebsiteSettings>(INITIAL_WEBSITE_SETTINGS);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Wedding Photography',
    message: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    async function loadSettings() {
      const s = await bookingStore.getWebsiteSettings();
      setSettings(s);
    }
    loadSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', service: 'Wedding Photography', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Get in Touch With Our Directors</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-100">
          Contact Abis Production
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
          Have questions about our photography services, multi-day wedding coverage, or custom studio sessions? Reach out to us below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="glass-card p-8 rounded-3xl border border-gold-500/20 shadow-2xl space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-zinc-100">Send Us an Inquiry</h2>
            <p className="text-xs text-zinc-400 mt-1">Our team typically responds within 2 to 4 hours.</p>
          </div>

          {submitted && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thank you! Your message has been sent successfully. Our team will contact you shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Your Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Almaz Tadesse"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. almaz@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +251 911 234 567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Interested Service</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
              >
                <option value="Wedding Photography">Wedding Photography</option>
                <option value="Wedding Videography">Wedding Videography</option>
                <option value="Graduation">Graduation</option>
                <option value="Birthday">Birthday</option>
                <option value="Family Photos">Family Photos</option>
                <option value="Corporate Events">Corporate Events</option>
                <option value="Studio Photography">Studio Photography</option>
                <option value="Pre-Wedding">Pre-Wedding</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Your Message *</label>
              <textarea
                rows={4}
                required
                placeholder="Describe your event date, location, and requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="gold-btn w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>

        {/* Contact Info & Interactive Google Map Component */}
        <div className="space-y-8">
          <div className="glass-card p-8 rounded-3xl border border-zinc-800 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-zinc-100">Studio Contact Details</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Studio Office Address</span>
                  <span className="font-bold text-zinc-100 text-sm">{settings.officeAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Studio Line & Emergency Hotline</span>
                  <span className="font-bold text-zinc-100 text-sm block">{settings.phone}</span>
                  <span className="font-bold text-amber-400 text-sm block">Hotline: {settings.hotline}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Email Address</span>
                  <span className="font-bold text-zinc-100 text-sm">{settings.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Studio Operating Hours</span>
                  <span className="font-semibold text-zinc-200 block">Mon – Sat: 8:30 AM – 7:30 PM</span>
                  <span className="text-zinc-400 block">Sun: By Appointment Only</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="pt-4 border-t border-zinc-800">
              <a
                href={settings.whatsappUrl || "https://wa.me/251911234567"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Instantly on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
