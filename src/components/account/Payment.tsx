"use client";

import { ArrowLeft, CreditCard, Building2, Trash2, Plus, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { BankAccountModal } from "@/components/account/Modals/BankAccountModal";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

type Props = {
  setActiveView: (view: string) => void;
};

export default function SavedPayments({ setActiveView }: Props) {
  const { user } = useAuth();
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `${API_BASE_URL}/customers/customer-bank-details`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.status && Array.isArray(res.data.data)) {
        const formattedCards = res.data.data.map((item: any) => ({
          id: item.id,
          bank: item.bank_name,
          holderName: item.account_title,
          number: String(item.account_number).slice(-4),
          fullNumber: item.account_number,
          iban: item.iban_number,
          isActive: item.is_active === 1,
          type: "BANK",
        }));

        setCards(formattedCards);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.log("Failed to fetch bank details", error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Remove Bank Account?",
      text: "Are you sure you want to remove this bank account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Remove",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `${API_BASE_URL}/customers/customer-bank-details/${id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.status) {
        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Bank account removed successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchBankDetails();
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.response?.data?.message || "Failed to remove bank account.",
      });
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const userPhone = (user as any)?.phone || (user as any)?.mobile || "";

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setActiveView("default")}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#FF6A00] flex items-center justify-center transition-all cursor-pointer border border-gray-200 hover:border-orange-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Saved Payment Methods
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage your linked UPI Quick Pay and bank accounts for instant checkouts & refunds
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsBankModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6A00] hover:bg-[#F05A00] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank Account</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* 1. UPI SECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 font-bold text-sm sm:text-base">
              UPI Quick Pay
            </h2>
            <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200/60">
              Active &amp; Ready for Checkout
            </span>
          </div>

          <div className="p-4 bg-orange-50/30 border border-orange-200/60 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-gray-900">Registered Mobile UPI</h4>
                  <span className="text-[9px] font-bold text-orange-700 bg-orange-100/80 px-1.5 py-0.5 rounded">
                    PRIMARY
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-700 font-mono mt-0.5">
                  {userPhone ? `${userPhone}@upi` : "Linked to registered mobile"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Used for 1-click UPI authorization on booking checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SAVED BANK ACCOUNTS & CARDS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 font-bold text-sm sm:text-base">
              Saved Bank Accounts &amp; Cards
            </h2>
            {cards.length > 0 && (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/60">
                {cards.length} {cards.length === 1 ? "Account" : "Accounts"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-12 px-6 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
              <div className="w-12 h-12 bg-orange-50 border border-orange-200/60 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-gray-900 text-sm font-bold">
                No saved bank accounts or cards
              </h3>
              <p className="text-gray-400 text-xs mt-1 mb-5 max-w-sm mx-auto">
                Add your bank account for 1-click payouts, instant refunds, and faster checkout authorization.
              </p>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bank Account</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl p-5 text-white bg-gradient-to-r from-teal-600 to-teal-800 shadow-sm flex flex-col justify-between h-44 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold opacity-95">{card.bank}</p>
                      <p className="text-xs opacity-75">{card.holderName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCard(card.id)}
                      className="p-1.5 bg-white/20 hover:bg-red-500 rounded-lg text-white transition cursor-pointer"
                      title="Remove Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-lg font-mono tracking-widest my-auto">
                    •••• •••• •••• {card.number}
                  </p>

                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-80">IFSC: {card.iban}</span>
                    <span className="bg-white/90 text-teal-800 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                      {card.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Add Bank Button */}
        <div className="sm:hidden pt-2">
          <button
            type="button"
            onClick={() => setIsBankModalOpen(true)}
            className="w-full py-3 bg-[#FF6A00] text-white font-bold rounded-xl text-sm shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      <BankAccountModal
        isOpen={isBankModalOpen}
        onClose={() => {
          setIsBankModalOpen(false);
          fetchBankDetails();
        }}
      />
    </div>
  );
}
