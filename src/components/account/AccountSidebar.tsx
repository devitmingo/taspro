// "use client";

// import { Home, Calendar, Package, User } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// interface AccountSidebarProps {
//   className?: string;
// }

// export const AccountSidebar = ({ className = "" }: AccountSidebarProps) => {
//   const pathname = usePathname();

//   const navItems = [
//     {
//       href: "/",
//       icon: Home,
//       label: "Home",
//     },
//     {
//       href: "/schedule",
//       icon: Calendar,
//       label: "My Schedule",
//     },
//     {
//       href: "/my-booking",
//       icon: Package,
//       label: "Bookings",
//     },
//     {
//       href: "/account",
//       icon: User,
//       label: "Account",
//     },
//   ];

//   const isActive = (href: string) => {
//     if (href === "/account") {
//       return pathname === "/account" || pathname.startsWith("/account/");
//     }
//     return pathname === href;
//   };

//   return (
//     <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
//       <nav className="space-y-2">
//         {navItems.map((item) => {
//           const Icon = item.icon;
//           const active = isActive(item.href);

//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
//                 active
//                   ? "bg-orange-50 text-orange-600 border border-orange-100"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`}
//             >
//               <Icon className="w-5 h-5" />
//               <span>{item.label}</span>
//             </Link>
//           );
//         })}
//       </nav>
//     </div>
//   );
// };

"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import GradientButton from "@/components/ui/GradientButton";
import { Camera, User } from "lucide-react";

type MenuItem = {
  icon: string;
  label: string;
  href: string;
};

export default function AccountSidebar({
  profile: propProfile,
}: {
  profile?: any;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(propProfile || null);

  useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
      return;
    }

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/customers/profile`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMounted && res.data?.status && res.data?.data) {
          setProfile(res.data.data);
        }
      } catch (e) {
        // Fallback to user from AuthContext
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [propProfile]);

  const activeProfile = propProfile || profile;

  const avatarUrl =
    activeProfile?.profile_url ||
    user?.profileImage ||
    null;

  const firstName = activeProfile?.first_name || user?.firstName || "";
  const lastName = activeProfile?.last_name || user?.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const displayName =
    fullName ||
    activeProfile?.name ||
    (user?.phone || user?.mobile ? `+91 ${user?.phone || user?.mobile}` : "User");

  const displayEmail =
    activeProfile?.email ||
    user?.email ||
    (user?.phone || user?.mobile ? `+91 ${user?.phone || user?.mobile}` : "No email added");

  const menu: MenuItem[] = [
    { icon: "/icons/Home.png", label: "Home", href: "/" },
    { icon: "/icons/Calender.png", label: "Bookings", href: "/my-booking" },
    { icon: "/icons/profile.png", label: "Account", href: "/account" },
  ];

  return (
    <div
      className="
    hidden md:flex flex-col
    bg-white dark:bg-gray-100 rounded-2xl border border-gray-200
    md:w-[80px] lg:w-[270px] xl:w-[280px]
    md:p-3 lg:p-5
    h-fit sticky top-24 self-start flex-shrink-0 z-10 shadow-xs
  "
    >
      {/* 1. Profile Section (Desktop lg+) */}
      <div className="hidden lg:flex flex-col items-center text-center pb-4 border-b border-gray-100 dark:border-gray-200">
        <Link
          href="/account?view=editProfile"
          className="relative group cursor-pointer mb-2.5"
          title="Edit Profile"
        >
          <div className="w-[84px] h-[84px] rounded-full p-0.5 bg-gradient-to-tr from-[#FEC12D] to-[#FF552C] shadow-xs transition-transform duration-200 group-hover:scale-105">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover bg-white"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".sidebar-avatar-fallback");
                  if (fallback) (fallback as HTMLElement).classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={`w-full h-full rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold text-2xl sidebar-avatar-fallback ${
                avatarUrl ? "hidden" : ""
              }`}
            >
              {displayName && displayName !== "User" && !displayName.startsWith("+91") ? (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-10 h-10 text-[#FF6A00]" />
              )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#FF6A00] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:bg-[#E55F00] transition-colors">
            <Camera className="w-3 h-3" />
          </div>
        </Link>

        <h3 className="text-[16px] font-bold text-[#0A0F0D] dark:text-gray-900 truncate max-w-full tracking-tight">
          {displayName}
        </h3>
        <p className="text-[13px] text-[#808080] dark:text-gray-500 truncate max-w-full font-normal mt-0.5">
          {displayEmail}
        </p>

        {/* Action Buttons: My Bookings & Help Center */}
        <div className="grid grid-cols-2 gap-2 mt-4 w-full">
          <GradientButton
            text="My Bookings"
            width="w-full"
            height="h-[34px]"
            textClassName="text-[12px] font-bold"
            onClick={() => router.push("/my-booking")}
          />

          <GradientButton
            text="Help Center"
            width="w-full"
            height="h-[34px]"
            textClassName="text-[12px] font-bold"
            onClick={() => router.push("/contact-us")}
          />
        </div>
      </div>

      {/* 2. Compact Profile on Tablet (md only) */}
      <div className="md:flex lg:hidden flex-col items-center pb-3 border-b border-gray-100 dark:border-gray-200">
        <Link
          href="/account?view=editProfile"
          className="relative group cursor-pointer"
          title={`${displayName} (${displayEmail})`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-200"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
                const fallback = e.currentTarget.parentElement?.querySelector(".mobile-sidebar-fallback");
                if (fallback) (fallback as HTMLElement).classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`w-10 h-10 rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold text-sm ring-2 ring-orange-200 mobile-sidebar-fallback ${
              avatarUrl ? "hidden" : ""
            }`}
          >
            {displayName && displayName !== "User" && !displayName.startsWith("+91") ? (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="w-5 h-5 text-[#FF6A00]" />
            )}
          </div>
        </Link>
      </div>

      {/* 3. Navigation Links (Menu: Home, Bookings, Account) */}
      <nav className="flex flex-col gap-1 lg:gap-1.5 pt-3">
        {menu.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (item.href === "/account") {
                  try {
                    sessionStorage.removeItem("accountActiveView");
                  } catch (err) {}
                  e.preventDefault();
                  router.push("/account");
                } else if (pathname === item.href) {
                  e.preventDefault();
                  router.replace(`${item.href}?refresh=${Date.now()}`);
                }
              }}
              className="flex items-center gap-2 md:gap-2 lg:gap-3 xl:gap-3 px-2 md:px-2 lg:px-3 xl:px-3 py-2 lg:py-2.5 rounded-xl transition md:justify-center lg:justify-start group hover:bg-orange-50/40"
            >
              {/* ICON */}
              <div className="relative w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 flex-shrink-0">
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-full h-full object-contain ${
                    isActive
                      ? "opacity-0"
                      : "brightness-0 invert-[75%] group-hover:opacity-0"
                  }`}
                />

                <div
                  className={`absolute inset-0 bg-gradient-to-r from-[#FEC12D] to-[#FF552C] transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    WebkitMaskImage: `url(${item.icon})`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    WebkitMaskSize: "contain",
                  }}
                />
              </div>

              {/* TEXT */}
              <span
                className={`
                  text-sm md:text-[13px] lg:text-[15px] xl:text-base font-semibold whitespace-nowrap
                  md:hidden lg:block
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#FEC12D] to-[#FF552C] bg-clip-text text-transparent"
                      : "text-[#C1C1C1] group-hover:bg-gradient-to-r group-hover:from-[#FEC12D] group-hover:to-[#FF552C] group-hover:bg-clip-text group-hover:text-transparent"
                  }
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
