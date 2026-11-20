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
import GradientButton from "@/components/ui/GradientButton";
import EditProfile from "@/components/account/EditProfile";
import ReferEarn from "@/components/account/ReferEarn";
import MyWallet from "@/components/account/MyWallet";
import MyReviews from "@/components/account/MyReviews";
import MyCoupon from "@/components/account/MyCoupon";
import Payment from "@/components/account/Payment";
import SavedAddresses from "@/components/account/SavedAddresses";
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
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState("default");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam) {
      setActiveView(viewParam);
      try {
        sessionStorage.setItem("accountActiveView", viewParam);
      } catch (e) {}
    } else {
      setActiveView("default");
      try {
        sessionStorage.removeItem("accountActiveView");
      } catch (e) {}
    }
  }, [searchParams]);

  const handleSetActiveView = (view: string) => {
    setActiveView(view);
    try {
      if (view === "default") {
        sessionStorage.removeItem("accountActiveView");
        router.push("/account");
      } else {
        sessionStorage.setItem("accountActiveView", view);
        router.push(`/account?view=${view}`);
      }
    } catch (e) {
      if (view === "default") {
        router.push("/account");
      } else {
        router.push(`/account?view=${view}`);
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") return;

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
    } catch (error: any) {
      console.log("Profile fetch error:", error);
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        logout();
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    const handleLoginEvent = () => {
      fetchProfile();
    };
    window.addEventListener("user-logged-in", handleLoginEvent);
    return () => window.removeEventListener("user-logged-in", handleLoginEvent);
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
      address: "Saved Addresses",
      wallet: "My Wallet",
      payment: "Saved Payment Methods",
      reviews: "My Rating & Reviews",
      coupon: "My Coupons",
      refer: "Refer & Earn",
    };

    return [
      ...base,
      { label: "Account", onClick: () => handleSetActiveView("default") },
      { label: viewLabels[activeView] || "Account" },
    ];
  };

  const renderContent = () => {
    switch (activeView) {
      case "editProfile":
        return (
          <EditProfile
            setActiveView={handleSetActiveView}
            profile={profile}
            fetchProfile={fetchProfile}
          />
        );
      case "address":
        return <SavedAddresses setActiveView={handleSetActiveView} />;
      case "refer":
        return <ReferEarn setActiveView={handleSetActiveView} profile={profile} />;
      case "wallet":
        return <MyWallet setActiveView={handleSetActiveView} profile={profile} />;
      case "reviews":
        return <MyReviews setActiveView={handleSetActiveView} />;
      case "coupon":
        return <MyCoupon setActiveView={handleSetActiveView} />;
      case "payment":
        return <Payment setActiveView={handleSetActiveView} />;
      default:
        return (
          <SettingsList
            setActiveView={handleSetActiveView}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            profile={profile}
          />
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#ff5500] flex items-center justify-center mb-4">
          <UserRound className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
          Please Login to View Account
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Log in with your phone number to access your account details, bookings, wallet, and saved addresses.
        </p>
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.setItem("redirectAfterLogin", "/account");
            }
            window.dispatchEvent(new Event("open-auth-modal"));
          }}
          className="bg-[#ff5500] hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
        >
          Login / Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-transparent pb-24">
      {/* Dynamic Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb items={getBreadcrumbs()} />
      </div>

      {/* Content */}
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}

