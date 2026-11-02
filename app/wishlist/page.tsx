"use client";

import { ArrowLeft, Heart, Star, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { useBooking } from "@/context/BookingContext";
import ServiceDetailsModal from "@/components/ServiceDetailsModal";
import WarrantyModal from "@/components/WarrantyModal";
import Link from "next/link";

export default function WishlistPage() {
  const router = useRouter();

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const inFlightWishlistRef = useRef<Set<number>>(new Set());

  // Modal states
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWarrantyService, setSelectedWarrantyService] = useState<any>(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  const { cartItems, addToCart, removeFromCart } = useBooking();

  const safeImage = (img?: string | null) => {
    return getImageUrl(img, "/tas.logo.png");
  };

  const getWishId = (item: any) =>
    Number(
      item.service_issue_id ||
        item.issue_id ||
        item.service_issue?.id ||
        item.issue?.id ||
        item.id,
    );

  const getTitleInfo = (item: any) => {
    let problem = item.issue_name || item.name || "";
    let acType = item.sub_category_name || item.subService || "";

    if (!problem && item.title) {
      const match = item.title.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        const p1 = match[1].trim();
        const p2 = match[2].trim();
        if (/ac|cleaning|repair|package/i.test(p1)) {
          acType = p1;
          problem = p2;
        } else {
          problem = p1;
          acType = p2;
        }
      } else {
        problem = item.title;
      }
    }

    if (problem && problem.includes("(") && problem.includes(")")) {
      const m = problem.match(/^(.+?)\s*\((.+?)\)$/);
      if (m) {
        if (/ac|cleaning|repair|package/i.test(m[1])) {
          acType = acType || m[1].trim();
          problem = m[2].trim();
        } else {
          problem = m[1].trim();
          acType = acType || m[2].trim();
        }
      }
    }

    return {
      problem: problem || "Service Issue",
      acType: acType || "",
    };
  };

  const extractBulletPoints = (item: any): string[] => {
    if (Array.isArray(item.issueDescriptions) && item.issueDescriptions.length > 0) {
      const descText = item.issueDescriptions[0]?.description || "";
      const matches = descText.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (matches && matches.length > 0) {
        return matches.map((m: string) => m.replace(/<\/?[^>]+(>|$)/g, "").trim()).filter(Boolean);
      }
    }
    if (typeof item.description === "string" && item.description.includes("<li")) {
      const matches = item.description.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (matches && matches.length > 0) {
        return matches.map((m: string) => m.replace(/<\/?[^>]+(>|$)/g, "").trim()).filter(Boolean);
      }
    }
    if (typeof item.description === "string" && item.description.trim()) {
      const clean = item.description.replace(/<\/?[^>]+(>|$)/g, "").trim();
      const lines = clean.split("\n").map((s: string) => s.trim()).filter(Boolean);
      if (lines.length > 0) return lines;
    }
    return [
      "Verified professionals",
      "Affordable pricing",
      "Quick doorstep service",
    ];
  };

  const handleAddService = (item: any) => {
    const wishId = getWishId(item);
    const discPrice = Math.round(Number(item.discountedPrice || item.price || 0));
    const origPrice = Math.round(
      Number(item.originalPrice || item.strike_price || (discPrice > 0 ? Math.round(discPrice * 1.25) : 0)),
    );
    const { problem, acType } = getTitleInfo(item);

    addToCart({
      id: wishId,
      name: problem,
      subService: acType || "Service",
      serviceName: item.service_name || "Service",
      price: discPrice,
      discountedPrice: discPrice,
      originalPrice: origPrice,
      quantity: 1,
      service_id: Number(item.service_id || 1),
      service_issue_id: wishId,
      service_sub_category_id: item.service_sub_category_id,
      warrantyDays: item.warrantyDays || item.warranty_days || 30,
      warrantyTitle: item.warrantyTitle || item.warranty_title || "Service Warranty",
      warrantyDescription: item.warrantyDescription || item.warranty_description,
      packageTag: item.packageTag || item.package_tag,
      image: item.image,
    } as any);
  };

  const toggleWishlist = async (item: any) => {
    const id = getWishId(item);
    if (!id) return;

    if (inFlightWishlistRef.current.has(id)) return;
    inFlightWishlistRef.current.add(id);

    // instant UI remove with functional state update
    let removedItem: any = null;
    setWishlist((prev) => {
      removedItem = prev.find((w) => getWishId(w) === id) || item;
      const next = prev.filter((wish) => getWishId(wish) !== id);
      const nextIds = next.map((w) => getWishId(w)).filter(Boolean);
      try {
        localStorage.setItem("wishlistItems", JSON.stringify(nextIds));
      } catch (e) {}
      return next;
    });

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const response = await axios.post(
        `${API_BASE_URL}/customers/wish-lists/${id}`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data?.status) {
        // Rollback
        setWishlist((prev) => {
          if (prev.some((w) => getWishId(w) === id)) return prev;
          const next = [...prev, removedItem || item];
          const nextIds = next.map((w) => getWishId(w)).filter(Boolean);
          try {
            localStorage.setItem("wishlistItems", JSON.stringify(nextIds));
          } catch (e) {}
          return next;
        });
      } else {
        // Notify other pages
        window.dispatchEvent(
          new CustomEvent("wishlistUpdated", {
            detail: { id, source: "wishlist-page" },
          })
        );
      }
    } catch (error: any) {
      console.log("Remove Wishlist Error:", error?.response?.data || error);
      setWishlist((prev) => {
        if (prev.some((w) => getWishId(w) === id)) return prev;
        const next = [...prev, removedItem || item];
        const nextIds = next.map((w) => getWishId(w)).filter(Boolean);
        try {
          localStorage.setItem("wishlistItems", JSON.stringify(nextIds));
        } catch (e) {}
        return next;
      });
    } finally {
      inFlightWishlistRef.current.delete(id);
    }
  };

  const fetchWishlist = async () => {
    if (inFlightWishlistRef.current.size > 0) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);

      let stateName = "Chhattisgarh";
      let cityName = "Raipur";
      try {
        const savedLoc = localStorage.getItem("selected_location");
        if (savedLoc) {
          const parsed = JSON.parse(savedLoc);
          if (parsed.state) stateName = parsed.state;
          if (parsed.city) cityName = parsed.city;
        }
      } catch (e) {}

      const response = await axios.get(`${API_BASE_URL}/customers/wish-lists`, {
        params: {
          state_name: stateName,
          city_name: cityName,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const apiWishlist = response.data?.data || [];
      if (inFlightWishlistRef.current.size === 0) {
        setWishlist(apiWishlist);
        const wishlistIds = apiWishlist.map((item: any) => getWishId(item)).filter(Boolean);
        localStorage.setItem("wishlistItems", JSON.stringify(wishlistIds));
      }
    } catch (error: any) {
      console.log("Wishlist Error:", error);
      if (error?.response?.status === 401) {
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();

    const handleFocus = () => fetchWishlist();
    const handleExternalUpdate = (e: any) => {
      if (e?.detail?.source === "wishlist-page") return;
      fetchWishlist();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("wishlistUpdated", handleExternalUpdate);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("wishlistUpdated", handleExternalUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full 2xl:w-[85%] mx-auto px-4 sm:px-5 py-6 sm:py-8 min-h-[60vh]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-gray-700 hover:text-orange-500 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              My Wishlist
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {wishlist.length} {wishlist.length === 1 ? "service" : "services"} saved
            </p>
          </div>
        </div>

        {wishlist.length > 0 && (
          <Link
            href="/cart"
            className="text-xs sm:text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            View Cart ({cartItems.length})
          </Link>
        )}
      </div>

      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-700 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 fill-orange-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            Please Login to View Wishlist
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs leading-relaxed">
            Sign in to access your saved favorite services across all devices.
          </p>
          <button
            onClick={() => window.dispatchEvent(new Event("open-auth-modal"))}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Login to TASpro
          </button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-700 text-center">
          <img
            src="/pana.png"
            alt="No Wishlist"
            className="w-[200px] h-[200px] object-contain mb-4"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-[340px] leading-6 mb-6">
            Save your favorite services here and book them anytime with just one tap.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 hover:bg-orange-600 transition-all text-white px-7 py-3 rounded-xl font-semibold shadow-md text-sm active:scale-95 cursor-pointer"
          >
            Explore Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {wishlist.map((item) => {
            const wishId = getWishId(item);
            const { problem, acType } = getTitleInfo(item);
            const discPrice = Math.round(Number(item.discountedPrice || item.price || 0));
            const origPrice = Math.round(
              Number(
                item.originalPrice ||
                  item.strike_price ||
                  (discPrice > 0 ? Math.round(discPrice * 1.25) : 0),
              ),
            );
            const calcOff =
              origPrice > discPrice
                ? Math.round(((origPrice - discPrice) / origPrice) * 100)
                : null;
            const discountPercent = calcOff ? `${calcOff}% OFF` : null;
            const bulletPoints = extractBulletPoints(item);

            const cartItem = cartItems.find(
              (c: any) =>
                Number(c.id) === Number(wishId) ||
                Number(c.service_issue_id) === Number(wishId),
            );

            return (
              <div
                key={wishId || item.id || item.title}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-4 sm:gap-5">
                    {/* Left Column: Image with Add / Quantity overlay */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <img
                          src={safeImage(item.image || item.icon_url || item.icon)}
                          alt={problem || "Service"}
                          className="w-full h-full object-cover"
                          loading="eager"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/tas.logo.png";
                            target.className = "w-16 h-16 object-contain opacity-60";
                          }}
                        />
                      </div>

                      {cartItem ? (
                        <div className="-mt-4 z-10 bg-white border border-orange-500 text-orange-500 rounded-lg flex items-center shadow-xs px-2.5 py-1 text-sm font-semibold gap-2">
                          <button
                            type="button"
                            onClick={() => removeFromCart(cartItem.id)}
                            className="px-1 text-orange-500 hover:text-orange-600 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-gray-900 dark:text-white font-medium min-w-[14px] text-center text-xs">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddService(item)}
                            className="px-1 text-orange-500 hover:text-orange-600 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddService(item)}
                          className="-mt-4 border z-10 border-orange-500 text-orange-500 px-5 py-1 rounded-lg text-sm font-semibold bg-white shadow-xs hover:bg-orange-50 transition-all cursor-pointer active:scale-95"
                        >
                          Add
                        </button>
                      )}
                    </div>

                    {/* Right Column: Badges, Title, Rating, Duration, Price */}
                    <div className="flex-1 min-w-0">
                      {/* Top badges: Warranty on left, Package Tag & Heart on right */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          onClick={() => {
                            setSelectedWarrantyService(item);
                            setShowWarrantyModal(true);
                          }}
                          className="cursor-pointer text-[11px] sm:text-xs bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-md font-medium hover:bg-orange-200 transition-colors"
                        >
                          {item.warrantyDays || item.warranty_days || 30} Days Warranty
                        </span>

                        <div className="flex items-center gap-2">
                          {item.packageTag && (
                            <span className="text-[11px] bg-green-100 text-green-700 font-semibold px-2.5 py-0.5 rounded-full border border-green-200">
                              {item.packageTag}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(item);
                            }}
                            className="flex-shrink-0 cursor-pointer p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-0 active:scale-90 transition-all select-none"
                            title="Remove from Wishlist"
                          >
                            <Heart className="w-5 h-5 text-red-500 fill-red-500 pointer-events-none" />
                          </button>
                        </div>
                      </div>

                      {/* Title, rating, duration and pricing */}
                      <div className="flex justify-between items-start gap-3 mt-2 sm:flex-row flex-col">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-snug">
                            {problem}
                            {acType && (
                              <span className="text-gray-400 font-normal text-xs sm:text-sm ml-1.5">
                                ({acType})
                              </span>
                            )}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                            <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500 shrink-0" />
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {Number(item.rating || 5.0).toFixed(1)}
                            </span>
                            <span className="text-gray-400">({item.reviews || 0} reviews)</span>
                          </div>

                          <div className="flex items-center gap-1.5 py-1.5 text-gray-600 dark:text-gray-400 text-xs">
                            <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                            <span>{item.duration || item.time || "30 min approx"}</span>
                          </div>
                        </div>

                        {/* Pricing on the right */}
                        <div className="flex flex-col items-start sm:items-end shrink-0 sm:mt-0 mt-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl">
                              ₹{discPrice}
                            </span>
                            {origPrice > discPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{origPrice}
                              </span>
                            )}
                          </div>
                          {discountPercent && (
                            <span className="text-green-600 text-xs font-semibold mt-0.5">
                              {discountPercent}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bullet points description */}
                  {bulletPoints.length > 0 && (
                    <ul className="text-xs text-gray-500 dark:text-gray-400 mt-3.5 space-y-1 pl-1 border-t border-gray-100 dark:border-gray-700/60 pt-3">
                      {bulletPoints.slice(0, 3).map((bp: string, i: number) => (
                        <li key={i} className="line-clamp-1">
                          • {bp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* More Details >> link */}
                <div className="mt-3">
                  <p
                    onClick={() => {
                      setSelectedService({
                        ...item,
                        id: wishId,
                        name: problem,
                        discountedPrice: discPrice,
                        originalPrice: origPrice,
                        subServices: [{ name: acType }],
                      });
                      setShowDetailsModal(true);
                    }}
                    className="text-blue-600 dark:text-blue-400 text-xs cursor-pointer hover:underline font-medium inline-block"
                  >
                    More Details &gt;&gt;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Service Details Modal Popup */}
      <ServiceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedService(null);
        }}
        service={selectedService}
        onAdd={() => {
          if (selectedService) {
            handleAddService(selectedService);
          }
        }}
      />

      {/* Warranty Modal Popup */}
      <WarrantyModal
        open={showWarrantyModal}
        onClose={() => {
          setShowWarrantyModal(false);
          setSelectedWarrantyService(null);
        }}
        service={selectedWarrantyService}
      />
    </div>
  );
}
