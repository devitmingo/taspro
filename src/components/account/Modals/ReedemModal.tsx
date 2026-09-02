"use client";

import GradientButton2 from "@/components/ui/GradientButton2";

type RedeemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  coins?: number;
};

const RedeemModal = ({ isOpen, onClose, onSuccess, coins = 450 }: RedeemModalProps) => {
  if (!isOpen) return null;

  // Conversion: 10 coins = ₹10 (1 coin = ₹1)
  const totalAmount = Math.max(0, coins);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        {/* Close Button */}
        <div className="absolute top-4 right-4 flex justify-end items-center">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xl font-bold text-gray-900">Redeem Coins</h2>
          <p className="text-xs text-gray-500">
            Convert your earned reward coins directly into wallet cash.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl space-y-3 mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Available Coins</span>
              <span className="text-gray-900 dark:text-white font-bold">{coins} Coins</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Conversion Rate</span>
              <span className="text-gray-900 dark:text-white font-medium">1 Coin = ₹1</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Redemption Fee</span>
              <span className="text-green-600 font-semibold">FREE (₹0)</span>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="flex justify-between text-base font-bold">
              <span className="bg-gradient-to-r from-[#FF512F] to-[#F09819] bg-clip-text text-transparent">
                Cash to Receive
              </span>
              <span className="bg-gradient-to-r from-[#FF512F] to-[#F09819] bg-clip-text text-transparent text-lg">
                ₹{totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-6 flex justify-center">
          <GradientButton2
            text={coins > 0 ? `Redeem ₹${totalAmount} to Wallet` : "No Coins to Redeem"}
            width="w-full"
            onClick={() => {
              if (coins > 0) onSuccess();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RedeemModal;
