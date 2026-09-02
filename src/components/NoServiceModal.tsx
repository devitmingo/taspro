"use client";

import { MapPin, X, ArrowRight, Building2 } from "lucide-react";

interface NoServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  onSelectAnotherCity: () => void;
  onContinueDefaultCity: (defaultCity?: string) => void;
  availableCities?: string[];
}

export default function NoServiceModal({
  isOpen,
  onClose,
  cityName,
  onSelectAnotherCity,
  onContinueDefaultCity,
  availableCities = ["Raipur", "Durg", "Bhilai"],
}: NoServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          We are working hard to expand our services to {cityName || "your city"} soon! In the meantime, you can pick a served city from the navbar or continue with our operational hub.
        </p>

        {/* Serving Cities Badges */}
        {availableCities.length > 0 && (
          <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Operational Cities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => onContinueDefaultCity(city)}
                  className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-orange-500 hover:text-orange-500 transition-colors shadow-2xs"
                >
                  📍 {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={onSelectAnotherCity}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Select City from Nav</span>
          </button>

          <button
            onClick={() => onContinueDefaultCity("Raipur")}
            className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
          >
            <span>Continue in Raipur</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
