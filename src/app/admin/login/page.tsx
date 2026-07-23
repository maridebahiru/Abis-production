'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, LogIn, Sparkles } from 'lucide-react';
import { bookingStore } from '@/lib/bookingStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@luxphotography.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await bookingStore.loginAdminWithSupabase(email, password);
      if (res.success) {
        setSuccessMsg('Authentication successful! Redirecting to Admin Dashboard...');
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 600);
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify your admin credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-gold-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border-2 border-gold-500/40 flex items-center justify-center mx-auto text-gold-400 shadow-gold-glow">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
              Restricted Area
            </span>
            <h1 className="font-serif text-2xl font-bold text-zinc-100">
              Abis Studio Admin Portal
            </h1>
            <p className="text-xs text-zinc-400">
              Sign in with your administrator credentials to access management tools.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-300 text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 text-center font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Admin Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@luxphotography.com"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Admin Password *</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:border-gold-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !email.trim() || !password.trim()}
            className="gold-btn w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
          >
            {isLoggingIn ? (
              <span>Authenticating with Supabase...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Admin Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <span className="font-semibold text-gold-400 block">Required Admin Email:</span>
            <code className="text-zinc-200 block font-mono">admin@luxphotography.com</code>
          </div>
        </div>
      </div>
    </div>
  );
}
