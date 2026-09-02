"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle, Mail, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
  referralLink?: string;
};

const ShareModal = ({
  isOpen,
  onClose,
  referralCode = "TASPRO",
  referralLink = "https://app.tasprocompany.in",
}: Props) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareText = `Hey! Check out TASPRO for trusted home services (AC repair, Electrician, Plumber, Cleaning). Use my referral code *${referralCode}* to get instant discounts! Sign up here: ${referralLink}`;

  const shareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const shareSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent("Join TASPRO - Get instant discounts!")}&body=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join TASPRO Company",
          text: `Use my referral code ${referralCode} on TASPRO!`,
          url: referralLink,
        });
      } catch (e) {
        // Cancelled
      }
    } else {
      shareWhatsApp();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 sm:p-7 relative shadow-2xl space-y-5"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Refer a Friend
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Choose how you would like to invite your friends
          </p>
        </div>

        {/* 1. WhatsApp Instant Share (Primary) */}
        <button
          onClick={shareWhatsApp}
          className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <img src="/whatsapp.png" alt="WhatsApp" className="w-6 h-6 object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
          <span className="text-sm sm:text-base">Share on WhatsApp</span>
        </button>

        {/* 2. Referral Code Copy Box */}
        <div className="border-2 border-dashed border-orange-300 dark:border-orange-700/60 bg-orange-50/70 dark:bg-orange-950/30 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Referral Code
            </p>
            <p className="text-lg font-mono font-black text-gray-900 dark:text-white tracking-widest mt-0.5">
              {referralCode}
            </p>
          </div>

          <button
            onClick={copyCodeToClipboard}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Link Copy Box */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-3 bg-gray-50 dark:bg-gray-700/40 flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-mono flex-1">
            {referralLink}
          </span>
          <button
            onClick={copyLinkToClipboard}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-black text-white dark:bg-gray-600 dark:hover:bg-gray-500 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* 4. More Options Grid */}
        <div className="pt-2">
          <p className="text-[11px] text-gray-400 text-center uppercase tracking-wider mb-3">
            More Options
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={shareNative}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 mb-1">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:bg-gray-200">
                More Apps
              </span>
            </button>

            <button
              onClick={shareSMS}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 mb-1">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:bg-gray-200">
                SMS
              </span>
            </button>

            <button
              onClick={shareEmail}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 mb-1">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:bg-gray-200">
                Email
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
