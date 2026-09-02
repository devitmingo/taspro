"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Tag, Copy, Check, TicketPercent } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

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
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" };

      const res = await axios.get(`${API_BASE_URL}/coupons`, { headers });
      if (res.data?.status && Array.isArray(res.data.data)) {
        setCoupons(res.data.data);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.log("Failed to fetch coupons:", error);
      // Try customer coupons endpoint as fallback
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/customers/coupons`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
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
    <div className="w-full md:px-6 lg:px-8">
      <div className="w-full flex justify-between items-center mb-6">
        {/* Back */}
        <button
          onClick={() => setActiveView("default")}
          className="text-black dark:text-white font-semibold flex items-center gap-2 hover:text-orange-500 transition cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>My Coupons</span>
        </button>

        {coupons.length > 0 && !loading && (
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-3 py-1 rounded-full">
            {coupons.length} Active {coupons.length === 1 ? "Coupon" : "Coupons"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 max-w-lg mx-auto">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500">
            <TicketPercent className="w-7 h-7" />
          </div>
          <p className="text-gray-800 dark:text-gray-200 text-base font-semibold">
            No Coupons Available
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Check back later for exciting offers and seasonal discounts!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {coupons.map((item) => {
            const discountLabel =
              item.discount_type === "PERCENTAGE"
                ? `${item.discount_percent}% OFF`
                : `₹${Math.round(item.discount_amt)} OFF`;

            return (
              <div
                key={item.id}
                className="flex items-stretch rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow group relative"
              >
                {/* Left Gradient Icon Bar */}
                <div className="w-24 sm:w-28 flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#FF512F] to-[#F09819] text-white p-3">
                  <Tag className="w-7 h-7 mb-1 drop-shadow" />
                  <span className="text-[13px] font-black tracking-tight text-center leading-tight">
                    {discountLabel}
                  </span>
                </div>

                {/* Right Content */}
                <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug">
                        {item.title || discountLabel}
                      </h3>
                    </div>

                    {item.minimum_order_amt > 0 && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Min. order: ₹{Math.round(item.minimum_order_amt)}
                        {item.max_discount_amt > 0 &&
                          ` • Max discount: ₹${Math.round(item.max_discount_amt)}`}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 px-2.5 py-1 rounded-lg">
                      <span className="font-mono font-bold text-xs sm:text-sm text-orange-600 dark:text-orange-400 tracking-wider">
                        {item.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.end_date && (
                        <span className="text-[10px] text-gray-400">
                          Valid till {item.end_date}
                        </span>
                      )}

                      <button
                        onClick={() => handleCopy(item.code)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 px-2.5 py-1 rounded-md transition cursor-pointer"
                        title="Copy code"
                      >
                        {copiedCode === item.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
