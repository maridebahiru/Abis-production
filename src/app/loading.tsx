import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GlobalRouteLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-300">
      {/* Skeleton Card Container */}
      <div className="w-full max-w-xl p-8 rounded-3xl bg-zinc-900/60 border border-gold-500/20 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center space-y-6 text-center">
        <LoadingSpinner size="lg" text="Loading Abis Studio..." />
        
        {/* Shimmer line placeholders */}
        <div className="w-full space-y-3 pt-2">
          <div className="h-4 w-3/4 mx-auto rounded-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-3 w-1/2 mx-auto rounded-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
