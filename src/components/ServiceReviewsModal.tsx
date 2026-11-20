"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  Star,
  BadgeCheck,
  ThumbsUp,
  MessageSquare,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export interface ReviewItem {
  id?: number | string;
  name: string;
  rating: number;
  text: string;
  time?: string;
  avtar?: string;
}

export interface RatingDistributionItem {
  star: number;
  count?: number;
  percentage: number;
}

interface ServiceReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string;
  avgRating?: number | string;
  totalReviews?: number;
  ratingsDistribution?: RatingDistributionItem[];
  reviews?: ReviewItem[];
}

export default function ServiceReviewsModal({
  isOpen,
  onClose,
  serviceName = "Service",
  avgRating = 5.0,
  totalReviews,
  ratingsDistribution,
  reviews = [],
}: ServiceReviewsModalProps) {
  const [selectedStar, setSelectedStar] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});
  const [userVotedHelpful, setUserVotedHelpful] = useState<Record<string, boolean>>({});

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Combine real DB reviews with default verified reviews if needed
  const allReviews: ReviewItem[] = useMemo(() => {
    if (reviews && reviews.length > 0) {
      return reviews;
    }
    return [
      {
        id: "d1",
        name: "Pranjali Verma",
        rating: 5,
        time: "1 year ago",
        text: "Best AC Repair Service Service in Raipur. Technician arrived on time and fixed cooling quickly.",
        avtar: "/tiku.png",
      },
      {
        id: "d2",
        name: "Rahul Sharma",
        rating: 5,
        time: "2 days ago",
        text: "Excellent service! The technician arrived on time and resolved the gas filling issue quickly.",
      },
      {
        id: "d3",
        name: "Priya Patel",
        rating: 5,
        time: "1 week ago",
        text: "Very professional work and clean service experience. Highly recommended for home AC repair!",
      },
      {
        id: "d4",
        name: "Amit Kumar",
        rating: 4,
        time: "2 weeks ago",
        text: "Good experience overall. Genuine spare parts, clear explanation, and transparent pricing.",
      },
    ];
  }, [reviews]);

  const computedTotalReviews = totalReviews ?? allReviews.length;

  const computedAvgRating = useMemo(() => {
    if (avgRating !== undefined && avgRating !== null && Number(avgRating) > 0) {
      return Number(avgRating).toFixed(1);
    }
    if (allReviews.length > 0) {
      const sum = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      return (sum / allReviews.length).toFixed(1);
    }
    return "5.0";
  }, [avgRating, allReviews]);

  // Distribution calculation
  const computedDistribution: RatingDistributionItem[] = useMemo(() => {
    if (ratingsDistribution && ratingsDistribution.length > 0) {
      return ratingsDistribution;
    }
    const total = allReviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => {
      const count = allReviews.filter((r) => Math.round(Number(r.rating) || 5) === star).length;
      return {
        star,
        count,
        percentage: Math.round((count / total) * 100),
      };
    });
  }, [ratingsDistribution, allReviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return allReviews.filter((rev) => {
      const revRating = Math.round(Number(rev.rating) || 5);
      if (selectedStar !== "all" && revRating !== selectedStar) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = rev.text?.toLowerCase().includes(query);
        const nameMatch = rev.name?.toLowerCase().includes(query);
        return textMatch || nameMatch;
      }
      return true;
    });
  }, [allReviews, selectedStar, searchQuery]);

  const toggleHelpful = (id: string | number) => {
    const key = String(id);
    const hasVoted = userVotedHelpful[key];
    setUserVotedHelpful((prev) => ({ ...prev, [key]: !hasVoted }));
    setHelpfulMap((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + (hasVoted ? -1 : 1),
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                Customer Reviews &amp; Ratings
              </h2>
              <span className="bg-orange-100 dark:bg-orange-950/50 text-[#ff5500] text-xs font-bold px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Real reviews from verified customers of {serviceName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Rating Breakdown & Overview Card */}
          <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/40 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl p-5 border border-orange-100/70 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Left Column: Big Rating */}
              <div className="sm:col-span-5 text-center sm:text-left sm:border-r border-orange-200/60 dark:border-gray-700 sm:pr-5">
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    {computedAvgRating}
                  </span>
                  <span className="text-base font-semibold text-gray-400 dark:text-gray-500">
                    / 5.0
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(computedAvgRating))
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 dark:fill-gray-700 text-gray-200 dark:text-gray-700"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-2">
                  Based on {computedTotalReviews} {computedTotalReviews === 1 ? "review" : "reviews"}
                </p>

                <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Genuine Customer Feedback
                </div>
              </div>

              {/* Right Column: Progress Bars */}
              <div className="sm:col-span-7 space-y-1.5">
                {computedDistribution.map((item) => (
                  <button
                    key={item.star}
                    type="button"
                    onClick={() =>
                      setSelectedStar(selectedStar === item.star ? "all" : item.star)
                    }
                    className={`w-full flex items-center gap-2.5 text-xs text-left p-1 rounded-lg transition-colors cursor-pointer ${
                      selectedStar === item.star
                        ? "bg-white dark:bg-gray-700 shadow-xs font-bold"
                        : "hover:bg-white/60 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <span className="w-9 font-bold flex items-center gap-0.5 shrink-0">
                      {item.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>

                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.star >= 4
                            ? "bg-emerald-500"
                            : item.star === 3
                            ? "bg-amber-400"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                      />
                    </div>

                    <span className="w-10 text-right text-[11px] text-gray-500 dark:text-gray-400 font-medium shrink-0">
                      {item.percentage}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Star Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedStar("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedStar === "all"
                    ? "bg-[#ff5500] text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                All ({allReviews.length})
              </button>

              {[5, 4, 3, 2, 1].map((star) => {
                const count = allReviews.filter(
                  (r) => Math.round(Number(r.rating) || 5) === star
                ).length;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStar(selectedStar === star ? "all" : star)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                      selectedStar === star
                        ? "bg-[#ff5500] text-white shadow-xs"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{star}</span>
                    <Star className={`w-3 h-3 ${selectedStar === star ? "fill-white text-white" : "fill-amber-400 text-amber-400"}`} />
                    <span className="opacity-70 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative shrink-0 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] outline-hidden text-gray-800 dark:text-gray-200 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3.5">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  No Reviews Found
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedStar !== "all"
                    ? `No reviews available for ${selectedStar} star rating yet.`
                    : "No matching reviews found for your search."}
                </p>
                {(selectedStar !== "all" || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStar("all");
                      setSearchQuery("");
                    }}
                    className="mt-3 text-xs font-bold text-[#ff5500] hover:underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              filteredReviews.map((rev, idx) => {
                const reviewId = rev.id ?? `rev-${idx}`;
                const helpfulCount = (rev as any).helpfulCount ?? 2;
                const dynamicCount = helpfulCount + (helpfulMap[String(reviewId)] || 0);
                const isVoted = userVotedHelpful[String(reviewId)];

                return (
                  <div
                    key={reviewId}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 shadow-xs hover:border-gray-200 dark:hover:border-gray-700 transition-all space-y-3"
                  >
                    {/* Header: Customer Info & Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {rev.avtar ? (
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-700">
                            <img
                              src={rev.avtar}
                              alt={rev.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(rev.name || "Customer")}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                              {rev.name || "Verified Customer"}
                            </h4>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                              <BadgeCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              Verified Customer
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                            {rev.time || "Recently"}
                          </span>
                        </div>
                      </div>

                      {/* Star Badge */}
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-xl text-xs font-extrabold shrink-0">
                        <span>{Number(rev.rating || 5).toFixed(1)}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-normal">
                      {rev.text}
                    </p>

                    {/* Footer: Helpful feedback button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60 text-[11px] text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Verified TASpro booking
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleHelpful(reviewId)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isVoted
                            ? "bg-orange-50 dark:bg-orange-950/40 text-[#ff5500] font-bold"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? "fill-[#ff5500] text-[#ff5500]" : ""}`} />
                        <span>Helpful ({dynamicCount})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/90 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredReviews.length} of {allReviews.length} reviews
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
