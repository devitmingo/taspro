"use client";

import React from "react";
import { Star, Calendar, Clock, MessageSquare, Phone, ChevronRight, ShieldCheck } from "lucide-react";
import SafeImage from "@/components/SafeImage";

interface BookingCardProps {
  service: string;
  subtitle: string;
  rating?: number;
  reviews?: number;
  date: string;
  time: string;
  status: string;
  serviceImage?: string;
  warrantyText?: string;
  onViewDetails?: () => void;
  onChat?: () => void;
  isCompleted?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  service,
  subtitle,
  rating,
  reviews,
  date,
  time,
  status,
  serviceImage = "/10.svg",
  warrantyText,
  onViewDetails,
  onChat,
  isCompleted = false,
}) => {
  const normStatus = (status || "").toLowerCase();

  const getStatusBadge = () => {
    if (normStatus === "completed") {
      return "bg-green-50 text-green-700 border border-green-200/80";
    }
    if (normStatus === "rejected" || normStatus === "cancelled") {
      return "bg-red-50 text-red-700 border border-red-200/80";
    }
    if (normStatus === "in progress" || normStatus === "assigned" || normStatus === "visit only") {
      return "bg-blue-50 text-blue-700 border border-blue-200/80";
    }
    if (normStatus === "rescheduled") {
      return "bg-purple-50 text-purple-700 border border-purple-200/80";
    }
    return "bg-amber-50 text-amber-800 border border-amber-200/80";
  };

  return (
    <div
      onClick={onViewDetails}
      className="bg-white rounded-2xl border border-gray-200/90 hover:border-orange-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3.5 sm:gap-4 cursor-pointer group w-full min-w-0 overflow-hidden"
    >
      {/* Top Header: Service Image, Title, Status & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Square Image with Curved Corners */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-orange-50/40 border border-orange-100 flex items-center justify-center p-2 shrink-0 aspect-square group-hover:scale-105 transition-transform">
            <SafeImage
              src={serviceImage || "/10.svg"}
              alt={service}
              width={64}
              height={64}
              fallbackSrc="/tas.logo.png"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="min-w-0 space-y-1">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#FF6A00] transition-colors">
              {service}
            </h3>
            <p className="text-xs text-gray-400 line-clamp-1">
              {subtitle || "Professional Home Service"}
            </p>

            {rating !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 pt-0.5">
                <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{rating || 5.0}</span>
                </span>
                {reviews !== undefined && (
                  <span className="text-gray-400 text-[11px]">
                    ({reviews} reviews)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status Pill & Call/Chat Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadge()}`}
          >
            {status || "Pending"}
          </span>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChat?.();
              }}
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-[#FF6A00] border border-gray-200/70 flex items-center justify-center transition-colors cursor-pointer"
              title="Chat regarding booking"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open("tel:7447000045");
              }}
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-green-50 text-gray-500 hover:text-green-600 border border-gray-200/70 flex items-center justify-center transition-colors cursor-pointer"
              title="Call Helpline: 7447-0000-45"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date & Time Row */}
      <div className="pt-3 border-t border-dashed border-gray-100 flex items-center justify-between text-xs text-gray-600 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-gray-500 min-w-0 flex-1 truncate">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-semibold text-gray-800 font-mono text-[11px] sm:text-xs truncate">
            {date || "Scheduled Date"}
          </span>
          {time && (
            <>
              <span className="text-gray-300">•</span>
              <span className="font-medium text-gray-600 text-[11px] sm:text-xs truncate">{time}</span>
            </>
          )}
        </div>

        <span className="text-[11px] font-bold text-[#FF6A00] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Completed Warranty Pill or Rework */}
      {isCompleted && (
        <div className="pt-1 flex items-center justify-between text-xs bg-green-50/60 p-2.5 rounded-xl border border-green-200/60">
          <span className="text-green-800 font-medium flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span>30 Days Free Warranty Active</span>
          </span>
          <span className="text-xs font-bold text-green-700 underline">
            Rework Policy
          </span>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
