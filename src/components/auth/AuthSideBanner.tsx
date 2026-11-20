"use client";

export default function AuthSideBanner() {
  return (
    <div className="w-full md:w-[48%] lg:w-[49%] relative bg-[#FDF4EF] overflow-hidden shrink-0 select-none flex items-center justify-center p-4 sm:p-6 border-t md:border-t-0 md:border-l border-orange-100/70">
      <div className="relative w-full h-full max-w-[420px] max-h-[560px] flex items-center justify-center">
        <img
          src="/auth-side-banner-clean.png"
          alt="Home Services Made Easy with TASPro"
          className="w-full h-auto max-h-full max-w-full object-contain object-center select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
