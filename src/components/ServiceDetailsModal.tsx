"use client";

import {
  X,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  ShoppingCart,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import WarrantyModal from "@/components/WarrantyModal";
import RateCardModal from "@/components/RateCardModal";
import { useBooking } from "@/context/BookingContext";
import { getImageUrl } from "@/config/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  onAdd: () => void;
}

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  service,
  onAdd,
}: Props) {
  if (!isOpen || !service) return null;

  const { cartItems, removeFromCart } = useBooking();

  const cartItem = cartItems.find(
    (item) => Number(item.id) === Number(service.id)
  );

  const quantity = cartItem?.quantity || 0;
  const [showWarranty, setShowWarranty] = useState(false);
  const [showRateCard, setShowRateCard] = useState(false);

  // Accordion states
  const [inclusionsOpen, setInclusionsOpen] = useState(true);
  const [exclusionsOpen, setExclusionsOpen] = useState(true);
  const [reviewsOpen, setReviewsOpen] = useState(true);

  const updateQuantity = (type: "increase" | "decrease") => {
    if (type === "increase") {
      onAdd();
    } else {
      removeFromCart(service.id);
    }
  };

  const handleBottomAction = () => {
    if (quantity === 0) {
      onAdd();
    }
  };

  const cleanHtmlText = (html?: string) => {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  // Helper to extract items from HTML or comma/newline text
  const extractListItems = (raw?: string): string[] => {
    if (!raw) return [];
    // If HTML contains <li> tags
    const liMatches = raw.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches && liMatches.length > 0) {
      return liMatches
        .map((m) => cleanHtmlText(m))
        .filter((t) => t.length > 0);
    }
    // Clean and split by newlines
    const cleaned = cleanHtmlText(raw);
    if (!cleaned) return [];
    const lines = cleaned
      .split(/\r?\n|•|\u2022/)
      .map((l) => l.trim().replace(/^[-*]\s*/, ""))
      .filter((l) => l.length > 0);
    return lines;
  };

  // Raw fields normalization
  const issueMoreDetailsList = Array.isArray(service?.issueMoreDetails)
    ? service.issueMoreDetails
    : service?.issueMoreDetails
    ? [service.issueMoreDetails]
    : service?.issue_more_details
    ? [service.issue_more_details]
    : [];

  const issueMoreDetailsObj = issueMoreDetailsList[0] || service?.details || {};

  const issueDescriptionsObj =
    service?.issueDescriptions ||
    service?.issue_descriptions ||
    service?.descriptions ||
    {};

  // Service Name & Badges
  const title = service.name || service.title || "Service Details";
  const categoryBadge =
    service.category_name ||
    service.service_name ||
    service.sub_category_name ||
    "Appliances Repair & Service";

  const packageTag =
    service.packageTag ||
    service.package_tag ||
    service.tag ||
    null;

  // Pricing
  const currentPrice = Number(
    service.discountedPrice ||
      service.price ||
      service.final_price ||
      service.base_price ||
      0
  );

  const originalPrice = Number(
    service.originalPrice ||
      service.strike_price ||
      (currentPrice ? Math.round(currentPrice * 1.15) : 0)
  );

  const savingsAmount = Math.max(0, originalPrice - currentPrice);
  const savingsPercent =
    originalPrice > 0 && savingsAmount > 0
      ? Math.round((savingsAmount / originalPrice) * 100)
      : 0;

  const duration =
    service.duration ||
    (service.duration_minutes ? `≈ ${service.duration_minutes} Min` : null) ||
    "≈ 30 Min";

  const ratingVal =
    typeof service.rating === "number"
      ? service.rating.toFixed(1)
      : service.rating || "5.0";

  const reviewCount =
    service.reviews || service.review_count || service.total_reviews || "1";

  // Warranty
  const warrantyDays =
    service.warrantyDays ||
    service.warranty_days ||
    issueMoreDetailsObj?.warranty_days ||
    30;

  const warrantyTitle =
    service.warranty_title ||
    service.warrantyTitle ||
    `${warrantyDays} Days Warranty`;

  const warrantyDesc =
    cleanHtmlText(service.warranty_description || service.warrantyDescription) ||
    cleanHtmlText(issueMoreDetailsObj?.warranty_description) ||
    "Service assurance for a worry-free experience.";

  // Service Inclusions
  const rawInclusions =
    service.inclusions ||
    service.inclusion ||
    service.details?.inclusions ||
    issueMoreDetailsObj?.inclusions ||
    "";
  const parsedInclusions = extractListItems(rawInclusions);

  // Service Exclusions
  const rawExclusions =
    service.exclusions ||
    service.exclusion ||
    service.details?.exclusions ||
    issueMoreDetailsObj?.exclusions ||
    "";
  const parsedExclusions = extractListItems(rawExclusions);

  // Service Overview Points
  const rawOverview =
    service.overview ||
    service.description ||
    service.descriptions?.description ||
    service.issue_descriptions?.description ||
    issueDescriptionsObj?.description ||
    "";
  const parsedOverview = extractListItems(rawOverview);

  // Important / Please Note
  const rawNotes =
    service.important_notes ||
    service.importantNotes ||
    service.details?.important_notes ||
    service.issue_more_details?.important_notes ||
    issueMoreDetailsObj?.important_notes ||
    "";
  const parsedNotes = extractListItems(rawNotes);

  const selectedCity = (() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("selected_location");
        if (saved) return JSON.parse(saved).city || "Raipur";
      } catch (e) {}
    }
    return "Raipur";
  })();

  // Reviews Data
  const defaultReviews = [
    {
      name: "Pranjali Verma",
      rating: 5,
      time: "1 year ago",
      text: `Best AC Repair Service Service in ${selectedCity}`,
    },
  ];

  const activeReviews =
    Array.isArray(service?.reviews_list) && service.reviews_list.length > 0
      ? service.reviews_list
      : defaultReviews;

  const totalReviewsCount = activeReviews.length;

  // Feature bar items
  const featureBarItems = [
    { icon: "❄️", text: "Better Cooling" },
    { icon: "🍃", text: "Clean & Fresh Air" },
    { icon: "⚡", text: "Lower Power Bill" },
    { icon: "⏱️", text: "Longer AC Life" },
  ];

  // Service image URL (replacing carousel slider)
  const imageSrc =
    service.image ||
    service.icon_url ||
    service.icon ||
    null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-[110] p-2 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md sm:max-w-lg rounded-3xl relative shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100">
          
          {/* Top Right Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md z-30 transition-transform active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Scrollable Container */}
          <div
            className="overflow-y-auto flex-1 p-0 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* 1️⃣ Hero Service Image (Replaced slider) */}
            <div className="relative bg-gradient-to-b from-orange-50/40 via-slate-50/50 to-white pt-6 pb-4 px-4 text-center select-none overflow-hidden flex flex-col items-center justify-center">
              {/* Category Badge */}
              <div className="inline-block bg-orange-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs mb-3 tracking-wide">
                {categoryBadge}
              </div>

              {/* Service Hero Image */}
              <div className="w-full max-w-[280px] h-36 sm:h-44 relative flex items-center justify-center py-1">
                {imageSrc ? (
                  <img
                    src={getImageUrl(imageSrc, "/tas.logo.png")}
                    alt={title}
                    className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = "/tas.logo.png";
                    }}
                  />
                ) : (
                  <div className="h-28 w-28 bg-orange-50 rounded-2xl flex flex-col items-center justify-center text-orange-500 border border-orange-100">
                    <img
                      src="/tas.logo.png"
                      alt={title}
                      className="max-h-16 max-w-16 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2️⃣ Feature Highlights Bar */}
            <div className="border-y border-gray-100 bg-gray-50/70 px-3 py-2 flex items-center justify-between text-[10.5px] sm:text-xs font-medium text-gray-700 select-none">
              {featureBarItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span className="whitespace-nowrap">{item.text}</span>
                  {idx < featureBarItems.length - 1 && (
                    <span className="text-gray-300 ml-2 sm:ml-3">|</span>
                  )}
                </div>
              ))}
            </div>

            {/* 3️⃣ Main Service Info & Price */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Service Title Row with Stepper */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                      {title}
                    </h3>
                    {packageTag && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold text-orange-600 bg-orange-50 rounded-md border border-orange-200">
                        {packageTag}
                      </span>
                    )}
                  </div>

                  {/* Rating & Duration */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-1 font-bold text-gray-800">
                      <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                      <span>{ratingVal}</span>
                    </div>
                    <span>|</span>
                    <span className="text-gray-500">({reviewCount} Review)</span>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{duration}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xl sm:text-2xl font-black text-gray-900">
                      ₹{currentPrice}
                    </span>
                    {originalPrice > currentPrice && (
                      <span className="text-xs sm:text-sm text-gray-400 line-through font-semibold">
                        ₹{originalPrice}
                      </span>
                    )}
                    {savingsAmount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200/60">
                        Save ₹{savingsAmount} ({savingsPercent}% OFF)
                      </span>
                    )}
                  </div>
                </div>

                {/* Counter Stepper Button */}
                <div className="shrink-0 pt-1">
                  {quantity === 0 ? (
                    <button
                      onClick={() => updateQuantity("increase")}
                      className="border-2 border-orange-500 text-orange-600 font-extrabold rounded-full px-6 py-1.5 text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      Add +
                    </button>
                  ) : (
                    <div className="flex items-center border border-orange-400 px-3 py-1 rounded-full gap-3 bg-orange-50/60 shadow-xs">
                      <button
                        onClick={() => updateQuantity("decrease")}
                        className="text-orange-600 font-black text-sm hover:scale-110 transition-transform cursor-pointer px-1"
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <span className="text-xs font-black text-gray-900 min-w-[12px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity("increase")}
                        className="text-orange-600 font-black text-sm hover:scale-110 transition-transform cursor-pointer px-1"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 4️⃣ Standard Rate Card Banner */}
              <button
                onClick={() => setShowRateCard(true)}
                className="w-full border border-orange-200/80 bg-orange-50/50 hover:bg-orange-100/60 transition-colors rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 flex justify-between items-center group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Standard Rate Card – No Hidden Charges</span>
                </div>
                <span className="text-orange-500 font-black text-base group-hover:translate-x-0.5 transition-transform">
                  ›
                </span>
              </button>

              {/* 5️⃣ Warranty Box */}
              <div
                onClick={() => setShowWarranty(true)}
                className="rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50/70 to-indigo-50/40 border border-sky-100 p-3.5 flex items-center gap-3 cursor-pointer hover:border-sky-200 transition-all shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                    {warrantyTitle}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    {warrantyDesc}
                  </p>
                </div>
              </div>

              {/* 6️⃣ Service Overview */}
              <div className="pt-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-gray-700" />
                  <h4 className="text-sm font-black text-gray-900">
                    Service Overview
                  </h4>
                </div>

                <div className="bg-gray-50/60 rounded-2xl p-3.5 border border-gray-100 space-y-2">
                  <p className="text-xs font-bold text-gray-900">
                    After {title} Service, You Will Notice:
                  </p>
                  {parsedOverview.length > 0 ? (
                    <div className="space-y-1.5 pl-0.5">
                      {parsedOverview.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Service overview not available for this service.
                    </p>
                  )}
                </div>
              </div>

              {/* 7️⃣ What's Included? (Service Inclusions) */}
              <div className="border border-emerald-100 bg-emerald-50/20 rounded-2xl overflow-hidden transition-all shadow-2xs">
                <button
                  onClick={() => setInclusionsOpen(!inclusionsOpen)}
                  className="w-full px-3.5 py-3 text-left flex justify-between items-center bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-black text-gray-900">
                      What&apos;s Included? (Service Inclusions)
                    </span>
                  </div>
                  {inclusionsOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {inclusionsOpen && (
                  <div className="p-3.5 pt-2 border-t border-emerald-100/60 bg-white">
                    {parsedInclusions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                        {parsedInclusions.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-1">
                        Inclusions not available for this service.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 8️⃣ What's Not Included? (Exclusions) */}
              <div className="border border-rose-100 bg-rose-50/20 rounded-2xl overflow-hidden transition-all shadow-2xs">
                <button
                  onClick={() => setExclusionsOpen(!exclusionsOpen)}
                  className="w-full px-3.5 py-3 text-left flex justify-between items-center bg-rose-50/40 hover:bg-rose-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-xs font-black text-gray-900">
                      What&apos;s Not Included? (Exclusions)
                    </span>
                  </div>
                  {exclusionsOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {exclusionsOpen && (
                  <div className="p-3.5 pt-2 border-t border-rose-100/60 bg-white">
                    {parsedExclusions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                        {parsedExclusions.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-1">
                        Exclusions not available for this service.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 9️⃣ Please Note */}
              <div className="rounded-2xl bg-gray-50/70 border border-gray-100 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-700 shrink-0" />
                  <h4 className="text-xs font-black text-gray-900">
                    Please Note
                  </h4>
                </div>
                {parsedNotes.length > 0 ? (
                  <div className="space-y-1.5 pl-6 text-xs text-gray-600 leading-relaxed list-disc">
                    {parsedNotes.map((note, idx) => (
                      <p key={idx} className="relative before:content-['•'] before:absolute before:-left-3 before:text-gray-400">
                        {note}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic pl-6">
                    Note details not available.
                  </p>
                )}
              </div>

              {/* 🔟 Reviews Section */}
              <div className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setReviewsOpen(!reviewsOpen)}
                  className="w-full px-3.5 py-3 text-left flex justify-between items-center bg-gray-50/40 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-700 shrink-0" />
                    <span className="text-xs font-black text-gray-900">
                      Reviews ({totalReviewsCount})
                    </span>
                  </div>
                  {reviewsOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {reviewsOpen && (
                  <div className="p-4 pt-2 border-t border-gray-100 space-y-4">
                    {/* Rating Breakdown Bar */}
                    <div className="flex items-center gap-4 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100">
                      <div className="text-center shrink-0 pr-1">
                        <span className="text-3xl font-black text-gray-900 block leading-none">
                          {ratingVal}
                        </span>
                        <div className="flex items-center justify-center gap-0.5 text-orange-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-orange-500 text-orange-500" />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block font-semibold">
                          {totalReviewsCount} Review
                        </span>
                      </div>

                      <div className="flex-1 space-y-1 border-l border-gray-200 pl-4">
                        {[
                          { star: 5, pct: "100%" },
                          { star: 4, pct: "0%" },
                          { star: 3, pct: "0%" },
                          { star: 2, pct: "0%" },
                          { star: 1, pct: "0%" },
                        ].map((row) => (
                          <div key={row.star} className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span className="w-2.5 font-bold">{row.star}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: row.pct }}
                              />
                            </div>
                            <span className="w-6 text-right font-medium text-gray-400">
                              {row.pct}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Review Card */}
                    <div className="space-y-3">
                      {activeReviews.map((rev: any, i: number) => (
                        <div key={i} className="flex gap-3 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0 text-sm">
                            {rev.name ? rev.name.charAt(0) : "U"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-gray-900">{rev.name}</p>
                              <span className="text-[10px] text-gray-400">{rev.time || "1 year ago"}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-orange-500 my-1">
                              {[...Array(Number(rev.rating || 5))].map((_, idx) => (
                                <Star key={idx} className="w-3 h-3 fill-orange-500 text-orange-500" />
                              ))}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {rev.text ? rev.text.replace(/\bRaipur\b/gi, selectedCity) : `Best AC Repair Service Service in ${selectedCity}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="border-t border-gray-200 bg-white p-3 sm:p-4 px-4 sm:px-6 shadow-lg z-20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-gray-900">
                    ₹{currentPrice}
                  </span>
                  {originalPrice > currentPrice && (
                    <span className="text-xs sm:text-sm text-gray-400 line-through font-semibold">
                      ₹{originalPrice}
                    </span>
                  )}
                </div>
                {savingsAmount > 0 && (
                  <span className="inline-block px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-200/60">
                    Save ₹{savingsAmount} ({savingsPercent}% OFF)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link href="/cart">
                  <button
                    onClick={handleBottomAction}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>View Cart →</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WarrantyModal
        open={showWarranty}
        onClose={() => setShowWarranty(false)}
        service={service}
      />

      <RateCardModal
        isOpen={showRateCard}
        onClose={() => setShowRateCard(false)}
      />
    </>
  );
}
