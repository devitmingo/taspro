"use client";

import { MapPin, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface NoServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  onSelectAnotherCity?: () => void;
  onContinueDefaultCity?: (defaultCity?: string) => void;
  onExploreAvailable?: () => void;
  availableCities?: string[];
  serviceName?: string;
  isCityServed?: boolean;
}

export default function NoServiceModal({
  isOpen,
  onClose,
  cityName,
  onSelectAnotherCity,
  onContinueDefaultCity,
  onExploreAvailable,
  availableCities = [],
  serviceName,
  isCityServed: explicitCityServed,
}: NoServiceModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  const cityLower = (cityName || "").toLowerCase().trim();
  const isCityServed =
    explicitCityServed !== undefined
      ? explicitCityServed
      : availableCities && availableCities.length > 0
        ? availableCities.some(
            (c: any) =>
              (typeof c === "string" ? c : c?.name || "").toLowerCase().trim() ===
              cityLower
          )
        : cityLower === "raipur";

  const handleExplore = () => {
    onClose();
    if (onExploreAvailable) {
      onExploreAvailable();
    } else {
      router.push("/");
    }
  };

  const handleContinueDefault = () => {
    onClose();
    if (onContinueDefaultCity) {
      onContinueDefaultCity("Raipur");
    } else {
      router.push("/");
    }
  };

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

        {isCityServed ? (
          <>
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              Service Not Available in{" "}
              <span className="text-orange-500">{cityName || "this city"}</span>
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              {serviceName
                ? `We haven't launched "${serviceName}" in ${cityName} yet.`
                : `This specific service is not currently offered in ${cityName}.`}{" "}
              Explore all our other popular services available in {cityName}!
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleExplore}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Services in {cityName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onSelectAnotherCity && (
                <button
                  onClick={onSelectAnotherCity}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
                >
                  Change Location
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              We are currently not serving in{" "}
              <span className="text-orange-500">{cityName || "your city"}</span>
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              We are working hard to expand our services to {cityName || "your city"} soon! In the meantime, you can explore services in our operational hub Raipur.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleContinueDefault}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue in Raipur</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onSelectAnotherCity && (
                <button
                  onClick={onSelectAnotherCity}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
                >
                  Select City from Nav
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
