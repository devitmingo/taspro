"use client";

import { ArrowLeft, Bell, Lock, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchNotifications = async (pageNumber = 1) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!user && !token) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/customers/notifications?page=${pageNumber}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.status && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
        setPage(res.data.pagination?.current_page || 1);
        setLastPage(res.data.pagination?.last_page || 1);
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.log("NOTIFICATION FETCH ERROR:", error?.response?.data || error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 font-semibold">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isLogged = Boolean(user || token);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative flex items-center justify-center sm:mb-10 dark:text-gray-300">
          <button onClick={() => router.back()} className="absolute left-0">
            <ArrowLeft className="w-7 h-7" />
          </button>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        </div>

        {!isLogged ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/40 rounded-full flex items-center justify-center mb-5 text-orange-500 shadow-inner">
              <Lock className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Please Login to View Notifications
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed mb-6">
              Log in to your account to view your service status, order updates, and exclusive promo offers.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 transition-all text-white px-6 py-3 rounded-xl font-medium shadow-md flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Sign In</span>
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-5 text-gray-400">
              <Bell className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Notifications Yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed mb-6">
              You will be notified here about your booking updates and offers.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-orange-500 hover:bg-orange-600 transition-all text-white px-6 py-3 rounded-xl font-medium shadow-md"
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {notifications.map((section: any, index: number) => (
              <div key={index} className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  {section.title}
                </h2>

                <div className="space-y-3">
                  {section.data?.map((item: any) => (
                    <div
                      key={item.id}
                      className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 flex gap-4 items-center hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: item.bgColor || "#FFF3E0" }}
                      >
                        <Bell className="w-6 h-6" style={{ color: item.color || "#F57C00" }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>

                        <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                          {item.created_at}
                        </p>
                      </div>

                      {item.status !== "Read" && (
                        <span className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {lastPage > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => fetchNotifications(page - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 transition-colors"
                >
                  Previous
                </button>

                <span className="text-xs font-bold text-gray-500">
                  Page {page} of {lastPage}
                </span>

                <button
                  disabled={page === lastPage}
                  onClick={() => fetchNotifications(page + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white disabled:opacity-50 hover:bg-orange-600 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
