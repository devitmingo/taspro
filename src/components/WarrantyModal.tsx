"use client";

import { X, BadgeCheck } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  service: any;
}

const cleanHtml = (html?: string) => {
  if (!html) return "";

  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
};

export default function WarrantyModal({ open, onClose, service }: Props) {
  if (!open) return null;

  const days =
    service?.warrantyDays ||
    service?.warranty_days ||
    service?.issue_more_details?.warranty_days ||
    0;

  const title =
    service?.warrantyTitle ||
    service?.warranty_title ||
    "Service Warranty";

  const rawDescription =
    service?.warrantyDescription ||
    service?.warranty_description ||
    service?.issue_more_details?.warranty_description;

  const cleanText = rawDescription
    ? rawDescription.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
    : "";
  const hasDescription = Boolean(cleanText.length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-5">
      <div className="relative w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 hover:opacity-75 cursor-pointer">
          <X className="w-7 h-7 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mt-2">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-md">
            <BadgeCheck className="text-white" size={52} />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-lg font-bold text-center mt-5 text-gray-900">
          {title}
        </h2>

        {/* Orange text */}
        <p className="text-orange-500 font-semibold text-center mt-1 text-sm">
          {days > 0 ? `${days} Days Warranty` : (title !== "Service Warranty" ? title : "Warranty Available")}
        </p>

        {/* Box (Only if description is added in admin) */}
        {hasDescription && (
          <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-5 text-left">
            <h3 className="font-bold text-sm mb-2 text-gray-900">What&apos;s Covered?</h3>
            <div
              className="text-xs text-gray-700 leading-5 whitespace-pre-line prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-1 [&_li]:mb-0.5"
              dangerouslySetInnerHTML={{ __html: rawDescription }}
            />
          </div>
        )}

        {/* Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold hover:opacity-95 transition-opacity cursor-pointer shadow-md"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
