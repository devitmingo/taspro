"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Zap,
  Gift,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

type Props = {
  setActiveView: (view: string) => void;
  profile?: any;
};

export default function MyWallet({ setActiveView, profile }: Props) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "credits" | "debits">("all");
  const [topUpAmount, setTopUpAmount] = useState<number | null>(null);

  const balance = profile?.wallet_balance ?? profile?.balance ?? 0;
  const userName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user?.firstName ||
    (user as any)?.name ||
    "TASpro Member";
  const userPhone = profile?.mobile || (user as any)?.phone || "";

  // Wallet transactions - empty state or real
  const transactions: any[] = [];

  const handleWithdrawal = () => {
    Swal.fire({
      icon: "info",
      title: "Bank Withdrawal",
      text: "Withdrawal requests are transferred to your saved bank account within 24 hours via IMPS.",
      confirmButtonColor: "#FF6A00",
      confirmButtonText: "Got it",
    });
  };

  const handleAddMoney = (amt?: number) => {
    const defaultAmt = amt || 500;
    Swal.fire({
      title: "Add Money to Wallet",
      html: `
        <div class="text-left space-y-3">
          <p class="text-xs text-gray-500">Enter amount to add using UPI, Cards or Net Banking:</p>
          <div class="relative">
            <span class="absolute left-3 top-3 text-lg font-bold text-gray-400">₹</span>
            <input 
              id="swal-wallet-amount" 
              type="number" 
              value="${defaultAmt}" 
              class="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-900 text-lg focus:outline-none focus:border-[#FF6A00]" 
              placeholder="500" 
            />
          </div>
          <p class="text-[11px] text-gray-400">Funds are credited instantly to your TASpro balance.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#FF6A00",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Proceed to Pay",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const input = document.getElementById("swal-wallet-amount") as HTMLInputElement;
        const val = Number(input?.value);
        if (!val || val < 10) {
          Swal.showValidationMessage("Please enter an amount of at least ₹10");
          return false;
        }
        return val;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Wallet Top-up Initiated",
          text: `Payment gateway for ₹${result.value} has been initialized.`,
          confirmButtonColor: "#FF6A00",
        });
      }
    });
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7">
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
              My Wallet
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage your TASpro wallet balance, instant refunds, top-ups and bank withdrawals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => handleAddMoney()}
            className="px-4 py-2 bg-[#FF6A00] hover:bg-[#F05A00] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Money</span>
          </button>
          <button
            type="button"
            onClick={handleWithdrawal}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* 2. Top Balanced Grid: Premium Card on Left + Benefits on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Premium Wallet Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="h-full min-h-[220px] rounded-3xl bg-gradient-to-br from-[#FF6A00] via-[#FF8533] to-[#FFA066] text-white p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between">
            {/* Background glowing rings */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-orange-900/15 blur-lg pointer-events-none" />

            {/* Top row */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-sm tracking-wide uppercase opacity-90">
                  TASpro Wallet
                </span>
              </div>
              <span className="text-[10px] font-extrabold tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full uppercase border border-white/30 backdrop-blur-xs">
                Active
              </span>
            </div>

            {/* Middle Balance */}
            <div className="relative z-10 my-4">
              <p className="text-xs uppercase tracking-widest text-orange-100 font-semibold mb-1">
                Available Balance
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black tracking-tight">
                  ₹{Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Bottom info & Quick Action */}
            <div className="relative z-10 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-white truncate max-w-[170px]">{userName}</p>
                <p className="text-[11px] text-orange-100 font-mono">
                  {userPhone ? `+91 ${String(userPhone).slice(-10)}` : "Verified Customer"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddMoney()}
                className="bg-white hover:bg-orange-50 text-[#FF6A00] font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                + Top Up
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Perks & Fast Top-up pills (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Quick Top-up buttons */}
          <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/40 border border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                Fast Top-up Shortcut
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Add instant balance with 1-click preset amounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddMoney(amt)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FF6A00] hover:text-white border border-orange-200 text-[#FF6A00] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Benefit Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200/60 text-green-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 pt-1">1-Click Pay</h4>
              <p className="text-[11px] text-gray-400 leading-snug">
                Checkout in seconds without waiting for bank OTPs
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 pt-1">Instant Refunds</h4>
              <p className="text-[11px] text-gray-400 leading-snug">
                Cancellations are credited back to your wallet instantly
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 pt-1">100% Safe</h4>
              <p className="text-[11px] text-gray-400 leading-snug">
                Secured by 256-bit encryption with zero deduction fee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Transactions Section */}
      <div className="pt-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Recent Transactions
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Review your passbook entries, refunds, and booking payments
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-50 border border-gray-200/80 self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("credits")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === "credits"
                  ? "bg-white text-green-700 shadow-2xs"
                  : "text-gray-500 hover:text-green-700"
              }`}
            >
              Credits (+)
            </button>
            <button
              type="button"
              onClick={() => setFilter("debits")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === "debits"
                  ? "bg-white text-red-600 shadow-2xs"
                  : "text-gray-500 hover:text-red-600"
              }`}
            >
              Debits (-)
            </button>
          </div>
        </div>

        {/* Transactions Content */}
        {transactions.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-gray-50/60 border border-dashed border-gray-200 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/70 text-[#FF6A00] flex items-center justify-center mx-auto shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-800">
                No Transactions Yet
              </h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Your wallet activity, service payments, cashbacks, and instant refunds will appear here automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddMoney()}
              className="mt-2 px-4 py-2 bg-white hover:bg-orange-50 border border-orange-200 text-[#FF6A00] font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              + Add First Deposit
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === "credit"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {tx.type === "credit" ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{tx.title || "Wallet Transaction"}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{tx.date || "Today"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-black text-sm ${
                      tx.type === "credit" ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
