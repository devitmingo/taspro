"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL, getImageUrl } from "@/config/api";

interface ServiceIssueItem {
  id: number | string;
  name: string;
  slug?: string;
  icon?: string;
  icon_url?: string;
  image?: string;
  package_tag?: string;
  base_price?: number | string;
  strike_price?: number | string;
  price?: number | string;
  originalPrice?: number | string;
  duration_minutes?: number | string;
  rating?: number | string;
  reviews?: number | string;
  service_id?: number | string;
  service_category_id?: number | string;
  service?: {
    id?: number | string;
    name?: string;
    slug?: string;
  };
  service_sub_category?: {
    name?: string;
  };
}

interface Props {
  title?: string;
  categoryId?: number | string;
  serviceId?: number | string;
}

export default function YouMayLikeServices({
  title = "You may like our other services",
  categoryId,
  serviceId,
}: Props) {
  const [items, setItems] = useState<ServiceIssueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentCategoryServices = async () => {
      try {
        const savedLocation = typeof window !== "undefined" ? localStorage.getItem("selected_location") : null;
        let stateName = "Chhattisgarh";
        let cityName = "Raipur";
        if (savedLocation) {
          try {
            const loc = JSON.parse(savedLocation);
            if (loc.state) stateName = loc.state;
            if (loc.city) cityName = loc.city;
          } catch (e) {}
        }

        // Fetch services table data directly
        const res = await fetch(
          `${API_BASE_URL}/services?state_name=${encodeURIComponent(stateName)}&city_name=${encodeURIComponent(cityName)}`
        );
        const json = await res.json();
        let data: ServiceIssueItem[] = json?.data || json || [];

        if (Array.isArray(data) && data.length > 0) {
          // If categoryId or serviceId is provided, prioritize services matching current category
          let filtered = data;
          if (categoryId) {
            filtered = data.filter(
              (s) => String(s.service_category_id || "") === String(categoryId)
            );
            if (filtered.length === 0) filtered = data;
          }

          setItems(filtered.slice(0, 6));
        } else {
          // Fallback to service-issues table
          const issuesRes = await fetch(`${API_BASE_URL}/service-issues`);
          const issuesJson = await issuesRes.json();
          const issuesData = issuesJson?.data || issuesJson || [];
          setItems(issuesData.slice(0, 6));
        }
      } catch (err) {
        console.error("Error fetching services for Frequently Added Together:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentCategoryServices();
  }, [categoryId, serviceId]);

  if (loading) {
    return (
      <section className="my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-7 w-64 bg-gray-200 rounded-lg animate-pulse mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section className="my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-5">
        <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
          {title}
        </h2>
      </div>

      {/* 6-Column Grid Layout (No Scroll - Fits 6 in single row on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 pt-1">
        {items.map((item, idx) => {
          const imgSrc = getImageUrl(
            item.icon_url || item.icon || item.image,
            "/tas.logo.png"
          );

          const serviceSlug =
            item.service?.slug ||
            "ac-repair-service";

          const currentPrice = Number(item.base_price || item.price || 0);
          const strikePrice = Number(item.strike_price || item.originalPrice || 0);

          return (
            <div
              key={item.id || idx}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:border-orange-200 transition-all flex flex-col overflow-hidden group"
            >
              {/* Media Image */}
              <div className="relative h-28 sm:h-32 w-full bg-white overflow-hidden shrink-0">
                <img
                  src={imgSrc}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/tas.logo.png";
                  }}
                />
                {item.package_tag ? (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-extrabold uppercase bg-orange-100/90 text-orange-700 rounded-full border border-orange-200 backdrop-blur-xs">
                    {item.package_tag}
                  </span>
                ) : null}
              </div>

              {/* Card Body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-extrabold text-xs text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>

                  {/* Sub-Category or Parent Service */}
                  <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                    {item.service_sub_category?.name || item.service?.name || "Service Issue"}
                  </p>

                  {/* Rating, Reviews & Pricing Row */}
                  <div className="flex items-center justify-between gap-1 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0">
                      <div className="flex items-center gap-0.5 font-bold text-gray-800 bg-orange-50 px-1 py-0.5 rounded border border-orange-100">
                        <Star className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                        <span>{item.rating || "5.0"}</span>
                      </div>
                      <span>({item.reviews || 1})</span>
                    </div>

                    {currentPrice > 0 ? (
                      <div className="flex items-center gap-1 text-right shrink-0">
                        <span className="text-xs font-black text-gray-900">
                          ₹{currentPrice}
                        </span>
                        {strikePrice > currentPrice ? (
                          <span className="text-[9px] text-gray-400 line-through font-semibold">
                            ₹{strikePrice}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={`/service/${serviceSlug}?service_id=${item.service_id || item.service?.id || 1}`}>
                  <button className="w-full py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-[11px] rounded-xl shadow-2xs transition-all active:scale-95">
                    Book Now
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
