import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-gold-500/20 border-t-gold-400 animate-spin shadow-[0_0_15px_rgba(212,175,55,0.3)]`}
        />
        {/* Inner subtle glow */}
        <div className="absolute inset-0 rounded-full blur-sm bg-gold-500/10 pointer-events-none" />
      </div>

      {text && (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-400 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>{text}</span>
        </div>
      )}
    </div>
  );
}
