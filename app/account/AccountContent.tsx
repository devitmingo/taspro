"use client";
// import AccountLayout from "@/components/account/AccountLayout";

// export default function AccountPage() {
//   return <AccountLayout />;
// }
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";
import SettingsList from "@/components/account/SettingsList";
import ProfileCard from "@/components/account/ProfileCard";
import GradientButton from "@/components/ui/GradientButton";
import EditProfile from "@/components/account/EditProfile";
import ReferEarn from "@/components/account/ReferEarn";
import MyWallet from "@/components/account/MyWallet";
import MyReviews from "@/components/account/MyReviews";
import MyCoupon from "@/components/account/MyCoupon";
import Payment from "@/components/account/Payment";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { House, Wrench, ClipboardList, UserRound, Trash2 } from "lucide-react";
import Breadcrumb from "@/components/account/Breadcrumb";
import Swal from "sweetalert2";

export default function AccountContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState("default");
  const [profile, setProfile] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setActiveView("default");
  }, [searchParams]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_BASE_URL}/customers/profile`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.status) {
        setProfile(res.data.data);
      }
    } catch (error) {
      console.log("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out of your account?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff5500",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            await axios.get(`${API_BASE_URL}/customers/logout`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            });
          }
        } catch (e) {}

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        logout();
        router.push("/");
      }
    });
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: "Delete Account?",
      html: `
        <div class="text-left text-sm text-gray-600 space-y-2.5">
          <p class="font-medium text-gray-800">Are you sure you want to permanently delete your account?</p>
          <div class="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-700 space-y-1">
            <p><strong>Warning:</strong> This action cannot be undone.</p>
            <p>• Your profile, saved addresses and preferences will be erased.</p>
            <p>• Any remaining wallet balance will be forfeited.</p>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete Account",
      cancelButtonText: "Keep Account",
      reverseButtons: true,
      focusCancel: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            await axios.delete(`${API_BASE_URL}/customers/delete-account`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            });
          }
        } catch (e) {
          console.error("Delete account error:", e);
        }

        // Clear local storage and log out
        localStorage.clear();
        logout();

        Swal.fire({
          icon: "success",
          title: "Account Deleted",
          text: "Your account has been deleted successfully.",
          confirmButtonColor: "#ff5500",
        }).then(() => {
          router.push("/");
        });
      }
    });
  };

  const getBreadcrumbs = () => {
    const base = [{ label: "Home", href: "/" }];
    if (activeView === "default") {
      return [...base, { label: "Account" }];
    }

    const viewLabels: Record<string, string> = {
      editProfile: "Edit Profile",
      wallet: "My Wallet",
      payment: "Saved Payment Methods",
      reviews: "My Rating & Reviews",
      coupon: "My Coupons",
      refer: "Refer & Earn",
    };

    return [
      ...base,
      { label: "Account", onClick: () => setActiveView("default") },
      { label: viewLabels[activeView] || "Account" },
    ];
  };

  const renderContent = () => {
    switch (activeView) {
      case "editProfile":
        return (
          <EditProfile
            setActiveView={setActiveView}
            profile={profile}
            fetchProfile={fetchProfile}
          />
        );
      case "refer":
        return <ReferEarn setActiveView={setActiveView} profile={profile} />;
      case "wallet":
        return <MyWallet setActiveView={setActiveView} profile={profile} />;
      case "reviews":
        return <MyReviews setActiveView={setActiveView} />;
      case "coupon":
        return <MyCoupon setActiveView={setActiveView} />;
      case "payment":
        return <Payment setActiveView={setActiveView} />;
      default:
        return <SettingsList setActiveView={setActiveView} />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login to View Account
          </h2>
          <a
            href="/login"
            className="text-orange-600 font-medium hover:underline"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

return (
  <div className="w-full bg-white dark:bg-gray-900 pb-24">
    {/* Dynamic Breadcrumbs */}
    <div className="mb-4">
      <Breadcrumb items={getBreadcrumbs()} />
    </div>

    {/* Content */}
    <div className="flex flex-col-reverse lg:flex-row">
      <div className="w-full lg:flex-1">{renderContent()}</div>

      {activeView === "default" && (
        <div className="w-full lg:w-[390px] px-10">
          <ProfileCard profile={profile} />
        </div>
      )}
    </div>

    {/* Logout & Delete Account Action Buttons */}
    {activeView === "default" && (
      <div className="mt-8 flex flex-col gap-3 justify-start lg:ml-12 w-full max-w-[390px] px-4 lg:px-0">
        <GradientButton
          text="Logout"
          width="w-full"
          textClassName="text-[18px] md:text-[20px] font-medium"
          onClick={handleLogout}
        />

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="w-full h-[40px] sm:h-[44px] rounded-lg border border-red-300 hover:border-red-500 bg-white hover:bg-red-50/70 text-red-600 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
        >
          <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          <span>Delete Account</span>
        </button>
      </div>
    )}

    {/* Mobile Bottom Navigation */}
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md z-50 md:hidden">
      <div className="grid grid-cols-3 h-16">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-gray-500"
        >
          <House className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">Home</span>
        </Link>

        <Link
          href="/my-booking"
          className="flex flex-col items-center justify-center text-gray-500"
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">Booking</span>
        </Link>

        <Link
          href="/account"
          className="flex flex-col items-center justify-center text-orange-500"
        >
          <UserRound className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">Account</span>
        </Link>
      </div>
    </div>
  </div>
);
}

