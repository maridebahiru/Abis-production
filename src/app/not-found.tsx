import Link from 'next/link';
import { Camera, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
          <Camera className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-zinc-100">404 — Page Not Found</h1>
          <p className="text-xs text-zinc-400">
            The page or session portal resource you are looking for does not exist or has been relocated.
          </p>
        </div>
        <Link
          href="/"
          className="gold-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-gold-glow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Studio Home</span>
        </Link>
      </div>
    </div>
  );
}
