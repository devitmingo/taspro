"use client";

import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
// import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { useRef, useEffect, useState } from "react";
import LayoutContainer from "./LayoutContainer";
import { useRouter } from "next/navigation";

const defaultPlans = [
  {
    id: 3,
    title: "Fridge Repair",
    subtitle: "Complete cooling & gas refill protection",
    slug: "refrigerator-repair",
    image: "/tas.logo.png",
  },
  {
    id: 1,
    title: "AC Servicing",
    subtitle: "Complete AC maintenance plan",
    slug: "ac-repair-service",
    image: "/tas.logo.png",
  },
  {
    id: 11,
    title: "Electrician Service",
    subtitle: "Annual electrical safety & wiring repair",
    slug: "electrician-service",
    image: "/tas.logo.png",
  },
  {
    id: 12,
    title: "Plumber Service",
    subtitle: "Comprehensive pipe & fixture maintenance",
    slug: "plumber-service",
    image: "/tas.logo.png",
  },
  {
    id: 2,
    title: "Washing Machine Care",
    subtitle: "Motor, drum & leak protection plan",
    slug: "washing-machine-repair",
    image: "/tas.logo.png",
  },
  {
    id: 7,
    title: "Deep Cleaning Package",
    subtitle: "Seasonal home deep cleaning service",
    slug: "full-home-deep-cleaning",
    image: "/tas.logo.png",
  },
];

const AMCServicePlan = ({ data }: { data?: any[] }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const finalPlans = data;
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const checkScrollState = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const { scrollLeft, scrollWidth, clientWidth } = slider;

    setCanScroll(scrollWidth > clientWidth);
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
  }, []);
  const checkScrollable = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    setCanScroll(slider.scrollWidth > slider.clientWidth);
  };

  useEffect(() => {
    checkScrollable();

    window.addEventListener("resize", checkScrollable);

    return () => {
      window.removeEventListener("resize", checkScrollable);
    };
  }, []);

  const slidesToShow = {
    desktop: 3,
    tablet: 2,
    mobile: 1,
  };

  const slideWidth = {
    desktop: 100 / slidesToShow.desktop,
    tablet: 100 / slidesToShow.tablet,
    mobile: 100,
  };

  const getSlidesToShow = () => {
    if (typeof window === "undefined") return slidesToShow.desktop;
    if (window.innerWidth >= 1024) return slidesToShow.desktop;
    if (window.innerWidth >= 768) return slidesToShow.tablet;
    return slidesToShow.mobile;
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      if (scrollLeft <= 10) {
        sliderRef.current.scrollTo({ left: scrollWidth - clientWidth, behavior: "smooth" });
      } else {
        sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
      }
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
      }
    }
  };

  const startAutoScroll = () => {
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    slideIntervalRef.current = setInterval(() => {
      if (!isPaused) {
        scrollRight();
      }
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [isPaused]);

  const handleBookNow = (plan: any) => {
    let slug = plan.slug;
    let serviceId = plan.service_id || plan.id;

    if (!slug) {
      const title = (plan.title || "").toLowerCase();
      if (title.includes("fridge") || title.includes("refrigerator")) {
        slug = "refrigerator-repair";
        serviceId = 3;
      } else if (title.includes("ac")) {
        slug = "ac-repair-service";
        serviceId = 1;
      } else if (title.includes("electrician")) {
        slug = "electrician-service";
        serviceId = 11;
      } else {
        slug = "ac-repair-service";
        serviceId = 1;
      }
    }

    router.push(`/service/${slug}?service_id=${serviceId}&source=amc`);
  };

  return (
    <section className="w-full bg-white dark:bg-gray-900 py-5">
      <LayoutContainer className="relative">
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-2">
          AMC Service Plan
        </h2>

        {/* Navigation Arrows */}
        {canScroll && (
          <button
            onClick={scrollLeft}
            className="absolute left-[-1px] top-1/2 -translate-y-1/2 bg-white rounded-full w-10 h-10 hidden md:flex items-center justify-center border border-orange-600 text-orange-700 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {canScroll && (
          <button
            onClick={scrollRight}
            className="absolute right-[-1px] top-1/2 -translate-y-1/2 bg-white rounded-full w-10 h-10 hidden md:flex items-center justify-center border border-orange-600 text-orange-700 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div
          ref={sliderRef}
          className="flex overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [scrollbar-width:none] snap-x items-center"
          style={{ gap: "16px" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {[...finalPlans, ...finalPlans].map((plan, index) => (
            <div
              key={index}
              className="w-[85%] sm:w-[48%] md:w-[31.5%] lg:w-[23.5%] xl:w-[19%] flex-shrink-0 snap-center cursor-pointer"
              onClick={() => handleBookNow(plan)}
            >
              <div className="relative w-full aspect-[16/10] h-[155px] sm:h-[165px] rounded-[12px] overflow-hidden group">
                {/* Background Image */}
                <SafeImage
                  src={plan.image}
                  alt={plan.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-3.5 sm:p-4 flex flex-col justify-end items-start">
                  <h3 className="text-sm sm:text-base font-bold text-white mb-0.5 leading-tight">
                    {plan.title}
                  </h3>
                  {plan.subtitle && (
                    <p className="text-gray-200 text-[10px] sm:text-xs mb-2 font-medium line-clamp-1">
                      {plan.subtitle}
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(plan);
                    }}
                    className="mt-0.5 px-3 py-1.5 border border-orange-500 text-orange-500 rounded-[6px] text-[11px] sm:text-xs font-medium bg-transparent hover:bg-orange-500 hover:text-white transition-all duration-300 flex items-center gap-1"
                  >
                    Book Now <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        {/* <div className="flex justify-center gap-2 mt-8">
          {amcPlans.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const slidesToShowCount = getSlidesToShow();
                setCurrentSlide(index);
                sliderRef.current?.scrollTo({
                  left:
                    (index * sliderRef.current.offsetWidth) / slidesToShowCount,
                  behavior: "smooth",
                });
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-orange-500 w-6" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div> */}
      </LayoutContainer>
    </section>
  );
};

export default AMCServicePlan;
