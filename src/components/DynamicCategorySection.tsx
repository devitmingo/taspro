"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceCard from "./ServiceCard";
import PackageCard from "./PackageCard";
import SafeImage from "./SafeImage";
import LayoutContainer from "./LayoutContainer";
import { getImageUrl } from "@/config/api";

interface DynamicCategorySectionProps {
  title: string;
  viewType?: number | string;
  data?: any[];
}

const getItemImage = (item: any): string => {
  if (!item) return "/tas.logo.png";
  if (typeof item === "string") return getImageUrl(item, "/tas.logo.png");

  const rawImage =
    item.icon ||
    item.image ||
    item.home_icon_image_url ||
    item.home_icon_image ||
    item.icon_url;

  if (rawImage && rawImage !== "null" && rawImage !== "") {
    return getImageUrl(rawImage, "/tas.logo.png");
  }
  return "/tas.logo.png";
};

export default function DynamicCategorySection({
  title,
  viewType = 1,
  data = [],
}: DynamicCategorySectionProps) {
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);
  const type = Number(viewType) || 1;

  const list = Array.isArray(data) ? data : (data as any)?.data || [];

  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const checkScrollState = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const { scrollLeft, scrollWidth, clientWidth } = slider;
    setCanScroll(list.length > 1 && scrollWidth > clientWidth + 5);
    setAtStart(scrollLeft <= 5);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 5);
  };

  useEffect(() => {
    checkScrollState();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScrollState);
    }
    window.addEventListener("resize", checkScrollState);
    return () => {
      if (slider) {
        slider.removeEventListener("scroll", checkScrollState);
      }
      window.removeEventListener("resize", checkScrollState);
    };
  }, [list.length]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (!list || list.length === 0) return null;

  return (
    <section className="pt-6 pb-2 bg-white dark:bg-gray-900">
      <LayoutContainer>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-200">
            {title}
          </h2>

          {/* Navigation Controls */}
          {canScroll && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={scrollLeft}
                disabled={atStart}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shadow-2xs ${
                  atStart
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-orange-500 text-orange-600 hover:bg-orange-50 cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                disabled={atEnd}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shadow-2xs ${
                  atEnd
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-orange-500 text-orange-600 hover:bg-orange-50 cursor-pointer"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* View Type 1: Icon Grid Layout */}
        {type === 1 && (
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth py-2"
          >
            {list.map((item: any, index: number) => {
              const serviceId = item.id || item.service_id;
              const slug =
                item.slug ||
                (item.title || item.name || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
              return (
                <div
                  key={index}
                  onClick={() =>
                    router.push(
                      `/service/${slug}${
                        serviceId ? `?service_id=${serviceId}` : ""
                      }`
                    )
                  }
                  className="group flex flex-col items-center text-center cursor-pointer shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] min-w-[150px]"
                >
                  <div className="w-full bg-[#EDEDED] group-hover:bg-[#E5E5E7] transition-all duration-200 rounded-2xl p-3 sm:p-4 flex items-center justify-center h-28 sm:h-32 lg:h-36 shadow-sm border border-gray-100/50">
                    <SafeImage
                      src={getItemImage(item)}
                      alt={item.name || item.title}
                      width={160}
                      height={160}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-200 group-hover:text-orange-600 transition-colors truncate max-w-full">
                    {item.name || item.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* View Type 4: Circle Icon UI Layout */}
        {type === 4 && (
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar scroll-smooth py-2"
          >
            {list.map((item: any, index: number) => {
              const serviceId = item.id || item.service_id;
              const slug =
                item.slug ||
                (item.title || item.name || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
              return (
                <div
                  key={index}
                  onClick={() =>
                    router.push(
                      `/service/${slug}${
                        serviceId ? `?service_id=${serviceId}` : ""
                      }`
                    )
                  }
                  className="group flex flex-col items-center text-center cursor-pointer shrink-0 min-w-[110px] sm:min-w-[130px]"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 group-hover:from-orange-100 group-hover:to-orange-200 transition-all duration-300 p-2 flex items-center justify-center shadow-sm border-2 border-orange-200 group-hover:border-orange-500 group-hover:scale-105">
                    <SafeImage
                      src={getItemImage(item)}
                      alt={item.name || item.title}
                      width={100}
                      height={100}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="mt-2.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-200 group-hover:text-orange-600 transition-colors truncate max-w-[120px]">
                    {item.name || item.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* View Type 2: Detailed Service Cards Layout */}
        {type === 2 && (
          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto hide-scrollbar scroll-smooth py-2 snap-x"
          >
            {list.map((item: any, index: number) => {
              const serviceId = item.id || item.service_id;
              const slug =
                item.slug ||
                (item.title || item.name || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
              return (
                <div key={index} className="flex-shrink-0 snap-center">
                  <ServiceCard
                    title={item.title || item.name}
                    image={getItemImage(item)}
                    rating={Number(item.rating) || 4.8}
                    reviewCount={item.reviews || 120}
                    price={item.price || item.visiting_charge || 199}
                    originalPrice={item.originalPrice || item.oldPrice || 299}
                    duration={`${item.duration || 30} min`}
                    onAdd={() =>
                      router.push(
                        `/service/${slug}${
                          serviceId ? `?service_id=${serviceId}` : ""
                        }`
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* View Type 3: Banner / Package Card Layout */}
        {type === 3 && (
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth py-2 snap-x"
          >
            {list.map((item: any, index: number) => {
              const serviceId = item.id || item.service_id;
              const slug =
                item.slug ||
                (item.title || item.name || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");
              return (
                <div
                  key={index}
                  className="flex-shrink-0 snap-center"
                  style={{ width: "382px", height: "228px" }}
                >
                  <PackageCard
                    title={item.title || item.name}
                    subtitle={item.subtitle || "Best Value"}
                    image={getItemImage(item)}
                    onBook={() =>
                      router.push(
                        `/service/${slug}${
                          serviceId ? `?service_id=${serviceId}` : ""
                        }`
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </LayoutContainer>
    </section>
  );
}
