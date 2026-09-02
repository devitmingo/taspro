"use client";
import Image from "next/image";
import { ArrowLeft, Wallet, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

type Props = {
  setActiveView: (view: string) => void;
  profile?: any;
};

export default function MyWallet({ setActiveView, profile }: Props) {
  const { user } = useAuth();

  const balance = profile?.wallet_balance ?? profile?.balance ?? 0;
  const userName = profile?.first_name || (user as any)?.firstName || "User";
  const userPhone = profile?.mobile || (user as any)?.phone || "";

  // Wallet transactions - dynamically empty or real if customer has transactions
  const transactions: any[] = [];

  const handleWithdrawal = () => {
    Swal.fire({
      icon: "info",
      title: "Instant Withdrawal",
      text: "Withdrawal request will be transferred to your linked bank account within 24 hours.",
      confirmButtonColor: "#f97316",
    });
  };

  return (
    <div className="w-full md:px-4 lg:px-8">
      {/* Back Button for both Mobile & Desktop */}
      <button
        onClick={() => setActiveView("default")}
        className="text-black dark:text-white font-semibold flex items-center gap-2 hover:text-orange-500 transition mb-6 cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>My Wallet</span>
      </button>

      <div className="flex flex-col-reverse lg:flex-row gap-6 md:gap-12 w-full">
        {/* Transactions Section */}
        <div className="flex-1 w-full max-w-[420px]">
          <h2 className="text-[18px] font-semibold text-black dark:text-white mb-4">
            Recent Transactions
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                No transactions yet
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Your wallet activity and cashbacks will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FF512F] to-[#F09819] rounded-full flex items-center justify-center text-white">
                      <Wallet className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-[15px] text-[#1B1B1B] dark:text-gray-200 font-medium">
                        {item.name || userName}
                      </p>
                      <p className="text-[11px] text-[#666666] dark:text-gray-400">
                        {item.phone || userPhone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[15px] text-green-600 font-semibold">
                      +{item.amount}
                    </p>
                    <p className="text-[10px] text-[#666666] dark:text-gray-400">
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wallet Card */}
        <div className="w-full max-w-[390px] h-[200px] mb-4">
          <div className="relative h-[200px] bg-gradient-to-r from-[#FF512F] to-[#F09819] text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="z-10 relative">
              <p className="text-sm font-medium opacity-90">My Wallet</p>
              <p className="text-xs uppercase tracking-wider opacity-75 mt-1">
                Available Balance
              </p>

              <h2 className="text-[28px] md:text-[32px] font-bold mt-1">
                ₹ {Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="z-10 relative">
              <button
                onClick={handleWithdrawal}
                className="text-xs bg-white text-orange-600 font-semibold px-4 py-2 rounded-full hover:bg-orange-50 transition shadow-sm cursor-pointer active:scale-95"
              >
                Instant Withdrawal
              </button>
            </div>

            {/* Wallet graphic & icon */}
            <div className="absolute right-3 bottom-4 opacity-85 pointer-events-none">
              <img
                src="/walletimg.png"
                alt="wallet"
                className="w-[140px] md:w-[170px] h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
