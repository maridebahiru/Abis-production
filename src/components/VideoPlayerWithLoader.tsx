'use client';

import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Film, Play } from 'lucide-react';

interface VideoPlayerWithLoaderProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

export default function VideoPlayerWithLoader({
  src,
  poster,
  title = 'Video Player',
  className = '',
  autoPlay = false,
}: VideoPlayerWithLoaderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Check if src is YouTube / Vimeo iframe URL
  const isEmbed = src.includes('youtube.com') || src.includes('vimeo.com') || src.includes('youtu.be');

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 ${className}`}>
      {/* Video Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-dark-bg/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
          <LoadingSpinner size="lg" text="Loading 4K Cinema..." />
        </div>
      )}

      {isEmbed ? (
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 relative z-10"
        />
      ) : (
        <video
          src={src}
          poster={poster}
          controls
          autoPlay={autoPlay}
          onCanPlay={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setHasStarted(true);
          }}
          className="w-full h-full object-cover relative z-10"
        >
          Your browser does not support HTML5 video playback.
        </video>
      )}
    </div>
  );
}
