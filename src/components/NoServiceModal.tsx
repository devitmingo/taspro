"use client";

import { MapPin, X } from "lucide-react";

interface NoServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  onSelectAnotherCity?: () => void;
  onContinueDefaultCity?: (defaultCity?: string) => void;
  availableCities?: string[];
}

export default function NoServiceModal({
  isOpen,
  onClose,
  cityName,
}: NoServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 relative text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 text-orange-500 shadow-inner">
          <MapPin className="w-8 h-8 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          We are currently not serving in <span className="text-orange-500">{cityName || "your city"}</span>
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          We are working hard to expand our services to {cityName || "your city"} soon! In the meantime, you can pick a served city from the navbar.
        </p>
      </div>
    </div>
  );
}
