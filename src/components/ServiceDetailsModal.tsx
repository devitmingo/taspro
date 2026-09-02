"use client";

import {
  X,
  Star,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Sparkles,
  Camera,
  Package,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import WarrantyModal from "@/components/WarrantyModal";
import RateCardModal from "@/components/RateCardModal";
import { useBooking } from "@/context/BookingContext";
import { getImageUrl } from "@/config/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  onAdd: () => void;
}

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  service,
  onAdd,
}: Props) {
  if (!isOpen || !service) return null;

  const { cartItems, removeFromCart } = useBooking();

  const cartItem = cartItems.find(
    (item) => Number(item.id) === Number(service.id)
  );

  const quantity = cartItem?.quantity || 0;
  const [showWarranty, setShowWarranty] = useState(false);
  const [showRateCard, setShowRateCard] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const updateQuantity = (type: "increase" | "decrease") => {
    if (type === "increase") {
      onAdd();
    } else {
      removeFromCart(service.id);
    }
  };

  const cleanHtmlText = (html?: string) => {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";

    if (url.includes("/shorts/")) {
      videoId = url.split("/shorts/")[1]?.split("?")[0]?.split("/")[0];
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0]?.split("?")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0]?.split("/")[0];
    } else if (url.includes("/embed/")) {
      videoId = url.split("/embed/")[1]?.split("?")[0]?.split("/")[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Data Normalization (strictly DB driven)
  const issueMoreDetailsList = Array.isArray(service?.issueMoreDetails)
    ? service.issueMoreDetails
    : service?.issueMoreDetails
    ? [service.issueMoreDetails]
    : service?.issue_more_details
    ? [service.issue_more_details]
    : [];

  const issueMoreDetailsObj = issueMoreDetailsList[0] || {};

  const issueDescriptionsObj =
    service?.issueDescriptions ||
    service?.issue_descriptions ||
    service?.descriptions ||
    {};

  const workflows = Array.isArray(service?.workflows)
    ? service.workflows
    : Array.isArray(service?.workflow)
    ? service.workflow
    : [];

  const faqs = Array.isArray(service?.faqs)
    ? service.faqs
    : Array.isArray(service?.faq_list)
    ? service.faq_list
    : [];

  const galleryImages = Array.isArray(service?.gallery_images)
    ? service.gallery_images
    : Array.isArray(service?.photos)
    ? service.photos
    : [];

  const needFromYou = Array.isArray(service?.need_from_you)
    ? service.need_from_you
    : Array.isArray(service?.requirements)
    ? service.requirements
    : [];

  const coveredBrands = Array.isArray(service?.covered_brands)
    ? service.covered_brands
    : Array.isArray(service?.brands)
    ? service.brands
    : [];

  const reviewsList = Array.isArray(service?.reviews_list)
    ? service.reviews_list
    : Array.isArray(service?.reviewsData)
    ? service.reviewsData
    : Array.isArray(service?.reviews)
    ? service.reviews
    : [];

  const ratingsDistribution = Array.isArray(service?.ratings_distribution)
    ? service.ratings_distribution
    : [];

  const defaultReviewsList = [
    {
      name: "Rahul Sharma",
      rating: 5,
      time: "2 days ago",
      text: "Excellent service! The technician arrived on time and resolved the issue quickly.",
    },
    {
      name: "Priya Patel",
      rating: 5,
      time: "1 week ago",
      text: "Very professional work and clean service experience. Highly recommended!",
    },
    {
      name: "Amit Kumar",
      rating: 4,
      time: "2 weeks ago",
      text: "Good experience overall. Genuine spare parts and transparent pricing.",
    },
  ];

  const defaultRatingsDistribution = [
    { star: 5, percentage: 82 },
    { star: 4, percentage: 12 },
    { star: 3, percentage: 4 },
    { star: 2, percentage: 1 },
    { star: 1, percentage: 1 },
  ];

  const activeReviewsList = reviewsList.length > 0 ? reviewsList : defaultReviewsList;
  const activeRatingsDistribution = ratingsDistribution.length > 0 ? ratingsDistribution : defaultRatingsDistribution;

  const apiVideoUrl =
    issueMoreDetailsObj?.video_url ||
    service?.video_url ||
    service?.videoUrl;

  const title = service.name || service.title || "Service Details";
  const packageTag =
    service.packageTag ||
    service.package_tag ||
    service.tag ||
    "";

  const currentPrice = Number(
    service.discountedPrice ||
      service.price ||
      service.final_price ||
      service.base_price ||
      0
  );

  const originalPrice = Number(
    service.originalPrice ||
      service.strike_price ||
      (currentPrice ? currentPrice + 200 : 0)
  );

  const totalPrice = quantity > 0 ? currentPrice * quantity : currentPrice;
  const totalOriginalPrice =
    quantity > 0 ? originalPrice * quantity : originalPrice;

  const duration =
    service.duration ||
    (service.duration_minutes ? `${service.duration_minutes} min` : null) ||
    service.time ||
    "";

  const ratingVal =
    typeof service.rating === "number"
      ? service.rating.toFixed(1)
      : service.rating || "4.8";

  const reviewCount =
    service.reviews || service.review_count || service.total_reviews || "120+";

  const warrantyDays =
    service.warrantyDays ||
    service.warranty_days ||
    issueMoreDetailsObj?.warranty_days ||
    0;

  const warrantyTitle =
    service.warranty_title ||
    service.warrantyTitle ||
    (warrantyDays ? `${warrantyDays} Days Warranty` : "");

  const warrantyDesc =
    cleanHtmlText(service.warranty_description || service.warrantyDescription) ||
    cleanHtmlText(issueMoreDetailsObj?.warranty_description) ||
    (warrantyDays ? `${warrantyDays} days testing warranty available on all completed work.` : "");

  const getBrandLogo = (brand: any) => {
    if (brand?.icon || brand?.image || brand?.logo) {
      return getImageUrl(brand.icon || brand.image || brand.logo, "/tas.logo.png");
    }
    const name = String(brand?.name || "").toLowerCase();
    if (name.includes("daikin")) return "/daikin.png";
    if (name.includes("sam")) return "/sam.png";
    if (name.includes("whirl")) return "/wht.png";
    if (name.includes("blue")) return "/blue.png";
    if (name.includes("mits")) return "/mits.png";
    return "/tas.logo.png";
  };

  const imageSrc = getImageUrl(
    service.image || service.thumbnail || service.img || service.icon,
    "/tas.logo.png"
  );

  const descriptionHtml =
    issueDescriptionsObj?.description ||
    service?.description ||
    "";

  const shortPoints = cleanHtmlText(
    issueDescriptionsObj?.short_points ||
    service?.short_points ||
    ""
  );

  const inclusionsText =
    cleanHtmlText(service.inclusions || service.inclusion) ||
    cleanHtmlText(issueMoreDetailsObj?.inclusions) ||
    "";

  const exclusionsText =
    cleanHtmlText(service.exclusions || service.exclusion) ||
    cleanHtmlText(issueMoreDetailsObj?.exclusions) ||
    "";

  const importantNotesText =
    cleanHtmlText(service.important_notes || service.importantNotes) ||
    cleanHtmlText(issueMoreDetailsObj?.important_notes) ||
    "";

  const safetyNotesText =
    cleanHtmlText(service.safety_notes || service.safetyNotes) ||
    cleanHtmlText(issueMoreDetailsObj?.safety_notes) ||
    "";

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[90] p-2 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-3xl relative shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg z-30 transition-transform active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div
            className="overflow-y-auto flex-1 p-0 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Header Media (Video or Image) */}
            <div className="relative h-56 sm:h-64 w-full bg-gray-900 flex items-center justify-center overflow-hidden">
              {apiVideoUrl ? (
                <iframe
                  src={getEmbedUrl(apiVideoUrl)}
                  title={title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={imageSrc}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-5">
              {/* Title, Price, Package Tag & Add Button */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight leading-snug">
                      {title}
                    </h2>
                    {packageTag ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                        {packageTag}
                      </span>
                    ) : null}
                  </div>

                  {/* Rating & Duration */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {ratingVal ? (
                      <div className="flex items-center gap-1 font-bold text-gray-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                        <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span>{ratingVal}</span>
                      </div>
                    ) : null}
                    {reviewCount ? <span>({reviewCount} reviews)</span> : null}
                    {duration ? (
                      <>
                        {ratingVal || reviewCount ? <span>•</span> : null}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{duration}</span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <span className="text-2xl font-black text-gray-900">
                      ₹{totalPrice}
                    </span>
                    {originalPrice > currentPrice ? (
                      <span className="text-sm text-gray-400 line-through font-semibold">
                        ₹{totalOriginalPrice}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Add / Quantity Button */}
                <div className="shrink-0 pt-1">
                  {quantity === 0 ? (
                    <button
                      onClick={() => updateQuantity("increase")}
                      className="border-2 border-orange-500 text-orange-600 font-extrabold rounded-full px-7 py-2 text-xs hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center border-2 border-orange-500 px-3.5 py-1.5 rounded-full gap-3 bg-orange-50/70 shadow-sm">
                      <button
                        onClick={() => updateQuantity("decrease")}
                        className="text-orange-600 font-black text-base hover:scale-110 transition-transform"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity("increase")}
                        className="text-orange-600 font-black text-base hover:scale-110 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Standard Rate Card Trigger Banner */}
              <button
                onClick={() => setShowRateCard(true)}
                className="w-full border border-orange-200 bg-orange-50/60 hover:bg-orange-100/60 transition-colors rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 flex justify-between items-center group shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>Standard Rate Card no hidden charges</span>
                </div>
                <span className="text-orange-500 font-black text-lg group-hover:translate-x-1 transition-transform">
                  ›
                </span>
              </button>

              {/* Warranty Card (only if warranty info exists) */}
              {(warrantyTitle || warrantyDesc || warrantyDays > 0) && (
                <div className="rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200 p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      {warrantyTitle ? (
                        <h3 className="text-sm font-black text-gray-900">
                          {warrantyTitle}
                        </h3>
                      ) : null}
                      {warrantyDesc ? (
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {warrantyDesc}
                        </p>
                      ) : null}
                      <button
                        onClick={() => setShowWarranty(true)}
                        className="mt-2.5 text-orange-600 text-xs font-extrabold hover:underline inline-flex items-center gap-1"
                      >
                        Explore Benefits →
                      </button>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <BadgeCheck size={28} />
                    </div>
                  </div>
                </div>
              )}

              {/* HTML Description Section (only if description or short points exist) */}
              {(descriptionHtml || shortPoints) ? (
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Description
                  </h3>

                  {shortPoints ? (
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg mb-2">
                      {shortPoints}
                    </div>
                  ) : null}

                  {descriptionHtml ? (
                    <div
                      className="text-xs text-gray-700 leading-relaxed bg-gray-50/80 p-4 rounded-2xl border border-gray-100 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:text-gray-700"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  ) : null}
                </div>
              ) : null}

              {/* Service Gallery / Photos Section (only if galleryImages available) */}
              {galleryImages.length > 0 ? (
                <div className="pt-2 space-y-3 border-t border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-orange-500" />
                    Photos
                  </h3>
                  <div className="grid grid-cols-3 gap-2.5">
                    {galleryImages.map((imgUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-xs group"
                      >
                        <img
                          src={getImageUrl(imgUrl, "/tas.logo.png")}
                          alt={`Gallery image ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* What We Will Need From You Section (only if needFromYou available) */}
              {needFromYou.length > 0 ? (
                <div className="pt-2 space-y-3 border-t border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-orange-500" />
                    What we will need from you
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {needFromYou.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center space-y-1.5"
                      >
                        {item.image || item.icon ? (
                          <img
                            src={getImageUrl(item.image || item.icon, "/tas.logo.png")}
                            alt={item.title || item.name || "Requirement"}
                            className="w-9 h-9 object-contain"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-orange-500" />
                        )}
                        <span className="text-[11px] font-bold text-gray-800">
                          {item.title || item.name || item.text || "Requirement"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Covered Brands Section (strictly if coveredBrands available in DB) */}
              {coveredBrands.length > 0 ? (
                <div className="pt-2 space-y-3 border-t border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    We covered AC Brand
                  </h3>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {coveredBrands.map((brand: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-center shrink-0 w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 p-2 text-center"
                      >
                        <div className="w-10 h-10 flex items-center justify-center mb-1">
                          <img
                            src={getBrandLogo(brand)}
                            alt={brand.name || "Brand"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 truncate w-full">
                          {brand.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    These trademarks belong to their respective owners. Service provided is independent with certified technicians.
                  </p>
                </div>
              ) : null}

              {/* How it Works / Workflow Timeline (strictly if workflows available in DB) */}
              {workflows.length > 0 ? (
                <div className="pt-2 space-y-3.5 border-t border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    How it Works?
                  </h3>
                  <div className="space-y-3">
                    {workflows.map((item: any, idx: number) => (
                      <div
                        key={item.step || idx}
                        className="flex gap-3.5 items-start bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100"
                      >
                        <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {item.step || idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-xs text-gray-900">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Inclusions & Exclusions */}
              {(inclusionsText || exclusionsText) ? (
                <div className="space-y-3.5 pt-2 border-t border-gray-100">
                  {inclusionsText ? (
                    <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl">
                      <h3 className="font-bold text-xs text-emerald-900 flex items-center gap-2 mb-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Service Inclusion
                      </h3>
                      <p className="text-xs text-emerald-800 leading-relaxed pl-6 whitespace-pre-line">
                        {inclusionsText}
                      </p>
                    </div>
                  ) : null}

                  {exclusionsText ? (
                    <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-2xl">
                      <h3 className="font-bold text-xs text-amber-900 flex items-center gap-2 mb-1.5">
                        <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        Service Exclusion
                      </h3>
                      <p className="text-xs text-amber-800 leading-relaxed pl-6 whitespace-pre-line">
                        {exclusionsText}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Important & Safety Notes */}
              {(importantNotesText || safetyNotesText) ? (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  {importantNotesText ? (
                    <div>
                      <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 mb-1">
                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                        Important Note
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed pl-5">
                        {importantNotesText}
                      </p>
                    </div>
                  ) : null}

                  {safetyNotesText ? (
                    <div>
                      <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                        Safety Notes
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed pl-5">
                        {safetyNotesText}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Frequently Asked Questions (FAQ) Section (strictly if faqs available in DB) */}
              {faqs.length > 0 ? (
                <div className="pt-2 space-y-3 border-t border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Frequently Asked Questions (FAQ)
                  </h3>
                  <div className="space-y-2">
                    {faqs.map((faq: any, index: number) => {
                      const isOpen = openFaqIndex === index;
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-2xl overflow-hidden transition-colors"
                        >
                          <button
                            onClick={() =>
                              setOpenFaqIndex(isOpen ? null : index)
                            }
                            className="w-full px-4 py-3 text-left text-xs font-bold text-gray-800 flex justify-between items-center bg-gray-50/50 hover:bg-gray-100/50"
                          >
                            <span>{faq.question || faq.title}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-orange-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {isOpen && (
                            <div
                              className="px-4 py-3 text-xs text-gray-600 bg-white border-t border-gray-100 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: faq.answer || faq.description || "" }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Reviews & Ratings Section */}
              <div className="pt-2 space-y-4 border-t border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  Reviews ({activeReviewsList.length})
                </h3>

                {/* Rating Breakdown Bar */}
                <div className="flex items-center gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                  <div className="text-center shrink-0">
                    <span className="text-3xl font-black text-gray-900">
                      {ratingVal || "4.8"}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 text-orange-500 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-orange-500 text-orange-500" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 block font-semibold">
                      {activeReviewsList.length} reviews
                    </span>
                  </div>

                  <div className="flex-1 space-y-1 border-l border-gray-200 pl-4">
                    {activeRatingsDistribution.map((dist: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px]">
                        <span className="w-3 text-gray-500 font-bold">{dist.star}★</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${dist.percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-400 font-medium">{dist.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Reviews List */}
                <div className="space-y-3">
                  {activeReviewsList.map((rev: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-gray-900">
                          {rev.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {rev.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-500">
                        {[...Array(Number(rev.rating || 5))].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-orange-500 text-orange-500" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {rev.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Cart Bar */}
            {quantity > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-2xl rounded-b-3xl z-30">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center bg-orange-500 text-white rounded-full text-xs font-black shadow-xs">
                    {quantity}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-gray-900 text-sm">
                        ₹{totalPrice}
                      </span>
                      {originalPrice > currentPrice && (
                        <span className="text-gray-400 line-through text-xs font-semibold">
                          ₹{totalOriginalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-600 text-[11px] font-bold">
                      Item added to cart
                    </p>
                  </div>
                </div>

                <Link href="/cart">
                  <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-95">
                    View Cart →
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <WarrantyModal
        open={showWarranty}
        onClose={() => setShowWarranty(false)}
        service={service}
      />

      <RateCardModal
        isOpen={showRateCard}
        onClose={() => setShowRateCard(false)}
      />
    </>
  );
}
