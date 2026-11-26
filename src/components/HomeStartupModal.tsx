"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/components/SafeImage";

const SERVICES = [
  { name: "AC Repair", icon: "/service-icons/ac.svg" },
  { name: "Washing Machine", icon: "/service-icons/washing-machine.svg" },
  { name: "Gas Stove Repair", icon: "/service-icons/gas-stove.svg" },
  { name: "Geyser Repair", icon: "/service-icons/geyser.svg" },
  { name: "Water Cooler", icon: "/service-icons/water-cooler.svg" },
  { name: "Kitchen Chimney", icon: "/service-icons/chimney.svg" },
  { name: "Refrigerator", icon: "/service-icons/refrigerator.svg" },
  { name: "Microwave", icon: "/service-icons/microwave.svg" },
  { name: "Water Purifier", icon: "/service-icons/water-purifier.svg" },
  { name: "TV Repair", icon: "/service-icons/tv.svg" },
  { name: "Computer Repair", icon: "/service-icons/computer.svg" },
  { name: "Deep Cleaning", icon: "/bathroom.png" },
];

export default function HomeStartupModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.location.search.includes("nomodal=1")) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const shown = localStorage.getItem("homeStartupModalShown");
      if (!shown) {
        timer = setTimeout(() => setOpen(true), 120);
      }
    } catch (e) {
      setOpen(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const close = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpen(false);
    try {
      localStorage.setItem("homeStartupModalShown", "1");
    } catch (e) {}
  };

  if (!mounted) return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={close}
          ></div>

          <div
            role="dialog"
            aria-label="Appliance Repair & Service"
            className={`relative w-[92%] sm:w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 transform transition-all duration-300 ${
              open ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-orange-500 hover:bg-orange-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shadow-md transition-all active:scale-95 z-20 cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-center text-orange-600 mb-1">
              Appliance Repair & Service
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 max-w-md mx-auto">
              Professional repair services for all your home appliances. Expert technicians at your service.
            </p>

            <div className="grid grid-cols-4 gap-4 sm:gap-6 max-h-[65vh] overflow-y-auto p-2 hide-scrollbar justify-items-center">
              {SERVICES.map((item) => (
                <div
                  key={item.name}
                  onClick={close}
                  className="group flex flex-col items-center text-center cursor-pointer"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#EDEDED] group-hover:bg-[#E5E5E7] p-3 sm:p-4 flex items-center justify-center border border-gray-100/50 transition-all duration-200 shadow-sm">
                    <SafeImage
                      src={item.icon}
                      alt={item.name}
                      width={90}
                      height={90}
                      fallbackSrc="/tas.logo.png"
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors mt-2 text-center leading-tight line-clamp-1 max-w-[100px]">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
