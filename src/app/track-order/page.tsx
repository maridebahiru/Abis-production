'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  KeyRound, 
  Lock, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Check, 
  X, 
  MessageSquare, 
  Send, 
  Download, 
  ShieldCheck,
  AlertCircle,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Booking, ClientGalleryPhoto, BookingStatusType } from '@/types';
import { bookingStore } from '@/lib/bookingStore';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('id') || searchParams.get('ref') || '';
  const initialPin = searchParams.get('pin') || '';

  const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId);
  const [pinInput, setPinInput] = useState<string>(initialPin);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [photos, setPhotos] = useState<ClientGalleryPhoto[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Photo Selection States
  const [filterTab, setFilterTab] = useState<'All' | 'Selected' | 'Rejected'>('All');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmittingSelection, setIsSubmittingSelection] = useState<boolean>(false);
  const [selectionSuccessMsg, setSelectionSuccessMsg] = useState<string>('');
  const [previewPhoto, setPreviewPhoto] = useState<ClientGalleryPhoto | null>(null);

  useEffect(() => {
    if (initialOrderId && initialPin) {
      handleLogin(initialOrderId, initialPin);
    }
  }, [initialOrderId, initialPin]);

  const handleLogin = async (targetOrderId: string, targetPin: string) => {
    if (!targetOrderId.trim() || !targetPin.trim()) return;

    setIsSearching(true);
    setErrorMsg('');
    setSelectionSuccessMsg('');

    const res = await bookingStore.lookupClientGallery(targetOrderId, targetPin);
    if (!res) {
      setErrorMsg('Invalid Order ID or Security PIN. Please double check your credentials.');
      setBooking(null);
      setPhotos([]);
    } else {
      setBooking(res);
      setPhotos(res.galleryPhotos || []);
    }
    setIsSearching(false);
  };

  const getStatusStepIndex = (status: BookingStatusType): number => {
    switch (status) {
      case 'Pending Payment Verification': return 0;
      case 'Payment Verified':
      case 'Payment Confirmed': return 1;
      case 'Photos Uploaded':
      case 'Awaiting Selection': return 2;
      case 'Selection Submitted': return 3;
      case 'Completed': return 4;
      case 'Cancelled': return -1;
      default: return 1;
    }
  };

  const toggleSelectPhoto = (photoId: string, desiredStatus: 'Selected' | 'Rejected') => {
    if (booking?.bookingStatus === 'Completed' || booking?.bookingStatus === 'Selection Submitted') {
      return; // Locked after final submission
    }
    const updated: ClientGalleryPhoto[] = photos.map((p) => {
      if (p.id === photoId) {
        const nextStatus: 'Selected' | 'Rejected' | 'Pending' = p.status === desiredStatus ? 'Pending' : desiredStatus;
        return { ...p, status: nextStatus };
      }
      return p;
    });
    setPhotos(updated);
  };

  const handleSaveComment = (photoId: string) => {
    const updated = photos.map((p) => {
      if (p.id === photoId) {
        return { ...p, comment: commentText.trim() };
      }
      return p;
    });
    setPhotos(updated);
    setEditingCommentId(null);
    setCommentText('');
  };

  const handleSubmitFinalSelection = async () => {
    if (!booking) return;

    const selectedCount = photos.filter((p) => p.status === 'Selected').length;
    if (selectedCount === 0) {
      alert('Please select at least 1 photo before submitting your selection.');
      return;
    }

    if (!confirm(`Are you sure you want to submit your final selection of ${selectedCount} photos? Once submitted, your selection will be sent to our retouching studio.`)) {
      return;
    }

    setIsSubmittingSelection(true);
    const updatedBooking = await bookingStore.submitCustomerPhotoSelection(booking.id, photos);
    setIsSubmittingSelection(false);

    if (updatedBooking) {
      setBooking(updatedBooking);
      setPhotos(updatedBooking.galleryPhotos || []);
      setSelectionSuccessMsg(`Selection Successfully Submitted! Your choices (${selectedCount} photos) have been dispatched to our post-production studio.`);
    }
  };

  const selectedPhotosCount = photos.filter((p) => p.status === 'Selected').length;
  const rejectedPhotosCount = photos.filter((p) => p.status === 'Rejected').length;
  const maxSelection = booking?.maxSelectionCount || 50;

  const displayedPhotos = photos.filter((p) => {
    if (filterTab === 'Selected') return p.status === 'Selected';
    if (filterTab === 'Rejected') return p.status === 'Rejected';
    return true;
  });

  const stepIndex = booking ? getStatusStepIndex(booking.bookingStatus) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
          <KeyRound className="w-4 h-4" />
          <span>Customer Order Portal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-100">
          Order Tracking & Photo Selection
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300 font-light">
          Track your booking progress, preview shot photos, mark your favorites, and submit retouch notes.
        </p>
      </div>

      {/* Login Screen if not logged in */}
      {!booking ? (
        <div className="glass-card max-w-md mx-auto p-8 rounded-3xl border border-gold-500/20 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-zinc-100 pt-2">Access Your Order</h2>
            <p className="text-xs text-zinc-400">Enter your Order ID (PS-2026-XXXXXX) and Security PIN</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-300 text-center flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(orderIdInput, pinInput);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Order ID *</label>
              <input
                type="text"
                placeholder="e.g. PS-2026-9B4E12"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 font-mono uppercase text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Security PIN *</label>
              <input
                type="password"
                placeholder="e.g. 784920"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 font-mono text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="gold-btn w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
            >
              {isSearching ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>View Order Progress</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Logged In Tracking Dashboard */
        <div className="space-y-10">
          {/* Order Banner & Top Details */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-gold-500/30 relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest">Order Reference</span>
                <h2 className="font-mono text-2xl sm:text-3xl font-bold text-zinc-100">{booking.referenceNumber}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setBooking(null);
                    setPhotos([]);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-all"
                >
                  Log Out
                </button>
              </div>
            </div>

            {/* Stepper Pipeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Order Progress Pipeline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Payment Confirmed', desc: 'Deposit received' },
                  { label: 'Photos Uploaded', desc: 'Studio uploaded shots' },
                  { label: 'Awaiting Selection', desc: 'Customer review open' },
                  { label: 'Selection Submitted', desc: 'Sent to retouch team' },
                  { label: 'Completed', desc: 'Final deliverables ready' },
                ].map((st, idx) => {
                  const isDone = idx < stepIndex || (idx === stepIndex && booking.bookingStatus === 'Completed');
                  const isCurrent = idx === stepIndex && booking.bookingStatus !== 'Completed';

                  return (
                    <div
                      key={st.label}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-gold-500/10 border-gold-500/40 text-gold-300'
                          : isCurrent
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? 'bg-gold-500 text-dark-bg'
                              : isCurrent
                              ? 'bg-amber-400 text-dark-bg'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                        </div>
                        <span className="text-xs font-bold leading-tight">{st.label}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 pt-1 pl-8">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/80 text-xs">
              <div>
                <span className="text-zinc-500 block">Customer Name</span>
                <span className="font-semibold text-zinc-200">{booking.customerName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Service & Package</span>
                <span className="font-semibold text-zinc-200">{booking.serviceName} ({booking.packageName})</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Session Date</span>
                <span className="font-semibold text-zinc-200">{booking.bookingDate} at {booking.bookingTime}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Payment Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {booking.paymentStatus} (${booking.amountPaid.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          {/* SUCCESS SELECTION ALERT */}
          {selectionSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{selectionSuccessMsg}</span>
              </div>
              <button onClick={() => setSelectionSuccessMsg('')} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PHOTO SELECTION SECTION */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="font-serif text-2xl font-bold text-zinc-100 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-gold-400" />
                  <span>Session Shot Photos</span>
                </h3>
                <p className="text-xs text-zinc-400 pt-1">
                  Mark photos as <strong className="text-emerald-400">Select</strong> or <strong className="text-red-400">Reject</strong> and add retouch requests before final submission.
                </p>
              </div>

              {/* Selection Counter Pill & Submit CTA */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gold-400" />
                  <span>Selected: <strong className="text-gold-400">{selectedPhotosCount}</strong> / {maxSelection}</span>
                </div>

                {booking.bookingStatus !== 'Selection Submitted' && booking.bookingStatus !== 'Completed' && (
                  <button
                    onClick={handleSubmitFinalSelection}
                    disabled={isSubmittingSelection || selectedPhotosCount === 0}
                    className="gold-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Selection</span>
                  </button>
                )}
              </div>
            </div>

            {/* Selection Filter Tabs */}
            <div className="flex items-center gap-2">
              {(['All', 'Selected', 'Rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filterTab === tab
                      ? 'bg-gold-500 text-dark-bg font-bold shadow-gold-glow'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab} ({tab === 'All' ? photos.length : tab === 'Selected' ? selectedPhotosCount : rejectedPhotosCount})
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className="p-12 text-center glass-card rounded-3xl border border-zinc-800 space-y-3">
                <Camera className="w-10 h-10 text-zinc-600 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-zinc-300">No Photos Uploaded Yet</h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Our photography crew is currently sorting and uploading your session shots. You will receive an instant notification once photos are available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedPhotos.map((photo) => {
                  const isSelected = photo.status === 'Selected';
                  const isRejected = photo.status === 'Rejected';

                  return (
                    <div
                      key={photo.id}
                      className={`glass-card rounded-2xl overflow-hidden border transition-all space-y-3 p-3 ${
                        isSelected
                          ? 'border-emerald-500/70 bg-emerald-950/20 shadow-emerald-900/30'
                          : isRejected
                          ? 'border-red-500/50 bg-red-950/20 opacity-60'
                          : 'border-zinc-800 hover:border-gold-500/30'
                      }`}
                    >
                      {/* Photo Image Box */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden group bg-zinc-900">
                        <Image
                          src={photo.url}
                          alt={photo.title || 'Session photo'}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => setPreviewPhoto(photo)}
                        />

                        {/* Overlay Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          {isSelected && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-dark-bg font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-lg">
                              <Check className="w-3 h-3 stroke-[3]" /> Selected
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-lg">
                              <X className="w-3 h-3 stroke-[3]" /> Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Comment preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-200 truncate">{photo.title || 'Studio Shot'}</span>
                        </div>

                        {/* Action Toggle Buttons */}
                        {booking.bookingStatus !== 'Selection Submitted' && booking.bookingStatus !== 'Completed' ? (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => toggleSelectPhoto(photo.id, 'Selected')}
                              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                isSelected
                                  ? 'bg-emerald-500 text-dark-bg shadow-md'
                                  : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isSelected ? 'Keep' : 'Select'}</span>
                            </button>

                            <button
                              onClick={() => toggleSelectPhoto(photo.id, 'Rejected')}
                              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                isRejected
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-400'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{isRejected ? 'Pass' : 'Reject'}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-zinc-400 font-semibold italic pt-1">
                            {isSelected ? '✓ Confirmed for Editing' : isRejected ? '✗ Excluded from Editing' : 'Pending'}
                          </div>
                        )}

                        {/* Retouch Comment Input / Display */}
                        <div className="pt-2 border-t border-zinc-800/60">
                          {editingCommentId === photo.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="e.g. Please touch up lighting or smooth background..."
                                className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:border-gold-400 focus:outline-none"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                  className="px-2.5 py-1 rounded-md text-[10px] text-zinc-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveComment(photo.id)}
                                  className="px-3 py-1 rounded-md bg-gold-500 text-dark-bg font-bold text-[10px]"
                                >
                                  Save Comment
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs">
                              {photo.comment ? (
                                <p className="text-[11px] text-gold-300 italic truncate flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3 text-gold-400 shrink-0" />
                                  "{photo.comment}"
                                </p>
                              ) : (
                                <span className="text-[10px] text-zinc-500">No retouch note</span>
                              )}

                              {booking.bookingStatus !== 'Selection Submitted' && booking.bookingStatus !== 'Completed' && (
                                <button
                                  onClick={() => {
                                    setEditingCommentId(photo.id);
                                    setCommentText(photo.comment || '');
                                  }}
                                  className="text-[10px] text-gold-400 font-semibold hover:underline flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  {photo.comment ? 'Edit Note' : '+ Note'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden">
              <Image
                src={previewPhoto.url}
                alt={previewPhoto.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-serif text-lg font-bold text-zinc-100">{previewPhoto.title}</h4>
              {previewPhoto.comment && (
                <p className="text-xs text-gold-300 italic">"{previewPhoto.comment}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading Order Portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
