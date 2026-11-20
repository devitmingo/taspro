"use client";

import React from "react";
import {
  Globe,
  Calendar,
  CreditCard,
  UserCheck,
  ThumbsUp,
  Headset,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

interface ServiceHowToBookProps {
  serviceName?: string;
  cityName?: string;
}

export default function ServiceHowToBook({
  serviceName = "AC Service & Repair",
  cityName = "Raipur",
}: ServiceHowToBookProps) {
  const steps = [
    {
      num: "01",
      icon: <Globe className="w-6 h-6 text-orange-500" />,
      title: "Step 1: Visit App or Website",
      desc: `To book AC service, simply open the TASpro Company app or visit our website. Choose the '${serviceName}' section to explore a range of services tailored just for you.`,
    },
    {
      num: "02",
      icon: <Calendar className="w-6 h-6 text-orange-500" />,
      title: "Step 2: Select Service & Time Slot",
      desc: `Search for your required service, eg. "${serviceName} near me", etc. Browse our extensive list of services and pick the service that suits your needs and select a convenient time slot.`,
    },
    {
      num: "03",
      icon: <CreditCard className="w-6 h-6 text-orange-500" />,
      title: "Step 3: Secure Payment & Flexible Options",
      desc: "Once you've finalized your booking, make a hassle-free and secure online payment. You can reschedule or cancel the booking as per your needs. Enjoy peace of mind with our secure transaction process.",
    },
    {
      num: "04",
      icon: <UserCheck className="w-6 h-6 text-orange-500" />,
      title: "Step 4: Automatic Professional Assignment",
      desc: "Our advanced algorithms ensure that you get the best-suited professional for your chosen service based on availability, experience, and ratings.",
    },
  ];

  const postServiceOptions = [
    {
      icon: <ThumbsUp className="w-5 h-5 text-[#FF6A00]" />,
      title: "Rebook with Confidence",
      desc: "Love the service and want to rebook the same professional? It's just a click away for our repeat customers.",
    },
    {
      icon: <Headset className="w-5 h-5 text-[#FF6A00]" />,
      title: "Help When You Need",
      desc: 'In case you have any questions or concerns after the service, our "Help Center" is ready to assist you.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-[#FF6A00]" />,
      title: "Chat with Your Professional",
      desc: "After your professional is assigned, you can communicate with them through the app. Have specific requests or questions? Feel free to chat!",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#FF6A00]" />,
      title: "Experience Hassle-Free Service",
      desc: "Now that you know the ins and outs of booking AC repair and AC service, get ready to experience the expertise and convenience that we offer.",
    },
  ];

  return (
    <section className="my-8 sm:my-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
          How to book <span className="text-[#FF6A00]">#1 {serviceName}</span> in {cityName}, India?
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Here are the steps to book the perfect ac service, ac repair, gas filling, ac installation and ac uninstallation in {cityName}, India
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-150 hover:border-orange-300 shadow-2xs hover:shadow-md transition-all duration-200 relative overflow-hidden group"
          >
            {/* Step Number Top-Right */}
            <span className="absolute top-4 right-5 text-2xl sm:text-3xl font-black text-orange-500/20 group-hover:text-orange-500/30 transition-colors">
              {step.num}
            </span>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                {step.icon}
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post-Service Divider */}
      <div className="relative flex items-center justify-center my-8">
        <div className="border-t border-gray-200 w-full" />
        <span className="bg-white px-4 text-xs font-black uppercase tracking-wider text-gray-900 shrink-0">
          Post-service options
        </span>
        <div className="border-t border-gray-200 w-full" />
      </div>

      {/* Post-Service 4 Column Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {postServiceOptions.map((opt, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex flex-col items-start hover:border-orange-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 shrink-0">
              {opt.icon}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 leading-tight">
              {opt.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
              {opt.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
