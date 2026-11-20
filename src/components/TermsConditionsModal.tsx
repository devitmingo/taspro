"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  terms?: any[];
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  terms = [],
}) => {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-xl p-5 sm:p-7 relative flex flex-col max-h-[88vh] sm:max-h-[82vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 w-8 h-8 sm:w-9 sm:h-9 bg-[#ff5500] hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg z-30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="shrink-0 mb-3 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Terms & conditions
          </h2>
        </div>

        {/* Scrollable Terms Content */}
        <div
          className="flex-1 min-h-0 overflow-y-auto pr-2 sm:pr-3 space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed tc-scrollable"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#ff5500 #f1f5f9",
          }}
        >
          {/* Dynamic Service Terms & Conditions (if available from Service Master) */}
          {Array.isArray(terms) && terms.length > 0 && (
            <div className="space-y-3.5 mb-2">
              {terms.map((cat: any, cIdx: number) => {
                const heading =
                  cat.term_heading_name || cat.name || cat.heading || "Service Terms & Conditions";
                const descriptions = cat.booking_t_c_descs || cat.descs || cat.points || [];

                return (
                  <div
                    key={cat.id || cIdx}
                    className="bg-orange-50/70 rounded-xl p-3.5 border border-orange-100"
                  >
                    <h3 className="font-bold text-gray-900 text-sm mb-2 text-[#ff5500]">
                      • {heading}
                    </h3>
                    {Array.isArray(descriptions) && descriptions.length > 0 ? (
                      <ul className="space-y-1.5 pl-4 list-disc text-gray-700 text-xs sm:text-sm">
                        {descriptions.map((desc: any, dIdx: number) => {
                          const text =
                            typeof desc === "string" ? desc : desc.description || desc.point || "";
                          return (
                            <li key={desc.id || dIdx} className="leading-relaxed">
                              {text}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* General Company Terms */}
          <p>
            Welcome to TASPRO Company! These Terms of Use govern your access to and use of our mobile application, website, and related home services (collectively, the &apos;App&apos;). By accessing or booking through the App, you agree to be bound by these Terms of Use.
          </p>

          <div>
            <h3 className="font-bold text-gray-900 mb-1">• Acceptance of Terms</h3>
            <p>
              By accessing, browsing, or booking services via this App, you represent and warrant that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree to these Terms, you must not use the App or proceed with booking.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-1">• User Accounts and Security</h3>
            <p>
              To access certain features of the App, you may be required to create an account or verify via OTP. You are responsible for maintaining the confidentiality of your account information, including your mobile number and saved addresses. You are solely responsible for all activities that occur under your account.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-1">• Service Delivery & Site Access</h3>
            <p>
              Customers must ensure safe and adequate access to the premises, uninterrupted electricity, and water supply as required to execute the requested service. Any pre-existing structural or equipment damage should be reported to the service professional prior to starting work.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-1">• Cancellation & Rescheduling</h3>
            <p>
              Bookings can be rescheduled or cancelled through the App. However, cancellations made within 1 hour of the scheduled time slot or after the service professional has been dispatched may be subject to a visiting charge of ₹150.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-1">• User Conduct</h3>
            <p className="mb-1.5">
              You agree to use the App in compliance with applicable laws and regulations. You must not engage in any activities that may:
            </p>
            <ul className="space-y-1 pl-4 list-none text-gray-600">
              <li>a) Violate the rights of service professionals or others;</li>
              <li>b) Be unlawful, fraudulent, or deceptive;</li>
              <li>c) Interfere with or disrupt the App&apos;s functionality or infrastructure;</li>
              <li>d) Introduce viruses or other malicious code;</li>
              <li>e) Collect or store personal data of other users without their consent;</li>
              <li>f) Engage in any other activity that is deemed inappropriate or objectionable.</li>
            </ul>
          </div>
        </div>

        {/* Checkbox */}
        <div className="shrink-0 pt-3.5 border-t border-gray-100 mt-3 space-y-3 bg-white">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="tc-agree-checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 rounded accent-[#ff5500] cursor-pointer mt-0.5 shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-800 leading-snug">
              I accept Company{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#ff5500] hover:text-orange-600 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              >
                Terms and Condition
              </Link>{" "}
              to proceed further
            </span>
          </label>

          {/* Continue Button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={!accepted || loading}
            className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              accepted && !loading
                ? "bg-[#ff5500] hover:bg-[#e64d00] active:scale-[0.99]"
                : "bg-gray-300 cursor-not-allowed opacity-70"
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </div>

        {/* Scrollbar styling */}
        <style jsx>{`
          .tc-scrollable::-webkit-scrollbar {
            width: 6px;
          }
          .tc-scrollable::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 9999px;
          }
          .tc-scrollable::-webkit-scrollbar-thumb {
            background: #ff5500;
            border-radius: 9999px;
          }
          .tc-scrollable::-webkit-scrollbar-thumb:hover {
            background: #e64d00;
          }
        `}</style>
      </div>
    </div>
  );
};
