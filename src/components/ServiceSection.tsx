"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import ApplianceModal from "./ApplianceModal";
import { useState, useEffect } from "react";
import LayoutContainer from "./LayoutContainer";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import axios from "axios";

import { API_BASE_URL, getImageUrl } from "@/config/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const fallbackSliders = [
  {
    id: 1,
    title: "Home Cleaning Offer",
    description: "Get up to 30% discount on premium home cleaning services.",
    image: "/storage/sliders/user-slider-1.jpg",
  },
  {
    id: 2,
    title: "Appliance Repair Services",
    description: "Professional repair services for all home appliances at your doorstep.",
    image: "/storage/sliders/user-slider-2.jpg",
  },
  {
    id: 3,
    title: "Expert Handyman Services",
    description: "Trusted electricians, plumbers, and carpenters available 24/7.",
    image: "/storage/sliders/user-slider-3.jpg",
  },
];

const getCategoryImageUrl = (service: any) => {
  const rawImage = service.icon_url || service.icon || service.image || service.icon_image;
  if (rawImage && rawImage !== "null" && rawImage !== "") {
    if (!rawImage.includes("/") && (rawImage.endsWith(".png") || rawImage.endsWith(".jpg") || rawImage.endsWith(".webp"))) {
      return getImageUrl(`/storage/service-categories/${rawImage}`, "/tas.logo.png");
    }
    return getImageUrl(rawImage, "/tas.logo.png");
  }

  const name = (service.name || service.title || "").toLowerCase();
  if (name.includes("appliance")) return getImageUrl("/storage/service-categories/1792148921_4095.webp");
  if (name.includes("deep") || name.includes("house")) return getImageUrl("/storage/service-categories/1792149010_4155.webp");
  if (name.includes("handyman") || name.includes("repair")) return getImageUrl("/storage/service-categories/1792149153_2243.webp");
  if (name.includes("package")) return getImageUrl("/storage/service-categories/1792149143_7008.webp");

  return "/tas.logo.png";
};

