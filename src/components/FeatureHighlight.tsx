"use client";

const features = [
  {
    title: "Same Day Service",
    icon: "/same-day-service.png",
  },
  {
    title: "Verified Handyman",
    icon: "/verified-serviceman.png",
  },
  {
    title: "Insured Work",
    icon: "/insured-work.png",
  },
  {
    title: "Satisfaction Guaranteed",
    icon: "/satisfaction-guaranteed.png",
  },
];

export default function FeatureHighlight() {
  return (
    <section className="w-full bg-white py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center w-36 sm:w-44 text-center shrink-0 transition-transform hover:scale-105"
            >
              <img
                src={feature.icon}
                alt={feature.title}
                className="h-12 sm:h-16 w-auto object-contain mb-2 drop-shadow-md"
              />
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 text-center">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}