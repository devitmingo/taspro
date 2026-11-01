"use client";

import LayoutContainer from "./LayoutContainer";
import { Calendar, MapPin, Percent, Headphones } from "lucide-react";

const DownloadApp = () => {
  return (
    <section className="pb-6 sm:pb-10 pt-2">
      <LayoutContainer className="relative">
        <div className="w-full rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#0A0A0C] border border-neutral-800/80 shadow-2xl relative">
          {/* Subtle ambient orange glow in the right background */}
          <div className="absolute right-0 top-0 bottom-0 w-[45%] bg-gradient-to-l from-orange-600/15 via-orange-900/5 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[340px] relative">
            {/* Left Content */}
            <div className="p-6 sm:p-8 lg:p-10 lg:col-span-5 z-10 flex flex-col justify-center">
              {/* Orange Accent Bar */}
              <div className="w-10 h-1 bg-[#f97316] rounded-full mb-4" />

              {/* Heading */}
              <h2 className="text-white text-3xl sm:text-4xl lg:text-[40px] font-black leading-[1.12] tracking-tight mb-3">
                Download <br />
                <span className="text-[#f97316]">TASpro</span> App
              </h2>

              {/* Description */}
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-[380px] mb-6 font-normal">
                Book home services, track your orders, manage bookings and get exclusive offers — all in one place.
              </p>

              {/* App Badges + QR Code */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2.5">
                  <a
                    href="https://play.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-9 sm:h-10 w-auto"
                    />
                  </a>

                  <a
                    href="https://apple.com/app-store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                      className="h-9 sm:h-10 w-auto"
                    />
                  </a>
                </div>

                <div className="w-px h-16 bg-neutral-800 hidden sm:block mx-1"></div>

                <div className="flex flex-col items-center">
                  <div className="bg-white p-2 rounded-2xl shadow-lg border border-white/20">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://taspro.in"
                      alt="Scan QR Code"
                      className="w-16 h-16 sm:w-18 sm:h-18"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 font-medium tracking-tight">
                    Scan to Download
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Content - 2x2 Feature Grid */}
            <div className="px-6 py-4 sm:p-8 lg:p-6 lg:col-span-3 z-10">
              <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                {/* 1. Easy Booking */}
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-[#17171C] border border-neutral-800 flex items-center justify-center text-[#f97316] mb-2.5 shadow-inner">
                    <Calendar className="w-5 h-5 text-[#f97316]" />
                  </div>
                  <h4 className="text-white text-sm font-bold tracking-tight">Easy Booking</h4>
                  <p className="text-gray-400 text-[11px] sm:text-xs leading-snug">
                    Book any home service in just a few taps.
                  </p>
                </div>

                {/* 2. Track Orders */}
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-[#17171C] border border-neutral-800 flex items-center justify-center text-[#f97316] mb-2.5 shadow-inner">
                    <MapPin className="w-5 h-5 text-[#f97316]" />
                  </div>
                  <h4 className="text-white text-sm font-bold tracking-tight">Track Orders</h4>
                  <p className="text-gray-400 text-[11px] sm:text-xs leading-snug">
                    Get real-time updates on your service.
                  </p>
                </div>

                {/* 3. Exclusive Offers */}
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-[#17171C] border border-neutral-800 flex items-center justify-center text-[#f97316] mb-2.5 shadow-inner">
                    <Percent className="w-5 h-5 text-[#f97316]" />
                  </div>
                  <h4 className="text-white text-sm font-bold tracking-tight">Exclusive Offers</h4>
                  <p className="text-gray-400 text-[11px] sm:text-xs leading-snug">
                    Get app-only discounts and rewards.
                  </p>
                </div>

                {/* 4. 24x7 Support */}
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-[#17171C] border border-neutral-800 flex items-center justify-center text-[#f97316] mb-2.5 shadow-inner">
                    <Headphones className="w-5 h-5 text-[#f97316]" />
                  </div>
                  <h4 className="text-white text-sm font-bold tracking-tight">24x7 Support</h4>
                  <p className="text-gray-400 text-[11px] sm:text-xs leading-snug">
                    Quick help whenever you need it.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Graphic - Phone & Waves */}
            <div className="lg:col-span-4 relative flex items-center justify-center lg:justify-end h-full min-h-[320px] lg:min-h-[360px] overflow-hidden self-stretch pr-4 lg:pr-8">
              {/* Vibrant orange circular backdrop from Image 2 */}
              <div className="absolute right-12 sm:right-20 lg:right-20 top-1/2 -translate-y-1/2 w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] opacity-95 shadow-[0_0_80px_rgba(249,115,22,0.4)] pointer-events-none" />

              {/* Dark right-side decorative swoosh */}
              <div className="absolute -right-6 top-0 bottom-0 w-32 bg-gradient-to-l from-[#190C05]/90 via-[#261208]/60 to-transparent pointer-events-none" />

              {/* Crystal clear 3D Phone Mockup */}
              <div className="relative z-10 flex items-center justify-center h-full py-2">
                <img
                  src="/download-phone-taspro.png"
                  alt="TASpro App Mockup"
                  className="w-auto h-72 sm:h-80 lg:h-[340px] max-h-[360px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] select-none"
                />
              </div>

              {/* Handwritten note & arrow on the right */}
              <div className="absolute right-1 sm:right-3 lg:right-3 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col items-center pointer-events-none">
                {/* Curved Arrow */}
                <svg
                  className="w-8 h-8 text-white/80 -rotate-12 mb-1"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 32 30 Q 18 14 8 20" />
                  <path d="M 8 20 L 14 16" />
                  <path d="M 8 20 L 12 26" />
                </svg>

                <div className="text-center font-sans tracking-tight">
                  <p className="text-white/95 text-xs sm:text-sm font-semibold italic leading-tight">
                    Your
                  </p>
                  <p className="text-white/95 text-xs sm:text-sm font-semibold italic leading-tight">
                    Home Service
                  </p>
                  <p className="text-white/95 text-xs sm:text-sm font-semibold italic leading-tight">
                    Partner
                  </p>
                  <p className="text-white/95 text-xs sm:text-sm font-bold italic leading-tight relative mt-0.5">
                    Always with You
                    <span className="block w-full h-[2px] bg-orange-500 rounded-full mt-0.5"></span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
};

export default DownloadApp;
