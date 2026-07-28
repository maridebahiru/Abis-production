'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CreditCard, 
  Upload, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertCircle,
  FileCheck,
  ShieldCheck,
  X
} from 'lucide-react';
import { 
  Service, 
  Package, 
  PaymentMethodType, 
  Booking,
  PaymentAccountDetails
} from '@/types';
import { bookingStore } from '@/lib/bookingStore';
import { PAYMENT_METHODS as INITIAL_PAYMENT_METHODS, TIME_SLOTS, getServiceCoverImage } from '@/lib/mockData';

function BookingContent() {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('service');
  const initialPackageId = searchParams.get('package');

  // Step state (1 through 9)
  const [step, setStep] = useState<number>(1);

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentAccountDetails[]>(INITIAL_PAYMENT_METHODS);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Availability state
  const [slotAvailabilityMap, setSlotAvailabilityMap] = useState<Record<string, boolean>>({});
  const [isCheckingSlots, setIsCheckingSlots] = useState<boolean>(false);

  // Customer Details Form State
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    eventAddress: '',
    eventType: 'Wedding Ceremony',
    numberOfGuests: 150,
    additionalNotes: '',
  });

  // Payment Proof Upload State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Telebirr');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string>('');
  const [receiptFileType, setReceiptFileType] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);

  // Submission Result State
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Load Services & Packages & Payment Settings
  useEffect(() => {
    async function loadData() {
      const sList = await bookingStore.getServices();
      const pList = await bookingStore.getPackages();
      const payList = await bookingStore.getPaymentSettings();

      const enabledServices = sList.filter((s) => s.isEnabled !== false);
      setServices(enabledServices);
      setPackages(pList);
      if (payList && payList.length > 0) setPaymentMethodsList(payList);

      if (initialServiceId) {
        const foundS = enabledServices.find((s) => s.id === initialServiceId);
        if (foundS) setSelectedService(foundS);
      } else if (enabledServices.length > 0) {
        setSelectedService(enabledServices[0]);
      }

      if (initialPackageId) {
        const foundP = pList.find((p) => p.id === initialPackageId);
        if (foundP) {
          setSelectedPackage(foundP);
          setAmountPaid(foundP.price);
        }
      }
    }
    loadData();
  }, [initialServiceId, initialPackageId]);

  useEffect(() => {
    if (selectedPackage) {
      setAmountPaid(selectedPackage.price);
    }
  }, [selectedPackage]);

  useEffect(() => {
    async function checkSlots() {
      if (!selectedDate) return;
      setIsCheckingSlots(true);
      const availMap: Record<string, boolean> = {};
      for (const slot of TIME_SLOTS) {
        availMap[slot] = await bookingStore.checkSlotAvailability(selectedDate, slot);
      }
      setSlotAvailabilityMap(availMap);
      setIsCheckingSlots(false);
    }
    checkSlots();
  }, [selectedDate]);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFormError('File size must be less than 10MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFormError('Allowed file formats: JPG, PNG, or PDF.');
      return;
    }

    setFormError('');
    setReceiptFile(file);
    setReceiptFileType(file.type);

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedPackage || !selectedDate || !selectedTimeSlot) {
      setFormError('Please complete all preceding steps before submitting.');
      return;
    }

    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.email || !customerInfo.eventAddress) {
      setFormError('Please fill in all required customer contact details.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      let finalReceiptUrl = receiptPreviewUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800';
      
      if (receiptFile) {
        try {
          const uploaded = await bookingStore.uploadReceiptFile(receiptFile);
          if (uploaded) {
            finalReceiptUrl = uploaded;
          }
        } catch (err) {
          console.warn('Receipt upload fallback', err);
        }
      }

      const created = await bookingStore.createBooking({
        serviceId: selectedService.id,
        serviceName: selectedService.title,
        packageName: selectedPackage.name,
        bookingDate: selectedDate,
        bookingTime: selectedTimeSlot,
        totalPrice: selectedPackage.price,
        customerName: customerInfo.fullName,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        eventAddress: customerInfo.eventAddress,
        eventType: customerInfo.eventType,
        numberOfGuests: customerInfo.numberOfGuests,
        additionalNotes: customerInfo.additionalNotes,
        paymentMethod: paymentMethod,
        amountPaid: amountPaid,
        transactionId: transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        receiptUrl: finalReceiptUrl,
        receiptFileName: receiptFile ? receiptFile.name : 'proof_receipt.png',
        receiptFileType: receiptFileType || 'image/png',
        paymentStatus: 'Pending Review',
        bookingStatus: 'Pending Payment Verification',
      });

      setSubmittedBooking(created);
      setStep(9);
    } catch (err) {
      console.error(err);
      setFormError('An error occurred while submitting your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePackagesForService = packages.filter((p) => {
    if (!selectedService) return true;
    return (
      p.serviceId === selectedService.id ||
      p.serviceId?.toLowerCase() === selectedService.id.toLowerCase() ||
      p.serviceId?.toLowerCase() === selectedService.title.toLowerCase() ||
      p.serviceId?.toLowerCase() === selectedService.category.toLowerCase()
    );
  });

  const displayedPackages = availablePackagesForService.length > 0 ? availablePackagesForService : packages;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Progress Bar */}
      {step < 9 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-gold-400">
              Step {step} of 8: {
                step === 1 ? 'Select Service' :
                step === 2 ? 'Select Package' :
                step === 3 ? 'Select Date' :
                step === 4 ? 'Select Time Slot' :
                step === 5 ? 'Customer Details' :
                step === 6 ? 'Review Summary' :
                step === 7 ? 'Payment Instructions' : 'Upload Receipt'
              }
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {Math.round((step / 8) * 100)}% Completed
            </span>
          </div>

          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-gold-gradient h-full rounded-full transition-all duration-500 shadow-gold-sm"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-gold-500/20 shadow-2xl relative">
        {/* STEP 1: SELECT SERVICE */}
              {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-100">
                Step 1: Choose Your Photography Service
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Select one of our specialized visual services:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      const pkgs = packages.filter((p) => p.serviceId === service.id);
                      if (pkgs.length > 0) setSelectedPackage(pkgs[0]);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-gold-500/15 border-gold-400 shadow-gold-glow scale-[1.02]'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-gold-500/30'
                    }`}
                  >
                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-zinc-950">
                      <Image
                        src={getServiceCoverImage(service)}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-gold-500 text-dark-bg">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-zinc-100 text-lg">
                        {service.title}
                      </h3>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Duration: {service.estimatedDuration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 flex justify-end">
              <button
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Continue to Packages</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE PACKAGE */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
                Selected Service: {selectedService?.title}
              </span>
              <h2 className="font-serif text-3xl font-bold text-zinc-100 mt-1">
                Step 2: Choose Your Package Tier
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-gold-500/15 border-gold-400 shadow-gold-glow scale-[1.02]'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-gold-500/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl font-bold text-zinc-100">{pkg.name}</h3>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-gold-400" />}
                      </div>
                      <p className="text-xs text-zinc-400">{pkg.tagline}</p>
                      <span className="text-xs font-semibold text-gold-400 block pt-1">{pkg.duration}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-3">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedPackage}
                onClick={() => setStep(3)}
                className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Continue to Date Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE DATE */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-100">
                Step 3: Select Shoot Date
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Select your preferred event date. Fully booked dates are automatically locked.
              </p>
            </div>

            <div className="max-w-md space-y-4">
              <label className="block text-xs font-semibold uppercase text-zinc-300">
                Select Date:
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:border-gold-400 focus:outline-none"
              />

              {selectedDate && (
                <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  <span>Selected Date: {selectedDate}</span>
                </div>
              )}
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedDate}
                onClick={() => setStep(4)}
                className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Continue to Time Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PREFERRED TIME SLOT */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-100">
                Step 4: Select Preferred Time
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Choose an available start time slot for {selectedDate}.
              </p>
            </div>

            {isCheckingSlots ? (
              <div className="p-8 text-center text-xs text-zinc-400 animate-pulse">
                Checking slot availability...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-xl">
                {TIME_SLOTS.map((slot) => {
                  const isAvailable = slotAvailabilityMap[slot] !== false;
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={!isAvailable}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                        !isAvailable
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'bg-gold-500 text-dark-bg border-gold-400 shadow-gold-sm scale-105'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-gold-500/40 hover:text-gold-400'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {slot}
                      </span>
                      {!isAvailable ? (
                        <span className="text-[10px] uppercase tracking-wider text-red-500">Booked</span>
                      ) : isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedTimeSlot}
                onClick={() => setStep(5)}
                className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Continue to Customer Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CUSTOMER DETAILS FORM */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-100">
                Step 5: Customer & Event Details
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Please enter your contact information and venue location so our team can coordinate details with you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Abebe Bekele"
                  value={customerInfo.fullName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. +251 911 234 567"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Event Type</label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Ceremony, Birthday Celebration"
                  value={customerInfo.eventType}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, eventType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Venue Location / Hotel *</label>
                <input
                  type="text"
                  placeholder="e.g. Sheraton Addis Hotel, Addis Ababa"
                  value={customerInfo.eventAddress}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, eventAddress: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Additional Notes / Special Requests</label>
                <input
                  type="text"
                  placeholder="Describe any special photography preferences..."
                  value={customerInfo.additionalNotes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, additionalNotes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!customerInfo.fullName || !customerInfo.phone || !customerInfo.email || !customerInfo.eventAddress}
                onClick={() => setStep(6)}
                className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: BOOKING SUMMARY */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-100">
                Step 6: Review Booking Summary
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Please review your selected service, date, and contact details before proceeding to payment instructions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-gold-500/30 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-zinc-800 pb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Selected Service</span>
                  <span className="font-serif text-xl font-bold text-gold-gradient">{selectedService?.title}</span>
                  <span className="text-xs text-zinc-300 block mt-1">{selectedPackage?.name}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Date & Time</span>
                  <span className="font-serif text-lg font-bold text-zinc-100">{selectedDate}</span>
                  <span className="text-xs text-gold-400 block font-medium">Time: {selectedTimeSlot}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
                <div>
                  <span className="text-zinc-500 block">Customer Name:</span>
                  <span className="font-semibold text-zinc-200">{customerInfo.fullName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Phone & Email:</span>
                  <span className="font-semibold text-zinc-200">{customerInfo.phone} ({customerInfo.email})</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-zinc-500 block">Venue Address:</span>
                  <span className="font-semibold text-zinc-200">{customerInfo.eventAddress}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setStep(5)}
                className="px-6 py-3 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
              <button
                onClick={() => setStep(7)}
                className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Continue to Payment Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: PAYMENT INSTRUCTIONS */}
        {step === 7 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-100">
                Step 7: Payment Instructions
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Choose your preferred Ethiopian payment method and complete the payment.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {paymentMethodsList.map((pm) => {
                const isSelected = paymentMethod === pm.method;
                return (
                  <button
                    key={pm.method}
                    onClick={() => setPaymentMethod(pm.method)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      isSelected
                        ? 'bg-gold-500 text-dark-bg border-gold-400 shadow-gold-sm font-extrabold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-gold-500/30'
                    }`}
                  >
                    {pm.method}
                  </button>
                );
              })}
            </div>

            {(() => {
              const activePM = paymentMethodsList.find((p) => p.method === paymentMethod) || paymentMethodsList[0];
              return (
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="font-serif text-xl font-bold text-gold-300">
                      {activePM?.method} Payment Instructions
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Account Name:</span>
                      <span className="font-bold text-zinc-100 text-sm">{activePM?.accountName}</span>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Account / Phone Number:</span>
                        <span className="font-mono text-sm font-bold text-gold-400">{activePM?.accountNumber}</span>
                      </div>
                      <button
                        onClick={() => handleCopyAccount(activePM?.accountNumber || '')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:text-gold-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? 'Copied!' : 'Copy Account Number'}</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <span className="text-zinc-400 font-semibold block mb-1">Instructions:</span>
                      <p className="text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-900">
                        {activePM?.instructions}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setStep(6)}
                className="px-6 py-3 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(8)}
                className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>I Have Paid — Upload Receipt</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: UPLOAD RECEIPT */}
        {step === 8 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-100">
                Step 8: Upload Payment Receipt
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Upload a screenshot or PDF of your transaction confirmation receipt.
              </p>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">
                  Payment Receipt File (JPG, PNG, PDF) *
                </label>
                <div className="border-2 border-dashed border-zinc-700 hover:border-gold-500/50 rounded-2xl p-6 text-center space-y-3 bg-zinc-900/60 transition-all relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleReceiptUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-gold-400 mx-auto" />
                  <div className="text-xs text-zinc-300">
                    <span className="font-semibold text-gold-400">Click or drag file to upload</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block">JPG, PNG or PDF up to 10MB</span>
                </div>

                {receiptFile && (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-zinc-200 truncate">{receiptFile.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setReceiptFile(null);
                        setReceiptPreviewUrl('');
                      }}
                      className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {receiptPreviewUrl && receiptFileType.startsWith('image/') && (
                  <div className="relative h-40 w-full rounded-xl overflow-hidden border border-zinc-800">
                    <Image src={receiptPreviewUrl} alt="Receipt Preview" fill className="object-contain bg-black" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Selected Payment Method</label>
                  <input
                    type="text"
                    readOnly
                    value={paymentMethod}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-gold-400 font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Transaction Reference / ID</label>
                  <input
                    type="text"
                    placeholder="e.g. TEL-98421048"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setStep(7)}
                className="px-6 py-3 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                disabled={isSubmitting || !receiptFile}
                onClick={handleSubmitBooking}
                className="gold-btn px-10 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow"
              >
                {isSubmitting ? (
                  <span>Submitting Booking...</span>
                ) : (
                  <>
                    <span>Submit Booking</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 9: SUCCESS CONFIRMATION */}
        {step === 9 && submittedBooking && (
          <div className="space-y-8 text-center animate-in zoom-in-95 duration-500 py-6">
            <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-400 flex items-center justify-center mx-auto shadow-gold-glow">
              <CheckCircle2 className="w-10 h-10 text-gold-400" />
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Booking Successfully Submitted
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-100">
                Thank you, {submittedBooking.customerName}!
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We have received your booking details and payment proof. Our team will verify your payment and confirm your schedule within 24 hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-gold-500/30 max-w-md mx-auto space-y-3 shadow-2xl">
              <span className="text-[11px] uppercase font-bold tracking-widest text-gold-400 block">
                Official Order ID & PIN
              </span>
              <div className="font-mono text-2xl font-bold text-gold-400 tracking-widest bg-black py-3 px-4 rounded-xl border border-gold-500/30 shadow-inner">
                {submittedBooking.referenceNumber}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                <span>Verification Security PIN:</span>
                <span className="font-mono font-bold text-gold-300 text-sm">{submittedBooking.galleryPin}</span>
              </div>
              <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-300 text-left">
                📱 <strong>Confirmation Sent:</strong> Your Order ID and Security PIN have been saved and dispatched to {submittedBooking.customerEmail} / {submittedBooking.customerPhone}.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link
                href={`/track-order?id=${submittedBooking.referenceNumber}&pin=${submittedBooking.galleryPin}`}
                className="gold-btn px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2"
              >
                <span>Track Order & Select Photos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="px-6 py-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold hover:border-gold-500/40 hover:text-zinc-100 transition-all flex items-center justify-center"
              >
                Return to Home Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gold-400">Loading booking form...</div>}>
      <BookingContent />
    </Suspense>
  );
}
