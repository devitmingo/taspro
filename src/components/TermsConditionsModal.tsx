"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-7 relative flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-3 -right-3 w-8 h-8 sm:w-9 sm:h-9 bg-[#ff5500] hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md z-10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 border-b border-gray-100 pb-3">
          Terms & conditions
        </h2>

        {/* Scrollable Terms Content */}
        <div
          className="flex-grow overflow-y-auto pr-2 space-y-3.5 text-xs sm:text-sm text-gray-600 leading-relaxed mb-4"
          style={{
            scrollbarWidth: "thin",
          }}
        >
          <p>
            Welcome to TASPRO Company! These Terms of Use govern your access to and use of our mobile application and related services (collectively, the &apos;App&apos;). By accessing or using the App, you agree to be bound by these Terms of Use.
          </p>

          <div>
            <h3 className="font-bold text-gray-900 mb-1">• Acceptance of Terms</h3>
            <p>
              By accessing or using this App, you represent and warrant that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree to these Terms, you must not use the App.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-1">• User Accounts and Security</h3>
            <p>
              To access certain features of the App, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information, including your username and password. You are solely responsible for all activities that occur under your account.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-1">• User Conduct</h3>
            <p className="mb-1.5">
              You agree to use the App in compliance with applicable laws and regulations. You must not engage in any activities that may:
            </p>
            <ul className="space-y-1 pl-4 list-none text-gray-600">
              <li>a) Violate the rights of others;</li>
              <li>b) Be unlawful, fraudulent, or deceptive;</li>
              <li>c) Interfere with or disrupt the App&apos;s functionality or infrastructure;</li>
              <li>d) Introduce viruses or other malicious code;</li>
              <li>e) Collect or store personal data of other users without their consent;</li>
              <li>f) Engage in any other activity that is deemed inappropriate or objectionable.</li>
            </ul>
          </div>
        </div>

        {/* Checkbox */}
        <div className="pt-3 border-t border-gray-100 mb-4">
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
              <span className="text-[#ff5500] font-semibold underline underline-offset-2">
                Terms and Condition
              </span>{" "}
              to proceed further
            </span>
          </label>
        </div>

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
    </div>
  );
};
