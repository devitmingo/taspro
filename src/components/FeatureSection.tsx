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
        <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-10 lg:gap-12 mx-auto max-w-4xl sm:px-0">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center justify-center text-center w-auto sm:w-44 shrink-0 transition-transform duration-200 hover:scale-105"
            >
              {/* Feature Icon */}
              <div className="w-10 h-10 sm:w-16 sm:h-16 relative flex-shrink-0 mb-1.5 sm:mb-2">
                <img
                  src={feature.icon}
                  alt={feature.alt}
                  className="w-full h-full object-contain drop-shadow-xs sm:drop-shadow-md"
                  loading="lazy"
                />
              </div>

              {/* Feature Title */}
              <h3 className="text-[10px] sm:text-sm font-semibold text-[#1A1A1A] dark:text-gray-300 leading-tight">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
}
