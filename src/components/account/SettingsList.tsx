"use client";

import {
  User,
  MapPin,
  Wallet,
  CreditCard,
  Bell,
  Star,
  Ticket,
  Gift,
  ChevronRight,
  Headphones,
  ShieldCheck,
  LogOut,
  Trash2,
  ClipboardList,
  Sparkles,
  Camera,
  Mail,
  Phone,
  HandCoins,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SelectAddressModal } from "../booking-flow/SelectAddressModal";
import AddNewAddressModal from "../AddNewAddressModal";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Props = {
  setActiveView: (view: string) => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  profile?: any;
};

export default function SettingsList({
  setActiveView,
  onLogout,
  onDeleteAccount,
  profile,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [notify, setNotify] = useState(true);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const [stats, setStats] = useState({
    walletBalance: "2,450.00",
    totalSavings: "1,860.00",
    availableCoupons: 5,
    totalBookings: 24,
  });

  useEffect(() => {
    if (
      profile?.wallet_balance !== undefined &&
      profile?.wallet_balance !== null &&
      Number(profile.wallet_balance) > 0
    ) {
      setStats((prev) => ({
        ...prev,
        walletBalance: Number(profile.wallet_balance).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      }));
    }
    if (
      profile?.total_savings !== undefined &&
      profile?.total_savings !== null &&
      Number(profile.total_savings) > 0
    ) {
      setStats((prev) => ({
        ...prev,
        totalSavings: Number(profile.total_savings).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      }));
    }

    const fetchAdditionalStats = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      try {
        const couponsRes = await axios.get(`${API_BASE_URL}/coupons`, {
          headers,
        });
        if (
          couponsRes.data?.status &&
          Array.isArray(couponsRes.data.data) &&
          couponsRes.data.data.length > 0
        ) {
          setStats((prev) => ({
            ...prev,
            availableCoupons: couponsRes.data.data.length,
          }));
        }
      } catch (e) {}

      try {
        const bookingsRes = await axios.get(
          `${API_BASE_URL}/customers/bookings`,
          { headers },
        );
        if (
          bookingsRes.data?.status &&
          Array.isArray(bookingsRes.data.data) &&
          bookingsRes.data.data.length > 0
        ) {
          setStats((prev) => ({
            ...prev,
            totalBookings: bookingsRes.data.data.length,
          }));
        }
      } catch (e) {}
    };

    fetchAdditionalStats();
  }, [profile]);

  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingAddress(true);

      const res = await axios.get(
        `${API_BASE_URL}/customers/customer-addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      setAddresses(res.data?.data || []);
    } catch (error: any) {
      console.log("Address API Error:", error.response?.data || error);
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } finally {
      setLoadingAddress(false);
    }
  };

  const addCustomerAddress = async (formData: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const cleanPhone = (value: string) => {
      if (!value) return "";
      const digits = value.replace(/\D/g, "");
      const last10 = digits.length > 10 ? digits.slice(-10) : digits;
      return last10 ? `+91 ${last10}` : "";
    };

    const altPhone =
      formData.alternateNumber ||
      formData.alt_contact_number ||
      formData.altPhone ||
      "";

    const payload = {
      full_name: formData.fullName || formData.name || "",
      contact_number: cleanPhone(
        formData.contactNumber || formData.phone || "",
      ),
      alt_contact_number: altPhone ? cleanPhone(altPhone) : null,
      postal_code: formData.postalCode || formData.pincode || "",
      latitude: formData.latitude || 21.2514,
      longitude: formData.longitude || 81.6296,
      country_id: 1,
      state_id: 1,
      city_id: 1,
      state_name: formData.state_name || formData.state || "Chhattisgarh",
      city_name: formData.city_name || formData.city || "Raipur",
      house_number: formData.houseNo || "",
      street: formData.street || formData.location || formData.address || "",
      type: "Home",
      is_active: 1,
    };

    await axios.post(
      `${API_BASE_URL}/customers/customer-addresses`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );
  };

  const handleSavedAddressClick = () => {
    setActiveView("address");
  };

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
    fetchAddresses();
  }, []);

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.name ||
    user?.firstName ||
    (user as any)?.name ||
    (user?.phone ? `+91 ${user.phone}` : "Customer");

  const displayEmail = profile?.email || user?.email || "";
  const displayPhone = profile?.mobile || (user as any)?.phone || "";
  const avatarUrl =
    profile?.profile_url ||
    (user as any)?.profileImage ||
    null;

  return (
    <div className="w-full space-y-6">
      {/* 1. Merged Profile & Overview Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-orange-50/80 via-amber-50/40 to-white border border-orange-100 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Left: Avatar + Profile Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              onClick={() => setActiveView("editProfile")}
              className="relative group cursor-pointer shrink-0"
              title="Customer profile"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover aspect-square ring-3 ring-white shadow-md border-2 border-orange-200/80 group-hover:opacity-95 transition-all"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                    const fallback = e.currentTarget.parentElement?.querySelector(".settings-avatar-fallback");
                    if (fallback) (fallback as HTMLElement).classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-100/90 text-[#FF6A00] flex items-center justify-center font-black text-2xl ring-3 ring-white shadow-md border-2 border-orange-200/80 group-hover:scale-105 transition-all settings-avatar-fallback ${
                  avatarUrl ? "hidden" : ""
                }`}
              >
                {displayName && displayName !== "Customer" && displayName !== "User" && !displayName.startsWith("+91") ? (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF6A00]" />
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-orange-200/60 text-[#FF6A00] text-[11px] font-extrabold shadow-2xs">
                  <Sparkles className="w-3 h-3" />
                  <span>TASpro Account</span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-full border border-gray-200/60">
                  Customer
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight truncate">
                {displayName}
              </h1>

              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mt-1">
                {displayEmail && (
                  <span className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{displayEmail}</span>
                  </span>
                )}
                {displayPhone && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>+91 {String(displayPhone).replace(/\D/g, "").slice(-10)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons (My Bookings, Help Center) */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={() => router.push("/my-booking")}
              className="px-4 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>My Bookings</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/contact-us")}
              className="px-3.5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              title="Help Center"
            >
              <Headphones className="w-4 h-4 text-gray-500" />
              <span>Help Center</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-orange-200/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 right-24 w-32 h-32 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Quick Stat Highlights - Premium Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. My Wallet */}
        <div
          onClick={() => setActiveView("wallet")}
          className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 truncate">
              My Wallet
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E8F8EE] text-[#1EAA55] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            </div>
          </div>

          <div className="my-2 sm:my-3">
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
              ₹{stats.walletBalance || "0.00"}
            </p>
          </div>

          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#1EAA55] flex items-center gap-1 group-hover:gap-1.5 transition-all">
              <span>View Balance</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 2. Addresses */}
        <div
          onClick={handleSavedAddressClick}
          className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 truncate">
              Addresses
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            </div>
          </div>

          <div className="my-2 sm:my-3">
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
              {addresses.length > 0 ? `${addresses.length} Saved` : "1 Saved"}
            </p>
          </div>

          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#2563EB] flex items-center gap-1 group-hover:gap-1.5 transition-all">
              <span>Manage Locations</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 3. Coupons */}
        <div
          onClick={() => setActiveView("coupon")}
          className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-amber-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 truncate">
              Coupons
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF7ED] text-[#F97316] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            </div>
          </div>

          <div className="my-2 sm:my-3">
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
              Offers
            </p>
          </div>

          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#F97316] flex items-center gap-1 group-hover:gap-1.5 transition-all">
              <span>View Coupons</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 4. Bookings */}
        <div
          onClick={() => router.push("/my-booking")}
          className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-purple-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 truncate">
              Bookings
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F5F0FF] text-[#9333EA] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            </div>
          </div>

          <div className="my-2 sm:my-3">
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
              History
            </p>
          </div>

          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#9333EA] flex items-center gap-1 group-hover:gap-1.5 transition-all">
              <span>Track Services</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Account Settings Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs">
        <div className="mb-5">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            Account Settings
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage your personal profile, addresses, payment cards & notifications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<User className="w-5 h-5 text-orange-600" />}
            iconBg="bg-orange-50 border-orange-200/60"
            title="Edit Profile"
            description="Update full name, verified email, phone number & gender"
            onClick={() => setActiveView("editProfile")}
          />

          <FeatureCard
            icon={<MapPin className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50 border-blue-200/60"
            title="Saved Addresses"
            description="Manage your home, apartment, office & service addresses"
            badge={addresses.length ? `${addresses.length} saved` : undefined}
            onClick={handleSavedAddressClick}
          />

          <FeatureCard
            icon={<Wallet className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50 border-emerald-200/60"
            title="My Wallet"
            description="Check wallet balance, instant refund credits & top-ups"
            onClick={() => setActiveView("wallet")}
          />

          <FeatureCard
            icon={<CreditCard className="w-5 h-5 text-indigo-600" />}
            iconBg="bg-indigo-50 border-indigo-200/60"
            title="Saved Payment Methods"
            description="Manage saved debit/credit cards, UPI IDs & preferences"
            onClick={() => setActiveView("payment")}
          />

          {/* Notification Setting Card spanning full width */}
          <div className="col-span-1 md:col-span-2 p-4 sm:p-5 bg-gray-50/60 hover:bg-gray-50 border border-gray-200/70 rounded-2xl transition-all flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-gray-900">
                  Notification Settings
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  Receive real-time booking alerts, technician arrival SMS & discount updates
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotify(!notify)}
              className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 cursor-pointer ${
                notify ? "bg-[#FF6A00]" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                  notify ? "translate-x-5.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. My Activity & Rewards Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs">
        <div className="mb-5">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            My Activity & Rewards
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Your technician ratings, active promo coupons, and referral credits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />}
            iconBg="bg-amber-50 border-amber-200/60"
            title="My Rating & Reviews"
            description="View ratings and service feedback left for verified technicians"
            onClick={() => setActiveView("reviews")}
          />

          <FeatureCard
            icon={<Ticket className="w-5 h-5 text-rose-600" />}
            iconBg="bg-rose-50 border-rose-200/60"
            title="My Coupons & Offers"
            description="Browse active discount coupons and seasonal promo codes"
            onClick={() => setActiveView("coupon")}
          />

          <FeatureCard
            icon={<Gift className="w-5 h-5 text-purple-600" />}
            iconBg="bg-purple-50 border-purple-200/60"
            title="Refer & Earn"
            description="Share your referral code with friends and earn cash credits"
            onClick={() => setActiveView("refer")}
          />

          <FeatureCard
            icon={<Headphones className="w-5 h-5 text-teal-600" />}
            iconBg="bg-teal-50 border-teal-200/60"
            title="Help & Support Center"
            description="24x7 customer support, service warranty & instant help"
            onClick={() => router.push("/contact-us")}
          />
        </div>
      </div>

      {/* 5. Account Security & Logout Section */}
      <div className="p-5 sm:p-6 bg-white border border-gray-100 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#FF6A00]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-gray-900">
              Account Security & Session
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Securely log out or permanently delete your customer account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}

          {onDeleteAccount && (
            <button
              type="button"
              onClick={onDeleteAccount}
              className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-600" />
              <span>Delete Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Address Selection & Creation Modals */}
      <SelectAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        onAddNew={() => {
          setIsAddressModalOpen(false);
          setIsAddModalOpen(true);
        }}
        onContinue={() => {
          setIsAddressModalOpen(false);
        }}
      />

      <AddNewAddressModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={async (newAddress) => {
          try {
            await addCustomerAddress(newAddress);
            await fetchAddresses();

            setIsAddModalOpen(false);
            setIsAddressModalOpen(true);
          } catch (error: any) {
            console.log("ADD ADDRESS ERROR:", error.response?.data || error);
          }
        }}
      />
    </div>
  );
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-4 sm:p-5 bg-white hover:bg-orange-50/20 border border-gray-100 hover:border-orange-200/90 rounded-2xl transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer group flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-[15px] font-bold text-gray-900 group-hover:text-[#FF6A00] transition-colors truncate">
              {title}
            </h4>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            {description}
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-[#FF6A00] text-gray-400 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs">
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
