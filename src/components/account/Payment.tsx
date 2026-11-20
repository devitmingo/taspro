"use client";

import {
  ArrowLeft,
  CreditCard,
  Building2,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ShieldCheck,
  Lock,
  User,
  Calendar,
  Eye,
  EyeOff,
  Check,
  X,
  Wallet,
  Loader2,
  Plus,
  Smartphone,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

// Clean vector logos matching the design
const UpiChevronIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L14 12L6 20L2.5 16.5L7.5 12L2.5 7.5L6 4Z" fill="#097939" />
    <path d="M12 4L20 12L12 20L8.5 16.5L13.5 12L8.5 7.5L12 4Z" fill="#ED7524" />
  </svg>
);

const UpiBadge = () => (
  <div className="flex items-center gap-1 shrink-0">
    <span className="font-black text-[#1E293B] italic text-[13px] tracking-tight">UPI</span>
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L14 12L6 20L2.5 16.5L7.5 12L2.5 7.5L6 4Z" fill="#097939" />
      <path d="M12 4L20 12L12 20L8.5 16.5L13.5 12L8.5 7.5L12 4Z" fill="#ED7524" />
    </svg>
  </div>
);

const VisaLogo = () => (
  <span className="font-black text-blue-700 tracking-wider italic text-[13px] px-1.5 py-0.5 shrink-0 font-sans select-none">
    VISA
  </span>
);

const MastercardLogo = () => (
  <div className="flex items-center -space-x-1.5 shrink-0 select-none">
    <div className="w-4 h-4 rounded-full bg-[#EB001B]" />
    <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-90" />
  </div>
);

const RupayLogo = () => (
  <span className="font-extrabold text-[#0066B2] text-xs px-1.5 py-0.5 italic shrink-0 select-none">
    RuPay<span className="text-[#FF6600]">▸</span>
  </span>
);

const SbiLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <div className="flex items-center gap-1.5 shrink-0 select-none">
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="16" fill="#0083CA" />
      <circle cx="18" cy="15" r="5" fill="#FFFFFF" />
      <rect x="16.5" y="15" width="3" height="11" fill="#FFFFFF" />
    </svg>
    <span className="font-black text-xs text-[#0083CA] tracking-tight">SBI</span>
  </div>
);

type Props = {
  setActiveView: (view: string) => void;
};

interface UpiItem {
  id: string | number;
  vpa: string;
  nickname?: string;
  linkedDate: string;
  isPrimary?: boolean;
}

interface CardItem {
  id: string | number;
  cardholderName: string;
  cardNumber: string;
  last4: string;
  expiry: string;
  network: "Visa" | "Mastercard" | "RuPay" | "Other";
  isPrimary?: boolean;
}

interface BankItem {
  id: string | number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  last4: string;
  ifsc: string;
  isPrimary?: boolean;
}

