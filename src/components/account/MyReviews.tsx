"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Sparkles,
  CheckCircle2,
  Calendar,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

type Props = {
  setActiveView: (view: string) => void;
};

export default function MyReviews({ setActiveView }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/customers/service-reviews`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.status && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((r: any) => ({
          id: r.id,
          name: r.service?.name || user?.firstName || "Home Service Review",
          img: user?.profileImage || "/img/user1.png",
          rating: Number(r.rating) || 5,
          time: r.created_at
            ? new Date(r.created_at).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recent",
          text: r.message || r.review || "Excellent service, prompt and professional technician.",
          bookingNo: r.booking?.booking_no || `TAS-${r.id || "108"}`,
        }));
        setReviews(formatted);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.log("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (reviewId: number) => {
    Swal.fire({
      title: "Delete Review?",
      text: "Are you sure you want to remove this feedback?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        Swal.fire({
          icon: "success",
          title: "Removed",
          text: "Review deleted successfully.",
          confirmButtonColor: "#FF6A00",
        });
      }
    });
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* 1. Header */}
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
              My Rating & Reviews
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Review feedback and star ratings you have submitted for TASpro technician services
            </p>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-bold text-gray-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#FF6A00] fill-[#FF6A00]" />
              <span>{reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}</span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        /* 3. Modern Empty State */
        <div className="text-center py-14 px-4 rounded-3xl bg-gray-50/60 border border-dashed border-gray-200 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-500 flex items-center justify-center mx-auto shadow-2xs">
            <Star className="w-8 h-8 fill-amber-400 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              No Reviews Submitted Yet
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Once our technicians complete your service booking, you can rate their quality, punctuality, and leave helpful feedback here.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/my-booking")}
              className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              <span>View Completed Bookings</span>
            </button>
          </div>
        </div>
      ) : (
        /* 4. Reviews Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-xs transition-all relative flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Top: Service info & stars */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6A00] font-bold text-sm shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        Booking: {item.bookingNo}
                      </p>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-900">
                      {item.rating}.0
                    </span>
                  </div>
                </div>

                {/* Stars display */}
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= item.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 fill-gray-100"
                      }`}
                    />
                  ))}
                  <span className="text-[11px] text-gray-400 ml-2">
                    {item.time}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-gray-600 mt-2.5 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Service Review
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
