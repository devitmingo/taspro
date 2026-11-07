"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Gift,
  Coins,
  Send,
  CalendarCheck,
  ChevronDown,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import RedeemModal from "./Modals/ReedemModal";
import RedeemSuccessModal from "./Modals/ReedemSuccessModal";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

type Props = {
  setActiveView: (view: string) => void;
  profile?: any;
};

export default function ReferEarn({ setActiveView, profile }: Props) {
  const { user } = useAuth();
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  // Dynamic user coins
  const [coins, setCoins] = useState(453);

  useEffect(() => {
    if (profile?.coins !== undefined && profile?.coins !== null) {
      setCoins(Number(profile.coins));
    }
  }, [profile]);

  // Dynamic referral code and link
  const userName =
    profile?.first_name ||
    user?.firstName ||
    (user as any)?.name ||
    "TAS";
  const userMobile = profile?.mobile || (user as any)?.phone || "999";
  const cleanPhone = String(userMobile).replace(/\D/g, "");
  const referralCode = `TAS${userName.slice(0, 3).toUpperCase()}${cleanPhone.slice(-4) || "2026"}`;

  const [origin, setOrigin] = useState("https://tasprocompany.com");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const referralLink = `${origin}/login?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    Swal.fire({
      icon: "success",
      title: "Referral Link Copied!",
      text: "Share this link with your friends to give them an instant discount.",
      confirmButtonColor: "#FF6A00",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Use my referral code *${referralCode}* on TASpro Company to get instant discount on expert AC repair, electrical, plumbing & home services: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: "Join TASpro Company",
      text: `Use my referral code ${referralCode} to get instant discounts on expert home services on TASpro!`,
      url: referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      handleWhatsAppShare();
    }
  };

  const handleRedeemSuccess = () => {
    setIsRedeemOpen(false);
    setIsSuccessOpen(true);
    setCoins(0);
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
      {/* 1. Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveView("default")}
            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50/60 hover:bg-orange-50 hover:border-orange-200 text-gray-700 hover:text-[#FF6A00] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Refer & Earn
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Invite friends and earn rewards when they book verified home services on TASpro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{coins} Reward Coins</span>
          </span>
        </div>
      </div>

      {/* 2. Hero 2-Column Banner: Referral Code & Actions + Coins Reward Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Referral Code & Sharing (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-orange-50/70 via-amber-50/30 to-white border border-orange-100/90 p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-2xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-orange-200 text-[#FF6A00] text-xs font-extrabold shadow-2xs mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Invite Friends, Get ₹200 Each</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
              Give ₹100 Off, Get ₹200 in Coins! 🎁
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              Share your unique referral code with family and friends. When they complete their first home service booking, they get ₹100 instant discount and you receive 200 Coins.
            </p>
          </div>

          {/* Referral Code Display & Copy Box */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Your Unique Referral Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border-2 border-dashed border-[#FF6A00]/60 rounded-2xl px-4 py-3 flex items-center justify-between">
                <span className="font-mono text-base sm:text-lg font-black tracking-widest text-[#FF6A00]">
                  {referralCode}
                </span>
                <span className="text-[11px] font-semibold text-gray-400 uppercase">
                  Code
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  isCopied
                    ? "bg-green-600 text-white"
                    : "bg-[#FF6A00] hover:bg-[#F05A00] text-white"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1-Click Social Sharing */}
          <div className="pt-2 border-t border-orange-100/80 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-orange-50 border border-orange-200 text-[#FF6A00] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Copy Link</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="More sharing options"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Reward Coins Card (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 sm:p-7 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              Coin Balance
            </span>
            <span className="text-[11px] font-bold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              1 Coin = ₹1 Cash
            </span>
          </div>

          <div className="relative z-10 my-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Coins className="w-8 h-8" />
              </div>
              <div>
                <span className="text-4xl font-black text-white tracking-tight">
                  {coins}
                </span>
                <span className="text-xs text-amber-300 font-bold ml-2">
                  Coins
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Equivalent to <strong className="text-white">₹{coins}</strong> in TASpro Wallet
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 space-y-3">
            <button
              type="button"
              disabled={coins === 0}
              onClick={() => setIsRedeemOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF6A00] to-amber-500 hover:from-[#F05A00] hover:to-amber-600 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Gift className="w-4 h-4" />
              <span>Redeem Coins to Wallet</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              Redeemed amount is instantly usable on any service booking.
            </p>
          </div>
        </div>
      </div>

      {/* 3. How It Works (3 Clear Steps) */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-gray-900">
          How Referral Program Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 text-[#FF6A00] flex items-center justify-center font-black text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-gray-900 pt-1">
              Invite Your Friends
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Send your unique referral code or link via WhatsApp, SMS, or social media.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center font-black text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-gray-900 pt-1">
              Friend Books a Service
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              They sign up and get ₹100 instant discount on their first home service appointment.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200/60 text-green-600 flex items-center justify-center font-black text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-gray-900 pt-1">
              You Both Get Rewarded
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Upon completed service, 200 reward coins are credited to your account for 1-click redemption.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Terms & Policy Accordion */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/40">
        <button
          type="button"
          onClick={() => setShowFaq(!showFaq)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-gray-800 hover:text-[#FF6A00] transition-colors cursor-pointer"
        >
          <span>Referral Program Terms & Guidelines</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              showFaq ? "rotate-180 text-[#FF6A00]" : "text-gray-400"
            }`}
          />
        </button>

        {showFaq && (
          <div className="p-5 pt-0 text-xs text-gray-600 space-y-2 border-t border-gray-100 bg-white">
            <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-gray-500">
              <li>Referral bonuses apply to first-time customer registrations on TASpro Company.</li>
              <li>Reward coins are credited after the invited friend’s service booking is successfully completed and verified.</li>
              <li>Each reward coin equals ₹1 in TASpro wallet balance, and can be used for any service booking.</li>
              <li>Coins are non-transferable to third-party bank accounts directly, but applicable towards booking services or subscription plans.</li>
              <li>TASpro Company reserves the right to review and reject referral bonuses in cases of suspicious or fraudulent activity.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Redeem & Success Modals */}
      <RedeemModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        onSuccess={handleRedeemSuccess}
        coins={coins}
      />

      <RedeemSuccessModal
        isSuccessOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        redeemedAmount={coins}
      />
    </div>
  );
}