export default function ServiceSection({
  data = [],
  applianceData = [],
  sliders = [],
}: {
  data?: any[];
  applianceData?: any[];
  sliders?: any[];
}) {
  const router = useRouter();
  const [showApplianceModal, setShowApplianceModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [categoriesList, setCategoriesList] = useState<any[]>(data);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setCategoriesList(data);
    } else {
      axios
        .get(`${API_BASE_URL}/service-categories`)
        .then((res) => {
          if (res.data?.status && Array.isArray(res.data?.data) && res.data.data.length > 0) {
            setCategoriesList(res.data.data);
          }
        })
        .catch((err) => console.log("Failed to fetch service-categories:", err));
    }
  }, [data]);

  const sliderList = sliders.length > 0 ? sliders : fallbackSliders;

  useEffect(() => {
    if (sliderList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderList.length]);

  const handleCategoryClick = (service: any) => {
    setSelectedCategory(service);
    setShowApplianceModal(true);
  };

  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const hasMore = categoriesList.length > 6;
  const displayedCategories = hasMore ? categoriesList.slice(0, 5) : categoriesList.slice(0, 6);

  return (
    <section className="w-full sm:pb-10 sm:px-5">
      <LayoutContainer className="relative">
        <div className="flex flex-col lg:flex-row justify-between items-start">
          {/* Left Side - Service Cards */}
          <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col">
            <h2 className="text-lg lg:text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-5 leading-[1.2] text-left max-w-[580px]">
              How can we serve you
              <br />
              today?
            </h2>

            {/* Grid of Categories (max 6 items including >> button if hasMore) */}
            <div className="grid grid-cols-3 gap-x-3 gap-y-4 xl:pb-0 sm:pb-10">
              {displayedCategories.map((service, index) => {
                const imageUrl = getCategoryImageUrl(service);

                return (
                  <div
                    key={service.id || index}
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => handleCategoryClick(service)}
                  >
                    <div className="w-full h-20 sm:h-28 bg-gray-50 rounded-2xl flex items-center justify-center p-3 sm:p-4 shadow-sm group-hover:scale-105 transition-all duration-300 overflow-hidden border border-gray-100 relative">
                      <SafeImage
                        src={imageUrl}
                        alt={service.name || service.title || "Category"}
                        width={64}
                        height={64}
                        fallbackSrc="/tas.logo.png"
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                        style={{ objectFit: "contain" }}
                      />
                    </div>

                    <p className="mt-2 text-[12px] sm:text-sm font-medium text-gray-800 dark:text-gray-300 text-center leading-tight line-clamp-2">
                      {service.name || service.title}
                    </p>
                  </div>
                );
              })}

              {/* 6th Slot: >> (All Categories Button) only if more categories exist than 6 */}
              {hasMore && (
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => setShowAllCategoriesModal(true)}
                >
                  <div className="w-full h-20 sm:h-28 bg-gray-50 rounded-2xl flex items-center justify-center p-3 sm:p-4 shadow-sm group-hover:scale-105 transition-all duration-300 overflow-hidden border border-gray-100 relative">
                    <span className="text-xl sm:text-2xl font-black text-primary select-none group-hover:scale-110 transition-transform duration-300">
                      &gt;&gt;
                    </span>
                  </div>

                  <p className="mt-2 text-[12px] sm:text-sm font-bold text-primary dark:text-orange-400 text-center leading-tight">
                    All Categories
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Hero Image Slider Banner */}
          <div className="w-full sm:block hidden lg:w-[60%] relative h-[300px] lg:h-[450px] rounded-3xl overflow-hidden shadow-xl group lg:ml-8 bg-gray-900">
            {sliderList.map((slide: any, index: number) => (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
              >
                <SafeImage
                  src={slide.image || slide.image_url || "/heroimage.jpg"}
                  alt={slide.title || "Home Services"}
                  fill
                  fallbackSrc="/heroimage.jpg"
                  className="object-fill w-full h-full rounded-3xl"
                  style={{
                    objectFit:
                      (slide.image || slide.image_url) &&
                      !String(slide.image || slide.image_url).endsWith("/tas.logo.png")
                        ? "fill"
                        : "contain",
                  }}
                  priority={index === 0}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-3xl" />
                {slide.title && (
                  <div className="absolute bottom-8 left-8 right-8 text-white z-20">
                    <h3 className="text-xl sm:text-2xl font-bold drop-shadow-md">
                      {slide.title}
                    </h3>
                    {slide.description && (
                      <p className="text-xs sm:text-sm text-gray-200 mt-1 drop-shadow-sm max-w-lg">
                        {slide.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Slide Dots */}
            {sliderList.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {sliderList.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeSlide
                        ? "w-7 bg-orange-500"
                        : "w-2.5 bg-white/70 hover:bg-white"
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Left / Right Arrow Buttons */}
            {sliderList.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveSlide(
                      (prev) => (prev - 1 + sliderList.length) % sliderList.length
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-sm"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setActiveSlide((prev) => (prev + 1) % sliderList.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-sm"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
        <ApplianceModal
          isOpen={showApplianceModal}
          onClose={() => setShowApplianceModal(false)}
          category={selectedCategory}
          data={applianceData}
        />

        {/* All Categories Modal */}
        {showAllCategoriesModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-opacity duration-300"
            onClick={() => setShowAllCategoriesModal(false)}
          >
            <div
              className="bg-white rounded-t-[32px] sm:rounded-[28px] w-full sm:w-[680px] max-w-2xl p-6 sm:p-7 relative shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    All Categories
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select any category to view available services
                  </p>
                </div>
                <button
                  onClick={() => setShowAllCategoriesModal(false)}
                  aria-label="Close"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-95"
                >
                  ✕
                </button>
              </div>

              {/* Search if > 6 categories */}
              {categoriesList.length > 6 && (
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search category by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-gray-800 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Grid of Categories */}
              <div className="overflow-y-auto pr-1 flex-1 max-h-[60vh] hide-scrollbar">
                {(() => {
                  const filtered = searchQuery.trim()
                    ? categoriesList.filter((cat) =>
                        (cat.name || cat.title || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                    : categoriesList;

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-gray-500">
                        <p className="text-sm font-medium">No categories found matching &quot;{searchQuery}&quot;</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 py-1">
                      {filtered.map((cat, idx) => {
                        const catImage = getCategoryImageUrl(cat);
                        return (
                          <div
                            key={cat.id || idx}
                            onClick={() => {
                              setShowAllCategoriesModal(false);
                              handleCategoryClick(cat);
                            }}
                            className="group flex flex-col items-center text-center cursor-pointer p-2 rounded-2xl hover:bg-orange-50/60 transition-all duration-200"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 group-hover:bg-white p-3 flex items-center justify-center transition-all duration-200 shadow-xs border border-gray-100 group-hover:border-orange-200 group-hover:shadow-md group-hover:scale-105">
                              <SafeImage
                                src={catImage}
                                alt={cat.name || cat.title || "Category"}
                                width={64}
                                height={64}
                                fallbackSrc="/tas.logo.png"
                                className="w-10 h-10 sm:w-14 sm:h-14 object-contain transition-transform"
                              />
                            </div>
                            <span className="text-[11px] sm:text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors mt-2 text-center leading-tight line-clamp-2 max-w-[110px]">
                              {cat.name || cat.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </LayoutContainer>
    </section>
  );
}
