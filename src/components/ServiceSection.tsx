"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import ApplianceModal from "./ApplianceModal";
import { useState, useEffect } from "react";
import LayoutContainer from "./LayoutContainer";
import { ChevronLeft, ChevronRight } from "lucide-react";

import axios from "axios";

import { API_BASE_URL, getImageUrl } from "@/config/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const fallbackSliders = [
  {
    id: 1,
    title: "Home Cleaning Offer",
    description: "Get up to 30% discount on premium home cleaning services.",
    image: `${IMAGE_BASE_URL}/storage/sliders/user-slider-1.jpg`,
  },
  {
    id: 2,
    title: "Appliance Repair Services",
    description: "Professional repair services for all home appliances at your doorstep.",
    image: `${IMAGE_BASE_URL}/storage/sliders/user-slider-2.jpg`,
  },
  {
    id: 3,
    title: "Expert Handyman Services",
    description: "Trusted electricians, plumbers, and carpenters available 24/7.",
    image: `${IMAGE_BASE_URL}/storage/sliders/user-slider-3.jpg`,
  },
];

const getCategoryImageUrl = (service: any) => {
  const rawImage = service.icon_url || service.icon || service.image || service.icon_image;
  if (rawImage && rawImage !== "null" && rawImage !== "") {
    return getImageUrl(rawImage, "/tas.logo.png");
  }

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

  const finalServices = categoriesList;

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

            <div
              className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-x-3 gap-y-5 xl:pb-0 sm:pb-10 ${
                finalServices.length > 6
                  ? "max-h-[320px] overflow-y-auto pr-2"
                  : ""
              }`}
            >
              {finalServices.map((service, index) => {
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

                    <p className="mt-2 text-[12px] sm:text-sm font-medium text-gray-800 dark:text-gray-300 text-center leading-tight">
                      {service.name || service.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Hero Image Slider Banner */}
          <div className="w-full sm:block hidden lg:w-[60%] relative h-[300px] lg:h-[450px] rounded-3xl overflow-hidden shadow-xl group lg:ml-8 bg-gray-900">
            {sliderList.map((slide: any, index: number) => (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <SafeImage
                  src={slide.image || slide.image_url || "/heroimage.jpg"}
                  alt={slide.title || "Home Services"}
                  fill
                  fallbackSrc="/heroimage.jpg"
                  className="object-cover w-full h-full rounded-3xl"
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
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeSlide
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
      </LayoutContainer>
    </section>
  );
}
