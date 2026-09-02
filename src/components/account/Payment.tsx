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
    <div className="md:min-h-screen flex flex-col w-full pb-10">
      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3 mb-2">
        <button
          onClick={() => setActiveView("default")}
          className="text-black dark:text-white font-semibold flex items-center gap-2 hover:text-orange-500 transition cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Saved Payment Methods</span>
        </button>
      </div>

      {/* MAIN WRAPPER */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SAVED BANK ACCOUNTS & CARDS */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-base">
              Saved Bank Accounts & Cards
            </h2>
            {cards.length > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                {cards.length} {cards.length === 1 ? "Account" : "Accounts"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 max-w-md">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold">
                No saved bank accounts or cards
              </p>
              <p className="text-gray-400 text-xs mt-1 mb-4">
                Add your bank account for instant payouts and refunds
              </p>
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Add Bank Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl p-5 text-white bg-gradient-to-r from-teal-500 to-teal-700 shadow-md flex flex-col justify-between h-44 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold opacity-95">{card.bank}</p>
                      <p className="text-xs opacity-75">{card.holderName}</p>
                    </div>
                    <button
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

        {/* UPI SECTION */}
        <div className="py-4 mt-2">
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-base mb-3">
            UPI Quick Pay
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3.5 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700">
              <div className="w-11 h-11 bg-orange-50 dark:bg-orange-950/40 rounded-full flex items-center justify-center text-orange-500 flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Registered Mobile UPI</p>
                <p className="text-xs text-gray-500 truncate">
                  {userPhone ? `${userPhone}@upi` : "Linked to registered mobile"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 max-w-xl">
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold text-sm shadow-md transition cursor-pointer active:scale-98"
          >
            + Add New Bank Account
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
