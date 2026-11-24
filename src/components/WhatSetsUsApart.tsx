"use client";

const features = [
  {
    id: 1,
    title: "Verified & Trained Technicians",
    desc: "Every service professional undergoes comprehensive background checks and rigorous technical training.",
  },
  {
    id: 2,
    title: "Upfront & Transparent Pricing",
    desc: "Clear standard rate cards with upfront quotes. No hidden charges or unexpected surprises.",
  },
  {
    id: 3,
    title: "Service Warranty Guaranteed",
    desc: "Peace of mind with 30 to 90 days warranty coverage on services and genuine replacement parts.",
  },
  {
    id: 4,
    title: "On-Time Doorstep Service",
    desc: "Punctual arrivals equipped with modern diagnostic tools and genuine spares for same-day resolution.",
  },
  {
    id: 5,
    title: "100% Satisfaction or Free Rework",
    desc: "Complete customer satisfaction guaranteed. Hassle-free revisits and reworks at zero extra cost.",
  },
];

export default function WhatSetsUsApart() {
  return (
    <section className="w-full max-w-[1240px] mx-auto px-4 py-10 md:py-16 flex flex-col lg:flex-row gap-10">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-3 dark:text-white">
          What sets us apart?
        </h2>

        <p className="text-gray-500 mb-6 md:mb-10 max-w-[500px]">
          Dedicated to delivering exceptional home repair and maintenance services with complete trust and transparency.
        </p>

        <div className="space-y-6">
          {features.map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              {/* Number Circle */}
              <div className="min-w-[40px] h-[40px] md:min-w-[55px] md:h-[55px] flex items-center justify-center rounded-full text-white text-lg md:text-2xl font-semibold bg-gradient-to-r from-[#FF512F] to-[#F09819]">
                {item.id}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-base md:text-lg font-medium dark:text-gray-300">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-gray-500">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="w-full lg:w-1/3 h-[220px] md:h-[300px] lg:h-auto overflow-hidden">
        <img
          src="/img/officeview2.png"
          alt="office"
          className="w-full h-full object-cover object-right"
        />
      </div>
    </section>
  );
}
