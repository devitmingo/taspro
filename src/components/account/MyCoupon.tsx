"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Tag,
  Copy,
  Check,
  TicketPercent,
  Calendar,
  Sparkles,
  Percent,
  Info,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useRouter } from "next/navigation";

type Props = {
  setActiveView: (view: string) => void;
};

interface CouponItem {
  id: number;
  code: string;
  title: string;
  discount_type: "FLAT" | "PERCENTAGE";
  discount_amt: number;
  discount_percent: number;
  minimum_order_amt: number;
  max_discount_amt: number;
  start_date: string;
  end_date: string;
  status: string;
}

export default function MyCoupon({ setActiveView }: Props) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token
        ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
        : { Accept: "application/json" };

      const res = await axios.get(`${API_BASE_URL}/coupons`, { headers });
      if (res.data?.status && Array.isArray(res.data.data)) {
        setCoupons(res.data.data);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.log("Failed to fetch coupons:", error);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/customers/coupons`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (res.data?.status && Array.isArray(res.data.data)) {
          setCoupons(res.data.data);
        } else {
          setCoupons([]);
        }
      } catch (err) {
        console.log("Customer coupons fallback failed:", err);
        setCoupons([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* 1. Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveView("default")}
            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50/60 hover:bg-orange-50 hover:border-orange-200 text-gray-700 hover:text-[#FF6A00] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              My Coupons
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Available promo codes and instant discount vouchers for your home service bookings
            </p>
          </div>
        </div>

        {coupons.length > 0 && !loading && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-bold text-[#FF6A00] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <TicketPercent className="w-3.5 h-3.5" />
              <span>
                {coupons.length} Active {coupons.length === 1 ? "Offer" : "Offers"}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Helpful Info Banner */}
      <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100 flex items-start gap-3 text-xs text-gray-600">
        <Sparkles className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-gray-900">How to use:</strong> Copy your chosen promo code below and apply it in the coupon field during checkout to enjoy instant savings on your order.
        </p>
      </div>

      {/* 3. Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse p-4"
            />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        /* 4. Empty State */
        <div className="text-center py-14 px-4 rounded-3xl bg-gray-50/60 border border-dashed border-gray-200 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200/80 text-[#FF6A00] flex items-center justify-center mx-auto shadow-2xs">
            <TicketPercent className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              No Coupons Available Right Now
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Check back frequently! We regularly release festive deals, seasonal discounts and special loyalty rewards.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>Explore All Services</span>
            </button>
          </div>
        </div>
      ) : (
        /* 5. Coupons Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {coupons.map((item) => {
            const isPercent = item.discount_type === "PERCENTAGE";
            const discountLabel = isPercent
              ? `${item.discount_percent}% OFF`
              : `₹${Math.round(item.discount_amt)} FLAT OFF`;

            const isCopied = copiedCode === item.code;

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200/90 hover:border-orange-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all relative flex flex-col justify-between space-y-4 group overflow-hidden"
              >
                {/* Decorative subtle border top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6A00] to-amber-400 opacity-90" />

                {/* Top Section */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/70 text-[#FF6A00] flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6A00] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60 inline-block mb-1">
                        {discountLabel}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                        {item.title || discountLabel}
                      </h3>
                      {item.minimum_order_amt > 0 && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          Valid on orders above ₹{Math.round(item.minimum_order_amt)}
                          {item.max_discount_amt > 0 &&
                            ` (Max ₹${Math.round(item.max_discount_amt)})`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom dashed border & Code Copy Button */}
                <div className="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between gap-3">
                  <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">CODE:</span>
                    <span className="font-mono font-extrabold text-xs sm:text-sm text-gray-900 tracking-wider">
                      {item.code}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(item.code)}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isCopied
                        ? "bg-green-600 text-white"
                        : "bg-[#FF6A00] hover:bg-[#F05A00] text-white"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
