"use client";

import LayoutContainer from "./LayoutContainer";

const features = [
  {
    id: 1,
    icon: "/same-day-service.png",
    title: "Same Day Service",
    alt: "Same Day Service icon",
  },
  {
    id: 2,
    icon: "/verified-serviceman.png",
    title: "Verified Handyman",
    alt: "Verified handyman icon",
  },
  {
    id: 3,
    icon: "/insured-work.png",
    title: "Insured Work",
    alt: "Insured work icon",
  },
  {
    id: 4,
    icon: "/satisfaction-guaranteed.png",
    title: "Satisfaction Guaranteed",
    alt: "Satisfaction badge icon",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-4">
      <LayoutContainer>
        {/* Centered 4 feature icons with low gaps */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-12 mx-auto max-w-4xl">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center justify-center text-center w-36 sm:w-44 shrink-0 transition-transform duration-200 hover:scale-105"
            >
              {/* Feature Icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex-shrink-0 mb-2">
                <img
                  src={feature.icon}
                  alt={feature.alt}
                  className="w-full h-full object-contain drop-shadow-md"
                  loading="lazy"
                />
              </div>

              {/* Feature Title */}
              <h3 className="text-xs sm:text-sm font-semibold text-[#1A1A1A] dark:text-gray-300 leading-tight">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
}
