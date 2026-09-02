"use client";

import React from "react";
import Image from "next/image";

interface BlurLoaderProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export default function BlurLoader({
  fullScreen = true,
  text = "Loading...",
  className = "",
}: BlurLoaderProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/25 backdrop-blur-md transition-all duration-300 animate-in fade-in"
    : `relative w-full min-h-[250px] flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm rounded-2xl transition-all ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl max-w-xs w-full text-center transform transition-transform hover:scale-105">
        {/* Animated Dual-Ring Spinner */}
        <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
          {/* Outer Rotating Gradient Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-400 animate-spin" />
          
          {/* Inner Counter-Rotating Pulsing Ring */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-orange-600 border-l-amber-500 animate-[spin_1.5s_linear_infinite_reverse] opacity-80" />

          {/* Centered Brand Logo/Icon */}
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-inner p-1">
            <Image
              src="/tas.logo.png"
              alt="TAS PRO Logo"
              width={32}
              height={32}
              className="object-contain animate-pulse"
              priority
            />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-sm font-bold tracking-wide text-gray-800 animate-pulse">
          {text}
        </p>

        {/* Subtitle pulse dots */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping [animation-delay:0.2s]" />
          <span className="w-2 h-2 rounded-full bg-orange-300 animate-ping [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
