"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import GradientButton2 from "../ui/GradientButton2";
import { ArrowLeft } from "lucide-react";
import RedeemModal from "./Modals/ReedemModal";
import RedeemSuccessModal from "./Modals/ReedemSuccessModal";
import ShareModal from "./Modals/ShareModal";
import { useAuth } from "@/context/AuthContext";

type Props = {
  setActiveView: (view: string) => void;
  profile?: any;
};

export default function ReferEarn({ setActiveView, profile }: Props) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Dynamic user coins
  const [coins, setCoins] = useState(453);

  useEffect(() => {
    if (profile?.coins !== undefined && profile?.coins !== null) {
      setCoins(Number(profile.coins));
    }
  }, [profile]);

  // Dynamic referral code and link
  const userName = profile?.first_name || (user as any)?.firstName || "TAS";
  const userMobile = profile?.mobile || (user as any)?.phone || "999";
  const referralCode = `TAS${userName.slice(0, 3).toUpperCase()}${userMobile.slice(-4)}`;

  const [origin, setOrigin] = useState("https://app.tasprocompany.in");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const referralLink = `${origin}/login?ref=${referralCode}`;

  const handleShare = async () => {
    const shareData = {
      title: "Join TASPRO Company",
      text: `Use my referral code ${referralCode} to get instant discounts on expert home services on TASPRO!`,
      url: referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share dismissed
      }
    } else {
      const text = encodeURIComponent(
        `Hey! Check out TASPRO for trusted home services (AC repair, Electrician, Plumbing & more). Use my referral code ${referralCode} to get instant discounts: ${referralLink}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  const handleRedeemSuccess = () => {
    setIsOpen(false);
    setIsSuccessOpen(true);
    setCoins(0);
  };

  const terms = [
    "The cash bonus offer is available exclusively to Premium subscribers of TASPRO Company.",
    "Only active Premium subscribers are eligible for the cash bonus offer.",
    "To qualify for the cash bonus, Premium subscribers must refer a Service Professional to join TASPRO Company using their unique referral invite link.",
    "The referral invite link can be found in the referral section of the app.",
    "The referred Service Professional must subscribe to a paid plan on TASPRO Company using the Premium subscriber's referral invite link.",
    "The Service Professional must maintain an active subscription for a minimum period of 30 days to qualify for the cash bonus.",
    "The cash bonus amount will be calculated based on a percentage of the Service Professional's subscription fee.",
    "The specific percentage will be determined by TASPRO Company and may vary over time.",
    "The cash bonus will be credited to the Premium subscriber's account upon successful qualification.",
    "Cash bonuses earned through referrals can be redeemed at any time during the Premium subscriber's active subscription period.",
    "The cash bonus can be used towards future payments or withdrawn as cash, subject to TASPRO Company's withdrawal policies.",
    "TASPRO Company reserves the right to review and monitor referral activity for any fraudulent or suspicious behavior.",
    "Any violation of the referral program's terms or abuse of the system may result in disqualification and loss of earned cash bonuses.",
    "TASPRO Company reserves the right to modify or terminate the cash bonus offer at any time, with or without prior notice.",
    "Changes to the offer will be communicated through app notifications or email.",
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 lg:ml-14 px-4 lg:px-0">
      {/* Terms Section */}
      <div className="rounded-lg max-w-3xl mx-auto w-full order-3 lg:order-1">
        <h3 className="font-semibold text-[18px] dark:text-white">
          Rules For Refer a friend
        </h3>
        <ol
          className={`list-decimal list-inside space-y-2 text-[14px] text-[#414141] dark:text-gray-200 transition-all duration-300 ${
            showAll ? "" : "line-clamp-2"
          } lg:line-clamp-none`}
        >
          {terms.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
        <p
          className="lg:hidden text-blue-500 text-center mt-2 cursor-pointer"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "View less" : "View more"}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-center gap-6 w-full order-1 lg:order-2">
        <div className="w-full flex justify-between items-center mb-6">
          {/* Back */}
          <button
            onClick={() => setActiveView("default")}
            className="text-black dark:text-white font-semibold flex items-center gap-2 hover:text-orange-500 transition cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span>Refer & Earn</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-[#0B0B2A] text-white p-6 rounded-2xl md:rounded-2xl w-full md:max-w-[430px] flex flex-col items-center gap-6">
          <p className="text-orange-400 text-center font-semibold">
            Refer a Friend & Earn Coins
          </p>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <img src="/icons/fi1.png" alt="rupees" className="w-8 h-8" />
              <span className="text-[24px] font-semibold">{coins}</span>
            </div>
            <p className="text-sm text-gray-300">Your Coins</p>
          </div>

          <div className="flex justify-center items-center w-full">
            <GradientButton2
              text="Redeem"
              width="w-[150px]"
              type="button"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>

        {/* Image */}
        <div className="mt-2 flex justify-center">
          <img
            src="/bro.png"
            alt="Bro"
            className="w-[260px] sm:w-[300px] h-auto"
          />
        </div>

        {/* Button */}
        <div className="mt-4 w-full flex justify-center">
          <GradientButton2
            text="Refer a Friend"
            width="w-full max-w-[390px]"
            type="button"
            onClick={() => setIsShareOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <RedeemModal
        isOpen={isOpen}
        coins={coins}
        onClose={() => setIsOpen(false)}
        onSuccess={handleRedeemSuccess}
      />

      <RedeemSuccessModal
        isSuccessOpen={isSuccessOpen}
        redeemedAmount={coins}
        onClose={() => setIsSuccessOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        referralCode={referralCode}
        referralLink={referralLink}
      />
    </div>
  );
}