export default function Payment({ setActiveView }: Props) {
  const { user } = useAuth();
  const customerId = user?.id || (user as any)?.customer_id || "guest";

  // Section Accordion Toggles
  const [isUpiOpen, setIsUpiOpen] = useState(true);
  const [isCardsOpen, setIsCardsOpen] = useState(true);
  const [isBanksOpen, setIsBanksOpen] = useState(true);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddUpiOpen, setIsAddUpiOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);

  // Editing Items
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [editingUpi, setEditingUpi] = useState<UpiItem | null>(null);
  const [editingBank, setEditingBank] = useState<BankItem | null>(null);

  // Dynamic Lists
  const [upis, setUpis] = useState<UpiItem[]>([]);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [banks, setBanks] = useState<BankItem[]>([]);

  // 1. Fetch Payment Methods (UPI & Cards) from Backend
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || token === "null" || token === "undefined") {
        // Fallback to local storage for guests
        loadLocalPaymentMethods();
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/customers/customer-payment-methods`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.status && Array.isArray(res.data.data)) {
        const upiList: UpiItem[] = [];
        const cardList: CardItem[] = [];

        res.data.data.forEach((item: any) => {
          if (item.method_type === "upi") {
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recently";
            upiList.push({
              id: item.id,
              vpa: item.identifier,
              nickname: item.holder_name || undefined,
              linkedDate: dateStr,
              isPrimary: Boolean(item.is_primary),
            });
          } else if (item.method_type === "card") {
            cardList.push({
              id: item.id,
              cardholderName: item.holder_name || "Cardholder",
              cardNumber: item.identifier,
              last4: item.last4 || String(item.identifier).replace(/\D/g, "").slice(-4) || "0000",
              expiry: item.expiry || "MM/YY",
              network: (item.brand as any) || "Visa",
              isPrimary: Boolean(item.is_primary),
            });
          }
        });

        setUpis(upiList);
        setCards(cardList);

        // Mirror to local storage for fast cached load
        localStorage.setItem(`taspro_upis_${customerId}`, JSON.stringify(upiList));
        localStorage.setItem(`taspro_cards_${customerId}`, JSON.stringify(cardList));
      } else {
        loadLocalPaymentMethods();
      }
    } catch (e) {
      console.log("Error loading backend payment methods, falling back to local storage:", e);
      loadLocalPaymentMethods();
    }
  }, [customerId]);

  const loadLocalPaymentMethods = () => {
    if (typeof window !== "undefined") {
      const savedUpis = localStorage.getItem(`taspro_upis_${customerId}`);
      if (savedUpis) {
        try {
          setUpis(JSON.parse(savedUpis));
        } catch (e) {}
      }
      const savedCards = localStorage.getItem(`taspro_cards_${customerId}`);
      if (savedCards) {
        try {
          setCards(JSON.parse(savedCards));
        } catch (e) {}
      }
    }
  };

  // 2. Fetch Bank Accounts from Backend API
  const fetchBankAccounts = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || token === "null" || token === "undefined") {
        loadLocalBankAccounts();
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/customers/customer-bank-details`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.status && Array.isArray(res.data.data)) {
        const fetched: BankItem[] = res.data.data.map((item: any) => ({
          id: item.id,
          bankName: item.bank_name || "Bank Account",
          accountHolder: item.account_title || "Account Holder",
          accountNumber: item.account_number,
          last4: String(item.account_number).slice(-4),
          ifsc: item.iban_number || "",
          isPrimary: item.is_active === 1,
        }));
        setBanks(fetched);
        localStorage.setItem(`taspro_banks_${customerId}`, JSON.stringify(fetched));
      } else {
        loadLocalBankAccounts();
      }
    } catch (e) {
      console.log("Error loading backend bank details, using local cache:", e);
      loadLocalBankAccounts();
    }
  }, [customerId]);

  const loadLocalBankAccounts = () => {
    if (typeof window !== "undefined") {
      const savedBanks = localStorage.getItem(`taspro_banks_${customerId}`);
      if (savedBanks) {
        try {
          setBanks(JSON.parse(savedBanks));
        } catch (e) {}
      }
    }
  };

  // Load all data on mount and when customer changes
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPaymentMethods(), fetchBankAccounts()]).finally(() => {
      setLoading(false);
    });
  }, [fetchPaymentMethods, fetchBankAccounts]);

  // Set Primary Handlers
  const handleSetPrimaryUpi = async (id: string | number) => {
    try {
      const token = localStorage.getItem("token");
      if (token && typeof id === "number") {
        await axios.post(
          `${API_BASE_URL}/customers/customer-payment-methods/${id}/default`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (e) {}
    setUpis((prev) =>
      prev.map((item) => ({
        ...item,
        isPrimary: item.id === id,
      }))
    );
  };

  const handleSetPrimaryCard = async (id: string | number) => {
    try {
      const token = localStorage.getItem("token");
      if (token && typeof id === "number") {
        await axios.post(
          `${API_BASE_URL}/customers/customer-payment-methods/${id}/default`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (e) {}
    setCards((prev) =>
      prev.map((item) => ({
        ...item,
        isPrimary: item.id === id,
      }))
    );
  };

  const handleSetPrimaryBank = async (id: string | number) => {
    try {
      const token = localStorage.getItem("token");
      if (token && typeof id === "number") {
        await axios.post(
          `${API_BASE_URL}/customers/customer-bank-details/${id}/default`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (e) {}
    setBanks((prev) =>
      prev.map((item) => ({
        ...item,
        isPrimary: item.id === id,
      }))
    );
  };

  // Delete UPI
  const handleDeleteUpi = async (id: string | number) => {
    const result = await Swal.fire({
      title: "Remove UPI ID?",
      text: "Are you sure you want to remove this linked UPI ID?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6A00",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Remove",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (typeof id === "number" && token) {
          await axios.delete(`${API_BASE_URL}/customers/customer-payment-methods/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (e) {}

      setUpis((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        if (typeof window !== "undefined") {
          localStorage.setItem(`taspro_upis_${customerId}`, JSON.stringify(updated));
        }
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: "UPI ID removed successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // Delete Card
  const handleDeleteCard = async (id: string | number) => {
    const result = await Swal.fire({
      title: "Remove Card?",
      text: "Are you sure you want to remove this saved card?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6A00",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Remove",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (typeof id === "number" && token) {
          await axios.delete(`${API_BASE_URL}/customers/customer-payment-methods/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (e) {}

      setCards((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        if (typeof window !== "undefined") {
          localStorage.setItem(`taspro_cards_${customerId}`, JSON.stringify(updated));
        }
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: "Card removed successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // Delete Bank Account
  const handleDeleteBank = async (id: string | number) => {
    const result = await Swal.fire({
      title: "Remove Bank Account?",
      text: "Are you sure you want to remove this bank account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6A00",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Remove",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (typeof id === "number" && token) {
          await axios.delete(`${API_BASE_URL}/customers/customer-bank-details/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });
        }
      } catch (e) {}

      setBanks((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        if (typeof window !== "undefined") {
          localStorage.setItem(`taspro_banks_${customerId}`, JSON.stringify(updated));
        }
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: "Bank account removed successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-4 sm:p-8 shadow-xs">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setActiveView("default")}
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#FF6A00] flex items-center justify-center transition-all cursor-pointer border border-gray-200 hover:border-orange-200 shrink-0"
            title="Back to Account"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Saved Payment Methods
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 font-normal">
              Manage your linked UPI Quick Pay and bank accounts for instant checkouts &amp; refunds
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBank(null);
            setIsAddBankOpen(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank Account</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6A00]" />
          <p className="text-sm font-medium text-gray-500">Loading saved payment methods...</p>
        </div>
      ) : (
        /* 2. Main Two-Column Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Saved Methods List (col-span-8) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Registered Mobile UPI Card matching mockup */}
            <div className="border border-orange-200/90 rounded-2xl bg-[#FFFBF8] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-orange-100/70 text-[#FF6A00] flex items-center justify-center shrink-0 border border-orange-200/60">
                  <Smartphone className="w-6 h-6 text-[#FF6A00]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      Registered Mobile UPI
                    </span>
                    <span className="text-[10px] font-bold text-[#FF6A00] bg-[#FFF0E6] border border-orange-200 px-2 py-0.5 rounded uppercase tracking-wider">
                      PRIMARY
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-gray-800 font-mono mt-0.5 truncate">
                    {user?.phone ? `${String(user.phone).replace(/\D/g, "").slice(-10)}@upi` : "9644430161@upi"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    Used for 1-click UPI authorization on booking checkout
                  </p>
                </div>
              </div>
            </div>

            {/* A. UPI Section */}
            <div className="border border-gray-100 rounded-2xl bg-white shadow-2xs overflow-hidden transition-all">
              <div
                onClick={() => setIsUpiOpen(!isUpiOpen)}
                className="flex items-center justify-between p-4 sm:p-4.5 cursor-pointer hover:bg-gray-50/60 transition select-none"
              >
                <div className="flex items-center gap-2.5">
                  <UpiChevronIcon className="w-4 h-4" />
                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                    UPI Quick Pay ({upis.length})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                    <Check className="w-3 h-3 stroke-[3]" /> Active &amp; Ready for Checkout
                  </span>
                  {isUpiOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {isUpiOpen && (
                <div className="p-4 pt-1 sm:p-4.5 sm:pt-1 space-y-2.5 border-t border-gray-50">
                  {upis.length === 0 ? (
                    <div className="py-7 px-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/40">
                      <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center mx-auto mb-2">
                        <UpiChevronIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">No UPI IDs linked yet</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs mx-auto">
                        Link your UPI ID (Google Pay, PhonePe, Paytm) for instant 1-click payments.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUpi(null);
                          setIsAddUpiOpen(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#FF6A00] bg-orange-50 hover:bg-orange-100 rounded-lg transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Link UPI ID
                      </button>
                    </div>
                  ) : (
                    upis.map((upi) => (
                      <div
                        key={upi.id}
                        className="border border-gray-100 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white hover:border-gray-200 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-13 h-9 rounded-lg bg-gray-50/80 border border-gray-100 flex items-center justify-center shrink-0 p-1">
                            <UpiBadge />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm tracking-tight truncate">
                                {upi.vpa}
                              </span>
                              {upi.isPrimary ? (
                                <span className="text-[11px] font-semibold text-[#FA6705] bg-[#FFF4EC] px-2.5 py-0.5 rounded-full border border-orange-100/60">
                                  Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryUpi(upi.id)}
                                  className="text-[10px] font-semibold text-gray-400 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 px-2 py-0.5 rounded-full border border-gray-200/60 transition cursor-pointer"
                                >
                                  Make Primary
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {upi.nickname ? `${upi.nickname} • ` : ""}Linked on {upi.linkedDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-gray-400">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUpi(upi);
                              setIsAddUpiOpen(true);
                            }}
                            className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Edit UPI"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUpi(upi.id)}
                            className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Remove UPI"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* B. Saved Cards Section */}
            <div className="border border-gray-100 rounded-2xl bg-white shadow-2xs overflow-hidden transition-all">
              <div
                onClick={() => setIsCardsOpen(!isCardsOpen)}
                className="flex items-center justify-between p-4 sm:p-4.5 cursor-pointer hover:bg-gray-50/60 transition select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center text-[#FF6A00]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                    Saved Cards ({cards.length})
                  </span>
                </div>

                {isCardsOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {isCardsOpen && (
                <div className="p-4 pt-1 sm:p-4.5 sm:pt-1 space-y-2.5 border-t border-gray-50">
                  {cards.length === 0 ? (
                    <div className="py-7 px-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/40">
                      <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center mx-auto mb-2">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">No cards saved yet</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs mx-auto">
                        Save your debit or credit card securely for faster and 1-click checkout.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCard(null);
                          setIsAddCardOpen(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#FF6A00] bg-orange-50 hover:bg-orange-100 rounded-lg transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Card
                      </button>
                    </div>
                  ) : (
                    cards.map((c) => (
                      <div
                        key={c.id}
                        className="border border-gray-100 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white hover:border-gray-200 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-13 h-9 rounded-lg bg-gray-50/80 border border-gray-100 flex items-center justify-center shrink-0 p-1">
                            {c.network === "Visa" ? (
                              <VisaLogo />
                            ) : c.network === "Mastercard" ? (
                              <MastercardLogo />
                            ) : c.network === "RuPay" ? (
                              <RupayLogo />
                            ) : (
                              <CreditCard className="w-5 h-5 text-gray-500" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm tracking-tight truncate">
                                {c.network} •••• {c.last4}
                              </span>
                              {c.isPrimary ? (
                                <span className="text-[11px] font-semibold text-[#FA6705] bg-[#FFF4EC] px-2.5 py-0.5 rounded-full border border-orange-100/60">
                                  Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryCard(c.id)}
                                  className="text-[10px] font-semibold text-gray-400 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 px-2 py-0.5 rounded-full border border-gray-200/60 transition cursor-pointer"
                                >
                                  Make Primary
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {c.cardholderName ? `${c.cardholderName} • ` : ""}Expires {c.expiry}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-gray-400">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCard(c);
                              setIsAddCardOpen(true);
                            }}
                            className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Edit Card"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(c.id)}
                            className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Remove Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* C. Bank Accounts Section */}
            <div className="border border-gray-100 rounded-2xl bg-white shadow-2xs overflow-hidden transition-all">
              <div
                onClick={() => setIsBanksOpen(!isBanksOpen)}
                className="flex items-center justify-between p-4 sm:p-4.5 cursor-pointer hover:bg-gray-50/60 transition select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center text-[#FF6A00]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                    Bank Accounts ({banks.length})
                  </span>
                </div>

                {isBanksOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {isBanksOpen && (
                <div className="p-4 pt-1 sm:p-4.5 sm:pt-1 space-y-2.5 border-t border-gray-50">
                  {banks.length === 0 ? (
                    <div className="py-7 px-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/40">
                      <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center mx-auto mb-2">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">No bank accounts linked yet</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs mx-auto">
                        Add your bank account for 1-click payouts, instant refunds, and checkout.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBank(null);
                          setIsAddBankOpen(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#FF6A00] bg-orange-50 hover:bg-orange-100 rounded-lg transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Bank Account
                      </button>
                    </div>
                  ) : (
                    banks.map((b) => (
                      <div
                        key={b.id}
                        className="border border-gray-100 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white hover:border-gray-200 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-13 h-9 rounded-lg bg-gray-50/80 border border-gray-100 flex items-center justify-center shrink-0 p-1">
                            {b.bankName.toLowerCase().includes("sbi") ||
                            b.bankName.toLowerCase().includes("state bank") ? (
                              <SbiLogo className="w-5 h-5" />
                            ) : (
                              <Building2 className="w-5 h-5 text-blue-700" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm tracking-tight truncate">
                                {b.bankName}
                              </span>
                              {b.isPrimary ? (
                                <span className="text-[11px] font-semibold text-[#FA6705] bg-[#FFF4EC] px-2.5 py-0.5 rounded-full border border-orange-100/60">
                                  Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryBank(b.id)}
                                  className="text-[10px] font-semibold text-gray-400 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 px-2 py-0.5 rounded-full border border-gray-200/60 transition cursor-pointer"
                                >
                                  Make Primary
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {b.accountHolder ? `${b.accountHolder} • ` : ""}A/C •••• {b.last4}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-gray-400">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBank(b);
                              setIsAddBankOpen(true);
                            }}
                            className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Edit Bank Account"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBank(b.id)}
                            className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Remove Bank Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Add Payment Method & Security Guarantee (col-span-4) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {/* Add Payment Method Card */}
            <div className="border border-gray-100 rounded-2xl bg-white shadow-2xs p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 text-base mb-3.5 tracking-tight">
                Add Payment Method
              </h3>

              <div className="space-y-2.5">
                {/* Option 1: Add UPI */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingUpi(null);
                    setIsAddUpiOpen(true);
                  }}
                  className="w-full border border-gray-100 hover:border-orange-200 bg-orange-50/20 hover:bg-orange-50/50 p-3 sm:p-3.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-9 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center shrink-0 p-1">
                      <UpiBadge />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#FF6A00] transition-colors">
                        Add UPI
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Link a UPI ID (e.g. name@upi)
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF6A00] group-hover:translate-x-0.5 transition" />
                </button>

                {/* Option 2: Add Card */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingCard(null);
                    setIsAddCardOpen(true);
                  }}
                  className="w-full border border-gray-100 hover:border-orange-200 bg-gray-50/30 hover:bg-orange-50/30 p-3 sm:p-3.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center shrink-0 text-gray-600 group-hover:text-[#FF6A00] transition-colors">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#FF6A00] transition-colors">
                        Add Card
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Save Debit / Credit Card
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF6A00] group-hover:translate-x-0.5 transition" />
                </button>

                {/* Option 3: Add Bank Account */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingBank(null);
                    setIsAddBankOpen(true);
                  }}
                  className="w-full border border-gray-100 hover:border-orange-200 bg-gray-50/30 hover:bg-orange-50/30 p-3 sm:p-3.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center shrink-0 text-gray-600 group-hover:text-[#FF6A00] transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#FF6A00] transition-colors">
                        Add Bank Account
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Link your bank for instant payments
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF6A00] group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-700 shadow-2xs mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                  Your payment details are secure
                </h5>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                  We use industry-standard encryption to keep your information safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Modal 1: Save Card Details Modal */}
      {isAddCardOpen && (
        <CardModal
          isOpen={isAddCardOpen}
          initialData={editingCard}
          onClose={() => {
            setIsAddCardOpen(false);
            setEditingCard(null);
          }}
          onSave={async (newCard) => {
            try {
              const token = localStorage.getItem("token");
              if (token) {
                if (editingCard?.id && typeof editingCard.id === "number") {
                  await axios.put(
                    `${API_BASE_URL}/customers/customer-payment-methods/${editingCard.id}`,
                    {
                      holder_name: newCard.cardholderName,
                      expiry: newCard.expiry,
                      brand: newCard.network,
                      is_primary: newCard.isPrimary ? 1 : 0,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                } else {
                  await axios.post(
                    `${API_BASE_URL}/customers/customer-payment-methods`,
                    {
                      method_type: "card",
                      identifier: `•••• ${newCard.last4}`,
                      holder_name: newCard.cardholderName,
                      brand: newCard.network,
                      last4: newCard.last4,
                      expiry: newCard.expiry,
                      is_primary: newCard.isPrimary ? 1 : 0,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                }
                fetchPaymentMethods();
              } else {
                setCards((prev) => {
                  const existingIdx = prev.findIndex((c) => c.id === newCard.id);
                  if (existingIdx >= 0) {
                    const updated = [...prev];
                    updated[existingIdx] = newCard;
                    localStorage.setItem(`taspro_cards_${customerId}`, JSON.stringify(updated));
                    return updated;
                  }
                  const updated = [...prev, newCard];
                  localStorage.setItem(`taspro_cards_${customerId}`, JSON.stringify(updated));
                  return updated;
                });
              }
            } catch (e: any) {
              console.log("Card save notice:", e);
              if (e?.response?.data?.message) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: e.response.data.message,
                });
                return;
              }
            }

            setIsAddCardOpen(false);
            setEditingCard(null);
            Swal.fire({
              icon: "success",
              title: editingCard ? "Card Updated!" : "Card Saved!",
              text: "Your card details have been securely saved.",
              timer: 1600,
              showConfirmButton: false,
            });
          }}
        />
      )}

      {/* Modal 2: Save UPI Details Modal */}
      {isAddUpiOpen && (
        <UpiModal
          isOpen={isAddUpiOpen}
          initialData={editingUpi}
          onClose={() => {
            setIsAddUpiOpen(false);
            setEditingUpi(null);
          }}
          onSave={async (newUpi) => {
            try {
              const token = localStorage.getItem("token");
              if (token) {
                if (editingUpi?.id && typeof editingUpi.id === "number") {
                  await axios.put(
                    `${API_BASE_URL}/customers/customer-payment-methods/${editingUpi.id}`,
                    {
                      identifier: newUpi.vpa,
                      holder_name: newUpi.nickname,
                      is_primary: newUpi.isPrimary ? 1 : 0,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                } else {
                  await axios.post(
                    `${API_BASE_URL}/customers/customer-payment-methods`,
                    {
                      method_type: "upi",
                      identifier: newUpi.vpa,
                      holder_name: newUpi.nickname,
                      is_primary: newUpi.isPrimary ? 1 : 0,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                }
                fetchPaymentMethods();
              } else {
                setUpis((prev) => {
                  const existingIdx = prev.findIndex((u) => u.id === newUpi.id);
                  if (existingIdx >= 0) {
                    const updated = [...prev];
                    updated[existingIdx] = newUpi;
                    localStorage.setItem(`taspro_upis_${customerId}`, JSON.stringify(updated));
                    return updated;
                  }
                  const updated = [...prev, newUpi];
                  localStorage.setItem(`taspro_upis_${customerId}`, JSON.stringify(updated));
                  return updated;
                });
              }
            } catch (e: any) {
              console.log("UPI save notice:", e);
              if (e?.response?.data?.message) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: e.response.data.message,
                });
                return;
              }
            }

            setIsAddUpiOpen(false);
            setEditingUpi(null);
            Swal.fire({
              icon: "success",
              title: editingUpi ? "UPI Updated!" : "UPI Saved!",
              text: "Your UPI ID has been linked successfully.",
              timer: 1600,
              showConfirmButton: false,
            });
          }}
        />
      )}

      {/* Modal 3: Save Bank Account Details Modal */}
      {isAddBankOpen && (
        <BankModal
          isOpen={isAddBankOpen}
          initialData={editingBank}
          onClose={() => {
            setIsAddBankOpen(false);
            setEditingBank(null);
          }}
          onSave={async (newBank) => {
            try {
              const token = localStorage.getItem("token");
              if (token) {
                if (editingBank?.id && typeof editingBank.id === "number") {
                  await axios.put(
                    `${API_BASE_URL}/customers/customer-bank-details/${editingBank.id}`,
                    {
                      bank_name: newBank.bankName,
                      account_title: newBank.accountHolder,
                      account_number: newBank.accountNumber,
                      iban_number: newBank.ifsc,
                      is_active: newBank.isPrimary ? 1 : 0,
                    },
                    {
                      headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                } else {
                  await axios.post(
                    `${API_BASE_URL}/customers/customer-bank-details`,
                    {
                      bank_name: newBank.bankName,
                      account_title: newBank.accountHolder,
                      account_number: newBank.accountNumber,
                      iban_number: newBank.ifsc,
                      is_active: 1,
                    },
                    {
                      headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                }
                fetchBankAccounts();
              } else {
                setBanks((prev) => {
                  const existingIdx = prev.findIndex((b) => b.id === newBank.id);
                  if (existingIdx >= 0) {
                    const updated = [...prev];
                    updated[existingIdx] = newBank;
                    localStorage.setItem(`taspro_banks_${customerId}`, JSON.stringify(updated));
                    return updated;
                  }
                  const updated = [...prev, newBank];
                  localStorage.setItem(`taspro_banks_${customerId}`, JSON.stringify(updated));
                  return updated;
                });
              }
            } catch (e: any) {
              console.log("Bank account save notice:", e);
              if (e?.response?.data?.message) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: e.response.data.message,
                });
                return;
              }
            }

            setIsAddBankOpen(false);
            setEditingBank(null);
            Swal.fire({
              icon: "success",
              title: editingBank ? "Bank Account Updated!" : "Bank Account Saved!",
              text: "Your bank account has been saved successfully.",
              timer: 1600,
              showConfirmButton: false,
            });
          }}
        />
      )}
    </div>
  );
}

// ================= MODAL COMPONENTS =================

// 1. SAVE CARD DETAILS MODAL
function CardModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialData?: CardItem | null;
  onClose: () => void;
  onSave: (card: CardItem) => void;
}) {
  const [cardNumber, setCardNumber] = useState(initialData?.cardNumber || "");
  const [cardholderName, setCardholderName] = useState(initialData?.cardholderName || "");
  const [expiry, setExpiry] = useState(initialData?.expiry || "");
  const [cvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(true);

  if (!isOpen) return null;

  // Auto detect network
  const cleanNumber = cardNumber.replace(/\D/g, "");
  let network: "Visa" | "Mastercard" | "RuPay" | "Other" = "Visa";
  if (cleanNumber.startsWith("4")) {
    network = "Visa";
  } else if (cleanNumber.startsWith("5") || cleanNumber.startsWith("2")) {
    network = "Mastercard";
  } else if (
    cleanNumber.startsWith("60") ||
    cleanNumber.startsWith("65") ||
    cleanNumber.startsWith("81")
  ) {
    network = "RuPay";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && cleanNumber.length < 15) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Card Number",
        text: "Please enter a valid 15-16 digit card number.",
      });
      return;
    }
    if (!cardholderName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Cardholder Name Required",
        text: "Please enter the name on the card.",
      });
      return;
    }
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(expiry.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Expiry",
        text: "Please enter expiry date in MM / YY format.",
      });
      return;
    }
    if (!initialData && cvv.length < 3) {
      Swal.fire({
        icon: "warning",
        title: "Invalid CVV",
        text: "Please enter a valid 3-4 digit CVV.",
      });
      return;
    }

    onSave({
      id: initialData?.id || `card-${Date.now()}`,
      cardholderName: cardholderName.trim(),
      cardNumber: cleanNumber || initialData?.cardNumber || "",
      last4: cleanNumber ? cleanNumber.slice(-4) : initialData?.last4 || "0000",
      expiry: expiry.trim(),
      network: initialData ? initialData.network : network,
      isPrimary: initialData?.isPrimary || false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/70 flex items-center justify-center text-[#FF6A00] shrink-0 shadow-2xs">
              <CreditCard className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {initialData ? "Edit Card Details" : "Save Card Details"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Save your card securely for faster and easier payments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Card Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Card Number <span className="text-[#FF6A00]">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                maxLength={19}
                value={cardNumber}
                disabled={Boolean(initialData)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setCardNumber(formatted);
                }}
                placeholder="Enter card number"
                className={`w-full pl-10 pr-28 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all font-mono ${
                  initialData ? "opacity-75 cursor-not-allowed bg-gray-100" : ""
                }`}
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                <VisaLogo />
                <MastercardLogo />
                <RupayLogo />
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Cardholder Name <span className="text-[#FF6A00]">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Enter name as on card"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Expiry & CVV */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Expiry Date <span className="text-[#FF6A00]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={7}
                  value={expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (val.length >= 2) {
                      val = val.slice(0, 2) + " / " + val.slice(2);
                    }
                    setExpiry(val);
                  }}
                  placeholder="MM / YY"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                CVV {!initialData && <span className="text-[#FF6A00]">*</span>}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showCvv ? "text" : "password"}
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder={initialData ? "•••" : "Enter CVV"}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCvv(!showCvv)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Save Card Checkbox */}
          <div className="pt-1 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="saveCardFuture"
              checked={saveForFuture}
              onChange={(e) => setSaveForFuture(e.target.checked)}
              className="w-4 h-4 text-[#FF6A00] accent-[#FF6A00] rounded cursor-pointer"
            />
            <label htmlFor="saveCardFuture" className="text-xs font-medium text-gray-700 cursor-pointer">
              Save this card for future payments
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{initialData ? "Update Card" : "Save Card"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. SAVE UPI DETAILS MODAL
function UpiModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialData?: UpiItem | null;
  onClose: () => void;
  onSave: (upi: UpiItem) => void;
}) {
  const [upiId, setUpiId] = useState(initialData?.vpa || "");
  const [nickname, setNickname] = useState(initialData?.nickname || "");
  const [saveForFuture, setSaveForFuture] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUpi = upiId.trim();
    if (!cleanUpi || !cleanUpi.includes("@")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid UPI ID",
        text: "Please enter a valid UPI ID (e.g. name@upi, 9876543210@paytm).",
      });
      return;
    }

    onSave({
      id: initialData?.id || `upi-${Date.now()}`,
      vpa: cleanUpi,
      nickname: nickname.trim() || undefined,
      linkedDate: initialData?.linkedDate || "Today",
      isPrimary: initialData?.isPrimary || false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/70 flex items-center justify-center shrink-0 shadow-2xs p-2">
              <UpiChevronIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {initialData ? "Edit UPI Details" : "Save UPI Details"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Add your UPI ID for faster and seamless payments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* UPI ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              UPI ID <span className="text-[#FF6A00]">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <span className="font-bold text-xs text-orange-600">UPI▸</span>
              </div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter UPI ID (e.g. name@upi)"
                className="w-full pl-14 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all font-mono placeholder:font-sans"
              />
            </div>
          </div>

          {/* UPI Nickname */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              UPI Nickname (Optional)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Personal UPI, Work UPI"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Save UPI Checkbox */}
          <div className="pt-1 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="saveUpiFuture"
              checked={saveForFuture}
              onChange={(e) => setSaveForFuture(e.target.checked)}
              className="w-4 h-4 text-[#FF6A00] accent-[#FF6A00] rounded cursor-pointer"
            />
            <label htmlFor="saveUpiFuture" className="text-xs font-medium text-gray-700 cursor-pointer">
              Save this UPI ID for future payments
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{initialData ? "Update UPI" : "Save UPI"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. SAVE BANK ACCOUNT DETAILS MODAL
function BankModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialData?: BankItem | null;
  onClose: () => void;
  onSave: (bank: BankItem) => void;
}) {
  const [accountHolder, setAccountHolder] = useState(initialData?.accountHolder || "");
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || "");
  const [ifsc, setIfsc] = useState(initialData?.ifsc || "");
  const [bankName, setBankName] = useState(initialData?.bankName || "");
  const [saveForFuture, setSaveForFuture] = useState(true);

  if (!isOpen) return null;

  // Auto detect bank name based on IFSC prefix
  const handleIfscChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    setIfsc(clean);

    if (clean.startsWith("SBIN")) setBankName("State Bank of India");
    else if (clean.startsWith("HDFC")) setBankName("HDFC Bank");
    else if (clean.startsWith("ICIC")) setBankName("ICICI Bank");
    else if (clean.startsWith("UTIB")) setBankName("Axis Bank");
    else if (clean.startsWith("PUNB")) setBankName("Punjab National Bank");
    else if (clean.startsWith("BARB")) setBankName("Bank of Baroda");
    else if (clean.startsWith("CNRB")) setBankName("Canara Bank");
    else if (clean.startsWith("KKBK")) setBankName("Kotak Mahindra Bank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountHolder.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name Required",
        text: "Please enter account holder name.",
      });
      return;
    }
    const cleanAcc = accountNumber.replace(/\D/g, "");
    if (cleanAcc.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Account Number",
        text: "Please enter a valid bank account number.",
      });
      return;
    }
    if (ifsc.trim().length !== 11) {
      Swal.fire({
        icon: "warning",
        title: "Invalid IFSC",
        text: "Please enter a valid 11-character IFSC code.",
      });
      return;
    }

    onSave({
      id: initialData?.id || `bank-${Date.now()}`,
      bankName: bankName.trim() || "National Bank",
      accountHolder: accountHolder.trim(),
      accountNumber: cleanAcc,
      last4: cleanAcc.slice(-4),
      ifsc: ifsc.trim().toUpperCase(),
      isPrimary: initialData?.isPrimary || false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/70 flex items-center justify-center text-[#FF6A00] shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {initialData ? "Edit Bank Account Details" : "Save Bank Account Details"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Add your bank account for refunds and online payments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Account Holder Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Account Holder Name <span className="text-[#FF6A00]">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Enter account holder name (as per bank)"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Account Number & IFSC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Account Number <span className="text-[#FF6A00]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={20}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter account number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                IFSC Code <span className="text-[#FF6A00]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={11}
                  value={ifsc}
                  onChange={(e) => handleIfscChange(e.target.value)}
                  placeholder="Enter IFSC code"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Bank Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Bank Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank name will be auto-fetched"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Save Bank Checkbox */}
          <div className="pt-1 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="saveBankFuture"
              checked={saveForFuture}
              onChange={(e) => setSaveForFuture(e.target.checked)}
              className="w-4 h-4 text-[#FF6A00] accent-[#FF6A00] rounded cursor-pointer"
            />
            <label htmlFor="saveBankFuture" className="text-xs font-medium text-gray-700 cursor-pointer">
              Save this bank account for future payments
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{initialData ? "Update Bank Account" : "Save Bank Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
