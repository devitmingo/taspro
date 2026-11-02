"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { TermsConditionsModal } from "@/components/TermsConditionsModal";
import {
  Trash2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  Heart,
  Lock,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { SelectDateTimeModal } from "@/components/booking-flow/SelectDateTimeModal";
import { SelectAddressModal } from "@/components/booking-flow/SelectAddressModal";
import AddNewAddressModal from "@/components/AddNewAddressModal";
import YouMayLikeServices from "@/components/YouMayLikeServices";
import ServiceDetailsModal from "@/components/ServiceDetailsModal";
import WarrantyModal from "@/components/WarrantyModal";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import Image from "next/image";
import Swal from "sweetalert2";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isLogged = mounted && Boolean(user || token);

  const {
    cartItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    selectedAddress,
    setSelectedAddress,
  } = useBooking();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showAddNewAddressModal, setShowAddNewAddressModal] = useState(false);
  const [showTCModal, setShowTCModal] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [isBookingFlow, setIsBookingFlow] = useState(false);

  // Review Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailService, setSelectedDetailService] = useState<any>(null);

  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [selectedWarrantyService, setSelectedWarrantyService] = useState<any>(null);

  // Wishlist state & sync
  const inFlightWishlistRef = useRef<Set<number>>(new Set());
  const [wishlistItems, setWishlistItems] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("wishlistItems");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    const handleWishlistUpdated = () => {
      try {
        const saved = localStorage.getItem("wishlistItems");
        if (saved) {
          setWishlistItems(JSON.parse(saved));
        }
      } catch (err) {}
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
  }, []);

  const handleWishlist = async (serviceIssueId: number | string) => {
    const id = Number(serviceIssueId);
    if (!id) return;

    const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) {
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }

    if (inFlightWishlistRef.current.has(id)) return;
    inFlightWishlistRef.current.add(id);

    let wasWishlisted = false;
    setWishlistItems((prev) => {
      wasWishlisted = prev.includes(id);
      const next = wasWishlisted ? prev.filter((itemId) => itemId !== id) : [...prev, id];
      try {
        localStorage.setItem("wishlistItems", JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      const res = await fetch(`${API_BASE_URL}/customers/wish-lists/${id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await res.json();
      if (!data?.status) {
        setWishlistItems((prev) => {
          const next = wasWishlisted
            ? (prev.includes(id) ? prev : [...prev, id])
            : prev.filter((itemId) => itemId !== id);
          try {
            localStorage.setItem("wishlistItems", JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      } else {
        window.dispatchEvent(
          new CustomEvent("wishlistUpdated", {
            detail: { id, source: "cart-page" },
          })
        );
      }
    } catch (error) {
      setWishlistItems((prev) => {
        const next = wasWishlisted
          ? (prev.includes(id) ? prev : [...prev, id])
          : prev.filter((itemId) => itemId !== id);
        try {
          localStorage.setItem("wishlistItems", JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    } finally {
      inFlightWishlistRef.current.delete(id);
    }
  };

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const [selectedLoc, setSelectedLoc] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedLoc = localStorage.getItem("selected_location");
        if (savedLoc) {
          const parsed = JSON.parse(savedLoc);
          return {
            state: parsed.state || "Chhattisgarh",
            city: parsed.city || "Durg",
          };
        }
      } catch (e) {}
    }
    return { state: "Chhattisgarh", city: "Durg" };
  });

  const [locationPrices, setLocationPrices] = useState<Record<string, { price: number; originalPrice: number }>>({});
  const [serviceDetailsMap, setServiceDetailsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const handleLocChange = (e: any) => {
      if (e.detail) {
        setSelectedLoc({
          state: e.detail.state || "Chhattisgarh",
          city: e.detail.city || "Durg",
        });
        router.push("/");
      }
    };

    window.addEventListener("location-changed", handleLocChange);
    return () => window.removeEventListener("location-changed", handleLocChange);
  }, [router]);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    const fetchLocationPrices = async () => {
      try {
        const priceMap: Record<string, { price: number; originalPrice: number }> = {};
        const detailsMap: Record<string, any> = {};
        const serviceId = cartItems[0]?.service_id || cartItems[0]?.serviceId || 1;

        const res = await axios.get(
          `${API_BASE_URL}/service?service_id=${serviceId}&state_name=${encodeURIComponent(selectedLoc.state)}&city_name=${encodeURIComponent(selectedLoc.city)}`
        );

        const subCats = res.data?.data?.sub_categories || res.data?.data?.subServices || [];
        const issues = res.data?.data?.issues || [];
        const allItems: any[] = [
          ...issues,
          ...subCats.flatMap((sc: any) => sc.items || []),
        ];

        if (res.data?.status && allItems.length > 0) {
          allItems.forEach((item: any) => {
            if (!item || !item.id) return;
            const itemPrice = Math.round(
              Number((item.price && Number(item.price) > 0) ? item.price : (item.final_price || item.base_price || item.discount_price || 0))
            );
            const itemStrike = Math.round(
              Number(item.strike_price || item.original_price || item.originalPrice || item.base_price || 0)
            );
            priceMap[String(item.id)] = {
              price: itemPrice,
              originalPrice: itemStrike > itemPrice ? itemStrike : Math.round(itemPrice * 1.25),
            };
            detailsMap[String(item.id)] = item;
          });
          setLocationPrices(priceMap);
          setServiceDetailsMap(detailsMap);
        }
      } catch (err) {
        console.log("Cart location price fetch error:", err);
      }
    };

    fetchLocationPrices();
  }, [cartItems, selectedLoc]);

  const safeImage = (img?: string | null) => {
    return getImageUrl(img, "/tas.logo.png");
  };

  const getItemActivePrices = (item: any) => {
    const locPrice = locationPrices[String(item.id)];
    if (locPrice) {
      return locPrice;
    }
    const price = Math.round(Number(item.price || item.discountedPrice || 0));
    const originalPrice = Math.round(Number(item.originalPrice || item.price || 0));
    return {
      price,
      originalPrice: originalPrice > price ? originalPrice : Math.round(price * 1.25),
    };
  };

  const getEnrichedItem = (item: any) => {
    const details = serviceDetailsMap[String(item.id)] || {};
    const { price, originalPrice } = getItemActivePrices(item);

    const rawShort =
      details.short_points ||
      details.issue_descriptions?.short_points ||
      item.short_points ||
      item.issueDescriptions?.short_points;

    return {
      ...item,
      ...details,
      id: item.id,
      name: item.name || details.name || item.title || "Service",
      title: item.name || details.name || item.title || "Service",
      price,
      discountedPrice: price,
      originalPrice,
      quantity: item.quantity || 1,
      image: item.image || getImageUrl(details.icon_url || details.icon, "/tas.logo.png"),
      rating: Number(details.rating || item.rating || 5.0),
      reviews: Number(details.reviews || item.reviews || 0),
      duration: details.duration_minutes
        ? `${details.duration_minutes} min approx`
        : (item.duration || "30 min approx"),
      warrantyDays:
        details.warranty_days ??
        item.warrantyDays ??
        item.warranty_days ??
        30,
      warrantyTitle:
        details.warranty_title ||
        item.warrantyTitle ||
        item.warranty_title ||
        "30 Days Free Service Warranty",
      warrantyDescription:
        details.warranty_description ||
        item.warrantyDescription ||
        item.warranty_description ||
        details.issue_more_details?.warranty_description,
      packageTag:
        details.package_tag ||
        item.packageTag ||
        item.package_tag ||
        "Quick Service",
      short_points: rawShort,
      issueDescriptions:
        details.issue_descriptions ||
        details.descriptions ||
        item.issueDescriptions,
      issueMoreDetails:
        details.issue_more_details ||
        details.details ||
        item.issueMoreDetails,
      workflows: details.workflows || item.workflows,
    };
  };

  const getBulletPoints = (item: any) => {
    const raw = item.short_points;
    if (raw && typeof raw === "string") {
      const cleaned = raw
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
        .filter((l) => l.length > 0);
      if (lines.length > 0) return lines.slice(0, 3);
    }

    return [
      "Get 2X deeper dust removal with Foam + PowerJet technology",
      "Intense cleaning of both indoor & outdoor units",
    ];
  };

  const rawTotalMRP = cartItems.reduce(
    (sum: number, item: any) =>
      sum + getItemActivePrices(item).originalPrice * (item.quantity || 1),
    0,
  );

  const rawTotalAmount = cartItems.reduce(
    (sum: number, item: any) =>
      sum + getItemActivePrices(item).price * (item.quantity || 1),
    0,
  );

  const totalMRP = Math.round(rawTotalMRP);
  const totalAmount = Math.round(rawTotalAmount);
  const totalDiscount = Math.round(Math.max(totalMRP - totalAmount, 0));
  const couponDiscount = Math.round(appliedCoupon ? appliedCoupon.discount : 0);
  const finalAmount = Math.round(Math.max(totalAmount - couponDiscount, 0));

  const totalItemCount = cartItems.reduce(
    (sum: number, item: any) => sum + (item.quantity || 1),
    0,
  );

  const totalSavings = Math.round(Math.max(totalDiscount + couponDiscount, 0));

  const displayAddress = isLogged ? (selectedAddress || addresses[0]) : null;

  const AVAILABLE_COUPONS = [
    {
      code: "TASPRO50",
      title: "Flat ₹50 Instant Discount",
      text: "Get flat ₹50 off on your booking",
      discountType: "flat",
      amount: 50,
      minCart: 100,
    },
    {
      code: "WELCOME15",
      title: "15% off up to ₹100",
      text: "Save 15% on home services",
      discountType: "percent",
      amount: 15,
      maxDiscount: 100,
      minCart: 200,
    },
    {
      code: "KOTAK250",
      title: "15% off on Kotak Cards",
      text: "15% off up to ₹250",
      discountType: "percent",
      amount: 15,
      maxDiscount: 250,
      minCart: 300,
    },
  ];

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");

    if (!code) {
      setCouponError("Please enter a valid coupon code.");
      return;
    }

    const found = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (!found) {
      setCouponError("Invalid Coupon Code. Try TASPRO50 or WELCOME15");
      Swal.fire({
        icon: "error",
        title: "Invalid Coupon",
        text: "The coupon code entered is invalid or expired.",
        confirmButtonColor: "#FF6A00",
      });
      return;
    }

    if (totalAmount < found.minCart) {
      const msg = `Minimum cart amount of ₹${found.minCart} required for ${found.code}.`;
      setCouponError(msg);
      Swal.fire({
        icon: "warning",
        title: "Cart Amount Low",
        text: msg,
        confirmButtonColor: "#FF6A00",
      });
      return;
    }

    let discount = 0;
    if (found.discountType === "flat") {
      discount = found.amount;
    } else if (found.discountType === "percent") {
      discount = Math.min((totalAmount * found.amount) / 100, found.maxDiscount || 9999);
    }

    discount = Math.round(discount);

    const couponObj = { code: found.code, discount };
    setAppliedCoupon(couponObj);
    localStorage.setItem("appliedCoupon", JSON.stringify(couponObj));
    setCouponInput("");

    Swal.fire({
      icon: "success",
      title: "Coupon Applied!",
      text: `You saved ₹${discount} with coupon ${found.code}!`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("appliedCoupon");
    setCouponError("");
  };

  const getCustomerAddresses = async (token: string) => {
    const res = await axios.get(
      `${API_BASE_URL}/customers/customer-addresses`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    return res.data;
  };

  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await getCustomerAddresses(token);
      setAddresses(res.data || []);
    } catch (error) {
      console.log("ADDRESS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchAddresses();

    const handleUserLoggedIn = () => {
      fetchAddresses();
    };
    window.addEventListener("user-logged-in", handleUserLoggedIn);
    return () => window.removeEventListener("user-logged-in", handleUserLoggedIn);
  }, [user]);

  const updateQuantity = (item: any, type: "increase" | "decrease") => {
    if (type === "increase") {
      addToCart({ ...item, quantity: 1 });
    } else {
      removeFromCart(item.id);
    }
  };

  const addCustomerAddress = async (token: string, formData: any) => {
    const cleanPhone = (value: string) => {
      const digits = value
        .replace(/\D/g, "")
        .replace(/^91/, "")
        .replace(/^0/, "");
      return `+91 ${digits}`;
    };

    const payload: any = {
      full_name: formData.fullName || formData.name || "",
      contact_number: cleanPhone(
        formData.contactNumber || formData.phone || "",
      ),
      postal_code: formData.postalCode || "",
      latitude: formData.latitude || 21.2514,
      longitude: formData.longitude || 81.6296,
      state_id: 1,
      city_id: 1,
      state_name: formData.state_name || formData.state || "",
      city_name: formData.city_name || formData.city || "",
      house_number: formData.houseNumber || formData.flat || "",
      street: formData.street || formData.area || "",
      landmark: formData.landmark || "",
      type: formData.type || "Home",
      is_default: formData.is_default || 0,
    };

    const res = await axios.post(
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

    return res.data;
  };

  const updateCustomerAddress = async (
    token: string,
    id: number,
    formData: any,
  ) => {
    const cleanPhone = (value: string) => {
      const digits = value
        .replace(/\D/g, "")
        .replace(/^91/, "")
        .replace(/^0/, "");
      return `+91 ${digits}`;
    };

    const payload: any = {
      full_name: formData.fullName || formData.name || "",
      contact_number: cleanPhone(
        formData.contactNumber || formData.phone || "",
      ),
      postal_code: formData.postalCode || "",
      latitude: formData.latitude || 21.2514,
      longitude: formData.longitude || 81.6296,
      state_id: 1,
      city_id: 1,
      state_name: formData.state_name || formData.state || "",
      city_name: formData.city_name || formData.city || "",
      house_number: formData.houseNumber || formData.flat || "",
      street: formData.street || formData.area || "",
      landmark: formData.landmark || "",
      type: formData.type || "Home",
      is_default: formData.is_default || 0,
    };

    const res = await axios.put(
      `${API_BASE_URL}/customers/customer-addresses/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  };

  const createCustomerCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/cart");
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }

    if (!selectedAddress) {
      setIsBookingFlow(true);
      setShowAddressModal(true);
      return;
    }

    if (!cartItems.length) {
      await Swal.fire({
        icon: "warning",
        title: "Cart Empty",
        text: "Please add at least one service to continue.",
        confirmButtonColor: "#ff5500",
      });
      return;
    }

    try {
      setCartLoading(true);

      const payload = {
        service_category_id: Number(
          cartItems[0]?.service_category_id ||
            cartItems[0]?.serviceCategoryId ||
            1,
        ),
        service_id: Number(
          cartItems[0]?.service_id || cartItems[0]?.serviceId || 1,
        ),
        carts: cartItems.map((item: any) => ({
          service_sub_category_id: Number(
            item.service_sub_category_id ||
              item.serviceSubCategoryId ||
              item.sub_category_id ||
              1,
          ),
          service_issue_id: Number(item.service_issue_id || item.id),
          quantity: Number(item.quantity || 1),
        })),
      };

      const res = await axios.post(
        `${API_BASE_URL}/customers/customer-carts?state_id=1&city_id=1&state_name=Chhattisgarh&city_name=Raipur`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Cart Created:", res.data);
      setShowDateTimeModal(true);
    } catch (error: any) {
      console.log("CART API ERROR:", error?.response?.data || error);

      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message === "Unauthenticated."
      ) {
        await Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Please login again.",
          confirmButtonColor: "#ff5500",
        });

        localStorage.removeItem("token");
        if (typeof window !== "undefined") {
          localStorage.setItem("redirectAfterLogin", "/cart");
        }
        window.dispatchEvent(new Event("open-auth-modal"));
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error?.response?.data?.message ||
          "Unable to create cart. Please try again.",
        confirmButtonColor: "#ff5500",
      });
    } finally {
      setCartLoading(false);
    }
  };

  const handleDateTimeContinue = (
    date: string,
    time: string,
    notes: string,
    slotId?: number,
  ) => {
    localStorage.setItem(
      "bookingDateTime",
      JSON.stringify({ date, time, notes, slotId }),
    );

    setShowDateTimeModal(false);
    router.push("/booking-payment");
  };

  return (
    <>
      <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 pb-16 pt-2 sm:pt-4">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="hidden md:block text-2xl font-black text-gray-900 dark:text-white">
              Cart Summary
            </h1>

            <div className="relative w-full flex items-center justify-center md:hidden py-1">
              <button
                onClick={() => router.back()}
                className="absolute left-0 text-black dark:text-white hover:text-[#ff5500] transition"
              >
                <ArrowLeft size={20} />
              </button>

              <h1 className="text-base font-bold text-black dark:text-white">
                Cart Summary
              </h1>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Customer Address & Order Summary */}
            <div className="lg:col-span-2 space-y-6 self-start">
              
              {/* Customer Details Box */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900">
                    Customer Details
                  </h2>
                  {isLogged ? (
                    <button
                      onClick={() => {
                        setIsBookingFlow(false);
                        setShowAddressModal(true);
                      }}
                      className="border border-[#ff5500] text-[#ff5500] px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-orange-50 transition-colors"
                    >
                      {displayAddress ? "Change Address" : "Add Address"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.setItem("redirectAfterLogin", "/cart");
                        }
                        window.dispatchEvent(new Event("open-auth-modal"));
                      }}
                      className="bg-[#ff5500] hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      Login / Sign In
                    </button>
                  )}
                </div>

                <div>
                  {isLogged && displayAddress ? (
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {displayAddress.full_name || (user as any)?.name || "Customer Name"}
                        <span className="ml-2 text-[11px] bg-orange-100 text-[#ff5500] font-semibold px-2 py-0.5 rounded-full">
                          {displayAddress.type || "Home"}
                        </span>
                      </p>

                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed max-w-lg">
                        {displayAddress.house_number}, {displayAddress.street}
                        , {displayAddress.city?.name || displayAddress.city_name || "Raipur"}{" "}
                        {displayAddress.postal_code}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {displayAddress.contact_number || user?.phone}
                      </p>
                    </div>
                  ) : isLogged ? (
                    <div>
                      <p className="text-xs text-gray-500">
                        No saved address found. Click "Add Address" to continue your booking.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        Please login to view saved address
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Log in to auto-populate your saved service address.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary: Complete Service Review Cards */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Order Summary
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Review complete service details and warranty before placing order
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-orange-50 text-[#ff5500] border border-orange-200 px-3 py-1 rounded-full">
                    {cartItems.length} {cartItems.length === 1 ? "Service" : "Services"}
                  </span>
                </div>

                <div className="space-y-5">
                  {cartItems?.length > 0 ? (
                    cartItems.map((rawItem: any) => {
                      const item = getEnrichedItem(rawItem);
                      const qty = item.quantity || 1;
                      const { price, originalPrice } = getItemActivePrices(item);
                      const bulletPoints = getBulletPoints(item);
                      const isWishlisted = wishlistItems.includes(Number(item.id));

                      const calcOff =
                        originalPrice && price && originalPrice > price
                          ? Math.round(((originalPrice - price) / originalPrice) * 100)
                          : null;

                      return (
                        <div
                          key={item.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 bg-white shadow-xs hover:border-gray-300 transition-all"
                        >
                          <div className="flex gap-4 sm:gap-5">
                            {/* Service Image + Quantity Stepper */}
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
                                <img
                                  src={safeImage(item.image)}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Quantity Counter */}
                              <div className="flex items-center -mt-4 border z-10 border-[#ff5500] rounded-full px-3 py-1 bg-white shadow-sm gap-3">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item, "decrease")}
                                  className="text-[#ff5500] font-black text-sm hover:scale-110 transition-transform px-1 cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="text-xs font-black text-gray-900 min-w-[14px] text-center">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item, "increase")}
                                  className="text-[#ff5500] font-black text-sm hover:scale-110 transition-transform px-1 cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Service Details on Right */}
                            <div className="flex-1 min-w-0">
                              {/* Top Badges Row */}
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  onClick={() => {
                                    setSelectedWarrantyService(item);
                                    setShowWarrantyModal(true);
                                  }}
                                  className="cursor-pointer text-xs bg-orange-100 text-[#ff5500] font-medium px-2.5 py-0.5 rounded-md hover:bg-orange-200 transition-colors"
                                  title="Click to view warranty terms"
                                >
                                  {item.warrantyDays || 30} Days Warranty
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
                                      handleWishlist(item.id);
                                    }}
                                    className="cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                  >
                                    <Heart
                                      className={`w-5 h-5 transition-colors ${
                                        isWishlisted
                                          ? "text-red-500 fill-red-500"
                                          : "text-red-500 fill-red-500"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>

                              {/* Title & Rating & Duration + Pricing */}
                              <div className="flex justify-between items-start gap-2 mt-2">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                                    {item.name}
                                  </h4>

                                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                                      <span className="font-semibold text-gray-800">
                                        {typeof item.rating === "number"
                                          ? item.rating.toFixed(1)
                                          : "5.0"}
                                      </span>
                                    </div>
                                    <span className="text-gray-400">
                                      ({item.reviews || 0} reviews)
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                                    <span>{item.duration || "30 min approx"}</span>
                                  </div>
                                </div>

                                {/* Price Column */}
                                <div className="flex flex-col items-end shrink-0">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="font-extrabold text-gray-900 text-base sm:text-lg">
                                      ₹{price * qty}
                                    </span>
                                    {originalPrice > price && (
                                      <span className="text-xs text-gray-400 line-through font-normal">
                                        ₹{originalPrice * qty}
                                      </span>
                                    )}
                                  </div>

                                  {calcOff && (
                                    <span className="text-green-600 text-xs font-bold mt-0.5">
                                      {calcOff}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bullet Points */}
                          <div className="mt-3.5 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                            {bulletPoints.map((pt, i) => (
                              <p key={i} className="flex items-start gap-1.5">
                                <span className="text-gray-400">•</span>
                                <span>{pt}</span>
                              </p>
                            ))}
                          </div>

                          {/* More Details >> Link */}
                          <div className="flex justify-between items-center mt-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDetailService(item);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 font-semibold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              More Details {">>"}
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Delete all of this service from cart"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                      <img src="/tas.logo.png" alt="TASpro" className="w-14 h-14 mx-auto mb-3 opacity-60" />
                      <h3 className="font-bold text-gray-800 text-base mb-1">Your cart is empty</h3>
                      <p className="text-xs text-gray-500 mb-4">Add services from our catalog to book your service</p>
                      <button
                        onClick={() => router.push("/")}
                        className="px-5 py-2 rounded-xl bg-[#ff5500] text-white font-bold text-xs hover:bg-orange-600 transition"
                      >
                        Explore Services
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Coupons & Payment Summary */}
            <div className="lg:col-span-1 gap-5 flex flex-col sticky top-6">
              
              {/* Coupons & Offers Accordion */}
              <div className="border border-orange-500 rounded-2xl px-4 py-3.5 bg-orange-50/20 shadow-xs">
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="w-full flex items-center justify-between cursor-pointer"
                >
                  <div className="flex gap-3 items-center">
                    <img src="/coupon.png" alt="coupon" className="w-7 h-7 object-contain" />
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-bold text-gray-900">
                        Coupons & Offers
                      </p>
                      <p className="text-xs text-gray-500">
                        {appliedCoupon
                          ? `Applied: ${appliedCoupon.code} (-₹${appliedCoupon.discount})`
                          : "Apply valid coupon for instant discount"}
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      showCoupons ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCoupons && (
                  <div className="mt-4 pt-3 border-t border-orange-200 space-y-4">
                    {appliedCoupon ? (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-green-700">
                            🎉 Coupon '{appliedCoupon.code}' Applied!
                          </p>
                          <p className="text-[11px] text-green-600">
                            You saved ₹{appliedCoupon.discount} on this booking
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-xs font-bold text-red-600 hover:underline px-2 py-1 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="Enter Coupon Code"
                            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#FF6A00] uppercase font-bold"
                          />
                          <button
                            onClick={() => handleApplyCoupon()}
                            className="px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] text-red-500 mt-1 font-medium">{couponError}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2.5 pt-2 max-h-64 overflow-y-auto pr-1">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 bg-orange-50/90 backdrop-blur-xs py-1 z-10">
                        Available Coupons
                      </p>
                      {AVAILABLE_COUPONS.map((c) => (
                        <div
                          key={c.code}
                          className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#FF6A00] bg-orange-100 px-2 py-0.5 rounded">
                                {c.code}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-800 mt-1">{c.title}</p>
                            <p className="text-[11px] text-gray-500">{c.text}</p>
                          </div>

                          <button
                            onClick={() => handleApplyCoupon(c.code)}
                            disabled={appliedCoupon?.code === c.code}
                            className="text-xs font-bold text-[#FF6A00] border border-[#FF6A00] px-3 py-1 rounded-lg hover:bg-orange-50 disabled:opacity-40 cursor-pointer"
                          >
                            {appliedCoupon?.code === c.code ? "Applied" : "Apply"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PAYMENT SUMMARY CARD (Exact Image Design) */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
                
                {/* Header */}
                <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl border-2 border-[#ff5500] flex items-center justify-center text-[#ff5500] shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="8" x2="19" y2="8" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <line x1="5" y1="16" x2="19" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0b1a30] leading-tight">
                      Payment Summary
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Review your order details before placing the order.
                    </p>
                  </div>
                </div>

                {/* Line Items - Each row has borders */}
                <div>
                  {/* Total Item */}
                  <div className="flex justify-between items-start py-3.5 border-b border-gray-100">
                    <div>
                      <p className="text-sm sm:text-base font-bold text-[#0b1a30]">
                        Total Item ({totalItemCount})
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-normal">
                        (Inclusive of all taxes)
                      </p>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-[#0b1a30]">
                      ₹{totalMRP.toLocaleString()}
                    </p>
                  </div>

                  {/* Item Discount */}
                  <div className="flex justify-between items-center py-3.5 border-b border-gray-100">
                    <p className="text-sm sm:text-base font-semibold text-[#0b1a30]">Item Discount</p>
                    <p className="text-sm sm:text-base font-bold text-[#059669]">
                      -₹{totalDiscount.toLocaleString()}
                    </p>
                  </div>

                  {/* Coupon Discount */}
                  <div className="flex justify-between items-center py-3.5 border-b border-gray-100">
                    <p className="text-sm sm:text-base font-semibold text-[#0b1a30]">
                      Coupon Discount {appliedCoupon ? `(${appliedCoupon.code})` : ""}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[#059669]">
                      {couponDiscount > 0 ? `-₹${couponDiscount.toLocaleString()}` : "-₹0"}
                    </p>
                  </div>
                </div>

                {/* Total Amount in Rounded Shaded Box */}
                <div className="bg-[#f4f6f8] rounded-xl px-4 py-3.5 my-3 flex justify-between items-center">
                  <p className="text-base sm:text-lg font-bold text-[#0b1a30]">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-black text-[#0b1a30]">
                    ₹{finalAmount.toLocaleString()}
                  </p>
                </div>

                {/* Green Savings Banner */}
                {totalSavings > 0 && (
                  <div className="bg-[#edf8f3] border border-[#d2efe0] rounded-xl p-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#009b55] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      ₹
                    </div>
                    <div className="w-[1px] h-5 bg-emerald-200 shrink-0"></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-800">
                      You are saving <span className="text-[#009b55] font-bold">₹{totalSavings.toLocaleString()}</span> on this order
                    </p>
                  </div>
                )}

                {/* Main CTA: Place Order */}
                <button
                  onClick={createCustomerCart}
                  disabled={cartLoading || cartItems.length === 0}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#ff5500] hover:bg-[#e64d00] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cartLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Safe & Secure Checkout + Payment Logos */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-gray-600">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Lock className="w-3.5 h-3.5 text-gray-500" />
                    <span>Safe & secure checkout</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* VISA */}
                    <div className="h-6 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-2xs">
                      <span className="text-[#1a1f71] font-black text-[11px] italic tracking-wider">VISA</span>
                    </div>
                    {/* Mastercard */}
                    <div className="h-6 px-1.5 bg-white border border-gray-200 rounded flex items-center justify-center shadow-2xs">
                      <div className="flex items-center -space-x-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#eb001b]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] opacity-90" />
                      </div>
                    </div>
                    {/* RuPay */}
                    <div className="h-6 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-2xs">
                      <span className="text-[#0971b8] font-black text-[10px] italic">
                        RuPay<span className="text-[#00923f]">❯</span>
                      </span>
                    </div>
                    {/* UPI */}
                    <div className="h-6 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-2xs">
                      <span className="text-[#1e1e1e] font-black text-[10px] tracking-tighter">
                        UPI<span className="text-[#00923f] text-[8px]">▶</span>
                      </span>
                    </div>
                    {/* Paytm */}
                    <div className="h-6 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-2xs">
                      <span className="text-[#002e6e] font-bold text-[10px]">
                        pay<span className="text-[#00b9f5] font-black">tm</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visit Charge Alert Banner */}
                <div className="bg-[#fff8f0] border border-[#ffeedd] rounded-xl p-3 sm:p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-[#ff5500] text-[#ff5500] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    i
                  </div>
                  <div className="w-[1px] h-8 bg-orange-200 shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    If the service is not available at the time of visit,{" "}
                    <span className="text-[#ff5500] font-bold">₹150 visit charge</span> will be applicable.
                  </p>
                </div>

                {/* Trust Guarantee Columns */}
                <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ff5500] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-800 leading-tight">
                      Easy<br />Cancellation
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ff5500] shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-800 leading-tight">
                      Dedicated<br />Support
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ff5500] shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-800 leading-tight">
                      Background<br />Verified Pros
                    </p>
                  </div>
                </div>

              </div>

              {/* Mobile Sticky Bottom Floating Bar */}
              <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t shadow-2xl border-gray-200 px-4 py-3 z-30">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-gray-900">
                        ₹{finalAmount}
                      </span>
                      {totalMRP > finalAmount && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{totalMRP}
                        </span>
                      )}
                    </div>
                    {totalSavings > 0 && (
                      <p className="text-[10px] text-green-600 font-bold">
                        Save ₹{totalSavings}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={createCustomerCart}
                    disabled={cartLoading || cartItems.length === 0}
                    className="py-2.5 px-6 rounded-xl bg-[#ff5500] text-white font-bold text-sm shadow-md flex items-center gap-1.5"
                  >
                    <span>{cartLoading ? "Loading..." : "Place Order"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>

        <YouMayLikeServices
          title="Frequently Added Together"
          categoryId={cartItems[0]?.service_category_id || cartItems[0]?.serviceCategoryId || 1}
          serviceId={cartItems[0]?.service_id || cartItems[0]?.serviceId}
        />

        {/* Address Selection Modal */}
        <SelectAddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          addresses={addresses}
          onContinue={(address) => {
            setSelectedAddress(address);
            localStorage.setItem("selectedAddress", JSON.stringify(address));
            setShowAddressModal(false);

            if (isBookingFlow) {
              setShowTCModal(true);
            }
          }}
          onAddNew={() => {
            setEditingAddress(null);
            setShowAddressModal(false);
            setShowAddNewAddressModal(true);
          }}
          onEdit={(address) => {
            setEditingAddress(address);
            setShowAddressModal(false);
            setShowAddNewAddressModal(true);
          }}
          onDelete={async (deletedId) => {
            await fetchAddresses();
            if (String(selectedAddress?.id) === String(deletedId)) {
              setSelectedAddress(null);
              localStorage.removeItem("selectedAddress");
            }
          }}
          onRefresh={fetchAddresses}
        />

        {/* Date Time Selection Modal */}
        <SelectDateTimeModal
          isOpen={showDateTimeModal}
          onClose={() => setShowDateTimeModal(false)}
          onContinue={handleDateTimeContinue}
          serviceId={
            cartItems?.[0]?.service_id || cartItems?.[0]?.serviceId || 1
          }
        />

        {/* Add/Edit Address Modal */}
        <AddNewAddressModal
          isOpen={showAddNewAddressModal}
          initialData={editingAddress}
          onClose={() => {
            setShowAddNewAddressModal(false);
            setEditingAddress(null);
            setShowAddressModal(true);
          }}
          onSave={async (formData) => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
              if (editingAddress?.id) {
                await updateCustomerAddress(token, editingAddress.id, formData);
                await Swal.fire({
                  icon: "success",
                  title: "Address Updated!",
                  text: "Your address has been updated successfully.",
                  timer: 1500,
                  showConfirmButton: false,
                });
              } else {
                await addCustomerAddress(token, formData);
                await Swal.fire({
                  icon: "success",
                  title: "Address Saved!",
                  text: "Your address has been added successfully.",
                  timer: 1500,
                  showConfirmButton: false,
                });
              }

              await fetchAddresses();
              setShowAddNewAddressModal(false);
              setEditingAddress(null);
              setShowAddressModal(true);
            } catch (error: any) {
              console.log("VALIDATION ERROR:", error.response?.data || error);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.message || "Failed to save address.",
                confirmButtonColor: "#ff5500",
              });
            }
          }}
        />

        {/* Terms & Conditions Modal */}
        <TermsConditionsModal
          isOpen={showTCModal}
          onClose={() => setShowTCModal(false)}
          onConfirm={() => router.push("/booking-payment")}
        />

        {/* Complete Service Review Modal */}
        <ServiceDetailsModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDetailService(null);
          }}
          service={selectedDetailService}
          onAdd={() => {
            if (selectedDetailService) {
              addToCart(selectedDetailService);
            }
          }}
        />

        {/* Warranty Details Modal */}
        <WarrantyModal
          open={showWarrantyModal}
          onClose={() => {
            setShowWarrantyModal(false);
            setSelectedWarrantyService(null);
          }}
          service={selectedWarrantyService}
        />
      </div>
    </>
  );
}
