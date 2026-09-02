"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MoreVertical, Star, ArrowLeft, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

type Props = {
  setActiveView: (view: string) => void;
};

export default function MyReviews({ setActiveView }: Props) {
  const { user } = useAuth();
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
          name: r.service?.name || user?.firstName || "Service Review",
          img: user?.profileImage || "/img/user1.png",
          rating: Number(r.rating) || 5,
          time: r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
          text: r.message || r.review || "No feedback text provided.",
          bookingNo: r.booking?.booking_no,
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

  return (
    <div className="md:px-6 w-full">
      <div className="w-full flex justify-between items-center mb-6">
        {/* Back */}
        <button
          onClick={() => setActiveView("default")}
          className="text-black dark:text-white font-semibold flex items-center gap-2 hover:text-orange-500 transition cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>My Rating and Reviews</span>
        </button>
      </div>
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-xl shadow-sm animate-pulse"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-1/3" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                  <div className="h-3 bg-gray-300 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Grid */}
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 justify-left gap-4">
          {reviews.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No reviews yet 😕
            </div>
          )}
          {reviews.map((item, i) => (
            <div
              key={i}
              className="relative flex gap-3 bg-white dark:bg-gray-200 rounded-xl w-full w-full p-4"
            >
              <div>
                <div className=" flex gap-3 justify-content items-center">
                  <Image
                    src={item.img}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <p className="text-sm font-semibold text-[#1B1B1B]">
                    {item.name}
                  </p>
                </div>
                <div className="flex items-center mt-1">
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const filled = i < item.rating;

                      return (
                        <Star
                          key={i}
                          size={16}
                          className={
                            filled
                              ? "text-[#FFE605] fill-[#FFE605]"
                              : "text-[#FFE605] fill-transparent"
                          }
                        />
                      );
                    })}
                  </div>

                  <span className="text-gray-400 text-[12px] ml-2">
                    {item.time}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {item.text}
                </p>
              </div>

              {/* Top Right Icon */}
              <div className="" ref={menuRef}>
                {/* Icon */}
                <MoreVertical
                  className="w-4 h-4 text-black cursor-pointer absolute top-4 right-1"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                />

                {/* Dropdown */}
                {openIndex === i && (
                  <div className="absolute top-10 right-0 w-36 bg-white shadow-lg rounded-xl border border-gray-200 py-2 z-50">
                    <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>

                    <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back button */}
      {/* <button
        onClick={() => setActiveView("settings")}
        className="hidden md:block md:mt-6 md:text-sm md:text-orange-500"
      >
        ← Back
      </button> */}
    </div>
  );
}
