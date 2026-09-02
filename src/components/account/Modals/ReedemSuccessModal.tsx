"use client";

import { Check } from "lucide-react";

interface RedeemSuccessModalProps {
  isSuccessOpen: boolean;
  onClose: () => void;
  redeemedAmount?: number;
}

const RedeemSuccessModal = ({
  isSuccessOpen,
  onClose,
  redeemedAmount = 450,
}: RedeemSuccessModalProps) => {
  if (!isSuccessOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 flex flex-col justify-center items-center text-center shadow-2xl relative"
      >
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-r from-[#FEC12D] to-[#FF552C] rounded-full flex items-center justify-center mb-4 shadow-lg">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Check className="text-[#FF552C] w-6 h-6 stroke-[3]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#FF512F] to-[#F09819] bg-clip-text text-transparent mb-2">
          Coins Redeemed Successfully!
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          ₹{redeemedAmount} has been credited to your TASPRO wallet. Invite more friends to earn more reward coins!
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition shadow-md cursor-pointer"
        >
          Got It, Thanks!
        </button>
      </div>
    </div>
  );
};

export default RedeemSuccessModal;
