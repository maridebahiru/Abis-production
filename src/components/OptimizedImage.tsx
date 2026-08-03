'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Camera } from 'lucide-react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  wrapperClassName?: string;
  showSkeleton?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  showSkeleton = true,
  loading,
  priority,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const isLazy = !priority && (loading || 'lazy') === 'lazy';

  return (
    <div className={`relative overflow-hidden ${props.fill ? 'w-full h-full' : ''} ${wrapperClassName}`}>
      {/* Shimmer Gold/Dark Skeleton Loader */}
      {showSkeleton && !isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-zinc-900 via-zinc-800/80 to-zinc-900 bg-[length:200%_100%] animate-shimmer flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gold-500/20 border-t-gold-400 animate-spin" />
        </div>
      )}

      {/* Fallback state on load error */}
      {hasError ? (
        <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
          <Camera className="w-8 h-8 text-gold-500/40 mb-2" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Abis Studio Media</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt || 'Abis Production Media'}
          loading={isLazy ? 'lazy' : undefined}
          priority={priority}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
