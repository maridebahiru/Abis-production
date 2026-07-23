'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';
import { Booking } from '@/types';
import { bookingStore } from '@/lib/bookingStore';

function LookupContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialEmail = searchParams.get('email') || '';

  const [refNumber, setRefNumber] = useState<string>(initialRef);
  const [email, setEmail] = useState<string>(initialEmail);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [cancelMessage, setCancelMessage] = useState<string>('');

  useEffect(() => {
    if (initialRef && initialEmail) {
      handleSearch(initialRef, initialEmail);
    }
  }, [initialRef, initialEmail]);

  const handleSearch = async (targetRef: string, targetEmail: string) => {
    if (!targetRef.trim() || !targetEmail.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setCancelMessage('');

    const res = await bookingStore.lookupBooking(targetRef, targetEmail);
    setBooking(res);
    setIsSearching(false);
  };

  const handleCancel = async () => {
    if (!booking) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const success = await bookingStore.cancelBooking(booking.referenceNumber, booking.customerEmail);
    if (success) {
      setCancelMessage('Your booking has been successfully cancelled.');
      const updated = await bookingStore.lookupBooking(booking.referenceNumber, booking.customerEmail);
      setBooking(updated);
    } else {
      setCancelMessage('Unable to cancel booking. Confirmed or completed bookings cannot be cancelled online.');
    }
  };

  const getStatusStep = (b: Booking) => {
    if (b.bookingStatus === 'Cancelled') return -1;
    if (b.bookingStatus === 'Completed') return 4;
    if (
      b.bookingStatus === 'Booking Confirmed' ||
      b.bookingStatus === 'Payment Confirmed' ||
      b.bookingStatus === 'Photos Uploaded' ||
      b.bookingStatus === 'Awaiting Selection' ||
      b.bookingStatus === 'Selection Submitted'
    ) return 3;
    if (b.bookingStatus === 'Payment Verified') return 2;
    return 1;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          <span>Order Status Tracking</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-100">
          Track Your Booking Progress
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300">
          Enter your Booking Reference Number and Email address below to verify your session status.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-2xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(refNumber, email);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Booking Reference Number *</label>
            <input
              type="text"
              placeholder="e.g., PHOTO-260721-0012"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono uppercase text-xs focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Email Address *</label>
            <input
              type="email"
              placeholder="e.g., customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSearching || !refNumber.trim() || !email.trim()}
              className="gold-btn w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <span>Checking Status...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Booking Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="animate-in fade-in duration-300">
          {!booking ? (
            <div className="p-8 rounded-3xl bg-zinc-900/60 border border-red-500/30 text-center space-y-3">
              <XCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-zinc-100">Booking Not Found</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No booking was found matching reference &ldquo;{refNumber}&rdquo; and email &ldquo;{email}&rdquo;. Please verify your details and try again.
              </p>
            </div>
          ) : (
            <div className="glass-card p-6 sm:p-10 rounded-3xl border border-gold-500/30 shadow-2xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                    Booking Reference
                  </span>
                  <div className="font-mono text-2xl font-bold text-gold-gradient">
                    {booking.referenceNumber}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    booking.bookingStatus === 'Booking Confirmed' || booking.bookingStatus === 'Completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : booking.bookingStatus === 'Cancelled'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>

              {booking.bookingStatus !== 'Cancelled' ? (
                <div className="space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                    Order Progress Steps:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                      { step: 1, label: 'Submitted', desc: 'Payment receipt uploaded' },
                      { step: 2, label: 'Payment Verified', desc: 'Payment proof approved' },
                      { step: 3, label: 'Booking Confirmed', desc: 'Crew & date scheduled' },
                      { step: 4, label: 'Completed', desc: 'Photos ready on portal' },
                    ].map((st) => {
                      const currentStepIndex = getStatusStep(booking);
                      const isDone = currentStepIndex >= st.step;
                      return (
                        <div
                          key={st.step}
                          className={`p-4 rounded-2xl border ${
                            isDone
                              ? 'bg-gold-500/10 border-gold-500/40 text-gold-300'
                              : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-gold-400' : 'text-zinc-700'}`} />
                            <span className="font-bold text-xs">{st.label}</span>
                          </div>
                          <span className="text-[10px] block opacity-80">{st.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-3">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>This booking has been cancelled. For further inquiries, please contact studio support.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 block">Service & Package</span>
                  <span className="font-bold text-zinc-100 text-sm">{booking.serviceName} ({booking.packageName})</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Scheduled Date & Time</span>
                  <span className="font-bold text-gold-400 text-sm">{booking.bookingDate} ({booking.bookingTime})</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Customer Contact</span>
                  <span className="text-zinc-200">{booking.customerName} ({booking.customerPhone})</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Event Location</span>
                  <span className="text-zinc-200">{booking.eventAddress}</span>
                </div>
              </div>

              {cancelMessage && (
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 text-center">
                  {cancelMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
                <Link
                  href="/client-gallery"
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-gold-400 hover:border-gold-500/40"
                >
                  Go to Client Photo Portal
                </Link>

                {(booking.bookingStatus === 'Pending Payment Verification' || booking.paymentStatus === 'Pending Review') && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-900/60"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gold-400">Loading booking details...</div>}>
      <LookupContent />
    </Suspense>
  );
}
