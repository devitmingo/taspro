"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Building2,
  Percent,
  ThumbsUp,
  ShieldCheck,
  Check,
  X,
  Lock,
  RotateCcw,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import Swal from "sweetalert2";

export default function CompletePaymentPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useBooking();

  // Active method selection (default: recommended matching Image 1)
  const [selectedMethod, setSelectedMethod] = useState<
    "recommended" | "saved_cards" | "upi" | "card" | "emi" | "netbanking" | "cod"
  >("recommended");

  // Gift Card State
  const [applyGiftCard, setApplyGiftCard] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftCardNumber, setGiftCardNumber] = useState("");
  const [giftCardPin, setGiftCardPin] = useState("");
  const [giftCardBalance, setGiftCardBalance] = useState(996);

  const [loading, setLoading] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(true);
  const [razorpayDismissed, setRazorpayDismissed] = useState(false);

  // Price calculation
  const rawTotalMRP = cartItems.reduce(
    (sum: number, item: any) =>
      sum +
      (item.originalPrice || item.price || item.discountedPrice || 0) *
        (item.quantity || 1),
    0,
  );

  const rawTotalAmount = cartItems.reduce(
    (sum: number, item: any) =>
      sum + (item.price || item.discountedPrice || 0) * (item.quantity || 1),
    0,
  );

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("appliedCoupon");
      if (saved) {
        try {
          setAppliedCoupon(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const totalMRP = Math.round(rawTotalMRP) || 236;
  const totalAmount = Math.round(rawTotalAmount) || 200;
  const totalDiscount = Math.round(totalMRP - totalAmount);
  const couponDiscount = Math.round(appliedCoupon ? appliedCoupon.discount : 0);
  const basePayable = Math.max(totalAmount - couponDiscount, 0);

  // If gift card applied
  const giftDeduction = applyGiftCard ? Math.min(basePayable, giftCardBalance) : 0;
  const payableAmount = Math.max(basePayable - giftDeduction, 0);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createBooking = async (
    paymentMethod: string,
    razorpayPaymentId: string = "",
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        await Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login to complete your booking.",
          confirmButtonColor: "#ff5500",
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("redirectAfterLogin", "/booking-payment");
        }
        window.dispatchEvent(new Event("open-auth-modal"));
        setLoading(false);
        return;
      }

      let bookingDateTime: any = {};
      let selectedAddress: any = {};
      try {
        bookingDateTime = JSON.parse(
          localStorage.getItem("bookingDateTime") || "{}",
        );
      } catch (e) {}
      try {
        selectedAddress = JSON.parse(
          localStorage.getItem("selectedAddress") || "{}",
        );
      } catch (e) {}

      // Fallback address if not saved in local storage
      let addressId = Number(selectedAddress?.id);
      if (!addressId || isNaN(addressId)) {
        try {
          const addrRes = await axios.get(
            `${API_BASE_URL}/customers/customer-addresses`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            },
          );
          if (addrRes.data?.data?.length > 0) {
            addressId = addrRes.data.data[0].id;
          } else {
            addressId = 1;
          }
        } catch (e) {
          addressId = 1;
        }
      }

      let formattedDate = "2026-08-15";
      if (bookingDateTime.date) {
        const parts = bookingDateTime.date.split("-");
        if (parts.length === 3) {
          if (parts[0].length === 2 && parts[2].length === 4) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else {
            formattedDate = bookingDateTime.date;
          }
        }
      }

      const payload = {
        date: formattedDate,
        slot_id: Number(bookingDateTime.slotId || 1),
        customer_notes: bookingDateTime.notes?.trim() || "Urgent doorstep service",
        address_id: addressId,
        payment_type: paymentMethod === "COD" ? "COD" : "ONLINE",
        gst_no: "22AAAAA0000A1Z5",
        pan_no: "ABCDE1234F",
        service_category_id: Number(
          cartItems[0]?.service_category_id ||
            cartItems[0]?.serviceCategoryId ||
            1,
        ),
        service_id: Number(
          cartItems[0]?.service_id || cartItems[0]?.serviceId || 1,
        ),
        razorpay_payment_id: razorpayPaymentId,
        state_name: "Chhattisgarh",
        city_name: "Raipur",
        enquiry_source: "web",
        platform_type: "web",
      };

      const res = await axios.post(
        `${API_BASE_URL}/customers/customer-bookings`,
        payload,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.status) {
        // Booking successful
        const bookingObj = res.data?.data?.booking || res.data?.data;
        const bookingId = bookingObj?.id || res.data?.data?.booking_id || res.data?.data?.id;
        const orderId =
          bookingObj?.booking_no ||
          res.data?.data?.order_id ||
          res.data?.data?.booking_id ||
          `TS${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}A${Math.floor(10000 + Math.random() * 90000)}`;

        const lastBooking = {
          bookingId,
          orderId,
          orderDate: new Date().toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          items: cartItems.length > 0 ? [...cartItems] : [],
          serviceName: cartItems[0]?.serviceName || cartItems[0]?.name || "AC Repair",
          totalMRP,
          totalDiscount,
          couponDiscount,
          finalAmount: payableAmount,
          bookingDateTime,
          selectedAddress,
          paymentMethod,
        };
        try {
          localStorage.setItem("lastConfirmedBooking", JSON.stringify(lastBooking));
        } catch (e) {}

        clearCart();
        localStorage.removeItem("bookingDateTime");
        localStorage.removeItem("selectedAddress");
        localStorage.removeItem("cartItems");

        // Immediately direct to order confirmation with bookingId query param if available
        router.push(bookingId ? `/order-confirmation?booking_id=${bookingId}` : "/order-confirmation");
      } else {
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          text: res.data?.message || "Unable to create booking.",
          confirmButtonColor: "#ff5500",
        });
      }
    } catch (error: any) {
      console.log("BOOKING API ERROR:", error?.response?.data || error);

      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message === "Unauthenticated."
      ) {
        await Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Your session has expired. Please login again.",
          confirmButtonColor: "#ff5500",
        });
        localStorage.removeItem("token");
        if (typeof window !== "undefined") {
          localStorage.setItem("redirectAfterLogin", "/booking-payment");
        }
        window.dispatchEvent(new Event("open-auth-modal"));
        return;
      }

      const apiMsg =
        error?.response?.data?.message ||
        (error?.response?.data?.errors
          ? Object.values(error?.response?.data?.errors).flat().join(" ")
          : null) ||
        error?.message ||
        "Payment processing failed. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: apiMsg,
        confirmButtonColor: "#ff5500",
      });
    } finally {
      setLoading(false);
    }
  };

  // Launch embedded Razorpay directly inside #razorpay-embed-wrapper
  const launchEmbeddedRazorpay = useCallback(async () => {
    if (selectedMethod === "cod") return;

    setRazorpayLoading(true);
    setRazorpayDismissed(false);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || typeof window === "undefined" || !(window as any).Razorpay) {
      setRazorpayLoading(false);
      return;
    }

    const wrapper = document.getElementById("razorpay-embed-wrapper");
    if (!wrapper) {
      setRazorpayLoading(false);
      return;
    }

    // Clean up any old containers
    document.querySelectorAll(".razorpay-container").forEach((el) => {
      el.remove();
    });

    // Setup MutationObserver to intercept .razorpay-container immediately
    const observer = new MutationObserver(() => {
      const rzpContainer = document.querySelector(".razorpay-container") as HTMLElement;
      const targetWrapper = document.getElementById("razorpay-embed-wrapper");

      if (rzpContainer && targetWrapper && rzpContainer.parentElement !== targetWrapper) {
        // Dock inside targetWrapper
        targetWrapper.appendChild(rzpContainer);

        // Apply embedded inline styling
        rzpContainer.style.setProperty("position", "relative", "important");
        rzpContainer.style.setProperty("width", "100%", "important");
        rzpContainer.style.setProperty("height", "550px", "important");
        rzpContainer.style.setProperty("max-width", "100%", "important");
        rzpContainer.style.setProperty("top", "auto", "important");
        rzpContainer.style.setProperty("left", "auto", "important");
        rzpContainer.style.setProperty("z-index", "10", "important");
        rzpContainer.style.setProperty("display", "block", "important");

        // Hide dark overlay backdrop
        const backdrop = rzpContainer.querySelector(".razorpay-backdrop") as HTMLElement;
        if (backdrop) {
          backdrop.style.setProperty("display", "none", "important");
          backdrop.style.setProperty("opacity", "0", "important");
        }

        // Style the iframe inside
        const frame = rzpContainer.querySelector("iframe") as HTMLElement;
        if (frame) {
          frame.style.setProperty("position", "relative", "important");
          frame.style.setProperty("width", "100%", "important");
          frame.style.setProperty("height", "550px", "important");
          frame.style.setProperty("max-width", "100%", "important");
          frame.style.setProperty("top", "auto", "important");
          frame.style.setProperty("left", "auto", "important");
          frame.style.setProperty("border-radius", "16px", "important");
          frame.style.setProperty("box-shadow", "0 4px 20px rgba(0,0,0,0.06)", "important");
        }

        setRazorpayLoading(false);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Open Razorpay instance
    try {
      let userPhone = "7812991993";
      let userName = "Amit Jaiswal";
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        if (u.phone || u.mobile) userPhone = u.phone || u.mobile;
        if (u.name) userName = u.name;
      } catch (e) {}

      const razorKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_Sg3z5bMD2SVDOG";

      const options: any = {
        key: razorKey,
        amount: (payableAmount || 200) * 100,
        currency: "INR",
        name: "TASpro Company",
        description: "Doorstep Service Payment",
        image: "https://files.catbox.moe/l742u1.png",
        prefill: {
          contact: userPhone,
          name: userName,
          email: "support@tascompany.in",
        },
        theme: {
          color: "#ff5500",
        },
        handler: async function (response: any) {
          await createBooking(
            "ONLINE",
            response.razorpay_payment_id || `pay_${Date.now()}`,
          );
        },
        modal: {
          ondismiss: function () {
            setRazorpayDismissed(true);
          },
        },
      };

      const razorpayObj = new (window as any).Razorpay(options);
      razorpayObj.open();
    } catch (err) {
      console.error("Razorpay embedded launch error:", err);
      setRazorpayLoading(false);
    }
  }, [selectedMethod, payableAmount]);

  // Trigger embedded Razorpay when online method is active
  useEffect(() => {
    if (selectedMethod !== "cod") {
      const timer = setTimeout(() => {
        launchEmbeddedRazorpay();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // If COD, hide existing Razorpay container
      const container = document.querySelector(".razorpay-container") as HTMLElement;
      if (container) {
        container.style.display = "none";
      }
    }
  }, [selectedMethod, payableAmount, launchEmbeddedRazorpay]);

  return (
    <div className="w-full pb-10">
      {/* Global CSS to guarantee Razorpay is docked and backdrop is removed */}
      <style>{`
        #razorpay-embed-wrapper .razorpay-container {
          position: relative !important;
          width: 100% !important;
          height: 550px !important;
          max-width: 100% !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 10 !important;
          display: block !important;
        }
        body .razorpay-backdrop,
        #razorpay-embed-wrapper .razorpay-backdrop {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }
        #razorpay-embed-wrapper .razorpay-container iframe {
          position: relative !important;
          width: 100% !important;
          height: 550px !important;
          max-width: 100% !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06) !important;
        }
      `}</style>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-2 sm:py-4 flex-1">
        {/* Top Header: Back Arrow + Complete Payment */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Complete Payment
          </h1>
        </div>

        {/* Top Gift Card Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between mb-6 shadow-2xs transition-all">
          <label className="flex items-center gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={applyGiftCard}
              onChange={(e) => setApplyGiftCard(e.target.checked)}
              className="w-5 h-5 rounded accent-[#0076B6] cursor-pointer"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">Apply Gift Card</p>
              <p className="text-xs text-gray-500 font-medium">
                Available Balance ₹{giftCardBalance}
              </p>
            </div>
          </label>

          <button
            type="button"
            onClick={() => setShowGiftModal(true)}
            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold hover:underline cursor-pointer"
          >
            Add Gift Card
          </button>
        </div>

        {/* Main Payment Section: 2 Columns */}
        <div className="grid md:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Payment Methods List */}
          <div className="md:col-span-6 lg:col-span-5 space-y-3">
            {/* 1. Recommended for You */}
            <div
              onClick={() => setSelectedMethod("recommended")}
              className={`rounded-2xl border p-4 sm:p-4.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "recommended"
                  ? "border-[#0076B6] bg-blue-50/20 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <ThumbsUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Recommended for You
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fast &amp; secure UPI QR &amp; Cards
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "recommended"
                    ? "border-[#0076B6] bg-[#0076B6]"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "recommended" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* 2. Saved Cards */}
            <div
              onClick={() => setSelectedMethod("saved_cards")}
              className={`rounded-2xl border p-4 sm:p-4.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "saved_cards"
                  ? "border-[#0076B6] bg-blue-50/20 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Saved Cards
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fast checkout with saved cards
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "saved_cards"
                    ? "border-[#0076B6] bg-[#0076B6]"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "saved_cards" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* 3. UPI */}
            <div
              onClick={() => setSelectedMethod("upi")}
              className={`rounded-2xl border p-4 sm:p-4.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "upi"
                  ? "border-[#0076B6] bg-blue-50/20 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 font-extrabold text-[11px] text-gray-800 tracking-tighter">
                  UPI
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">UPI</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay by any UPI app / Scan QR
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "upi"
                    ? "border-[#0076B6] bg-[#0076B6]"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "upi" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* 4. Credit / Debit / ATM Card */}
            <div
              onClick={() => setSelectedMethod("card")}
              className={`rounded-2xl border p-4 sm:p-4.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "card"
                  ? "border-[#0076B6] bg-blue-50/20 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Credit / Debit / ATM Card
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add and secure cards as per RBI guidelines
                  </p>
                  <p className="text-[11px] font-semibold text-green-600 mt-1">
                    Save upto ₹3,750 • 9 offers available
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "card"
                    ? "border-[#0076B6] bg-[#0076B6]"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "card" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* 5. EMI */}
            <div
              onClick={() => setSelectedMethod("emi")}
              className={`rounded-2xl border p-4 sm:p-4.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "emi"
                  ? "border-[#0076B6] bg-blue-50/20 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">EMI</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get Debit and Cardless EMIs on HDFC Bank
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "emi"
                    ? "border-[#0076B6] bg-[#0076B6]"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "emi" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* 6. Net Banking */}
            <div
              onClick={() => setSelectedMethod("netbanking")}
              className={`rounded-2xl border p-4 sm:p-4.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "netbanking"
                  ? "border-[#0076B6] bg-blue-50/20 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Net Banking
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    All major Indian banks supported
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "netbanking"
                    ? "border-[#0076B6] bg-[#0076B6]"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "netbanking" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* 7. Cash on Delivery */}
            <div
              onClick={() => setSelectedMethod("cod")}
              className={`rounded-2xl border p-4 sm:p-4.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "cod"
                  ? "border-[#0076B6] bg-blue-50/20 shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Cash on Delivery
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay via cash or UPI after service
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "cod"
                    ? "border-[#0076B6] bg-[#0076B6]"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "cod" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Razorpay Embedded Gateway OR Cash on Delivery */}
          <div className="md:col-span-6 lg:col-span-7">
            {selectedMethod === "cod" ? (
              /* View: Cash on Delivery */
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Cash on Delivery
                    </h3>
                    <p className="text-xs text-gray-500">
                      Pay cash or UPI after service completion
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <span>No advance payment needed to book.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <span>
                      Pay via Cash or scanner UPI directly to our verified technician.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => createBooking("COD")}
                  disabled={loading}
                  className="w-full py-3 bg-[#FF6A00] hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Confirming Booking...</span>
                  ) : (
                    <span>
                      Confirm Booking (₹{payableAmount.toLocaleString("en-IN")})
                    </span>
                  )}
                </button>
              </div>
            ) : (
              /* View: Embedded Razorpay Payment Gateway */
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="text-base font-bold text-gray-900">
                      Pay Online (Razorpay)
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                    256-Bit SSL Secured
                  </span>
                </div>

                {/* Dismissed warning / reload button */}
                {razorpayDismissed && (
                  <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
                    <p className="text-xs text-orange-800 font-medium">
                      Payment was closed. Click to reopen payment gateway.
                    </p>
                    <button
                      onClick={launchEmbeddedRazorpay}
                      className="px-3 py-1.5 bg-[#FF6A00] hover:bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen Gateway</span>
                    </button>
                  </div>
                )}

                {/* The Embedded Container */}
                <div
                  id="razorpay-embed-wrapper"
                  className="w-full min-h-[550px] rounded-xl overflow-hidden relative border border-gray-100 bg-gray-50/50 flex items-center justify-center"
                >
                  {razorpayLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-20">
                      <div className="w-8 h-8 border-3 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-semibold text-gray-500">
                        Loading payment gateway...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trust and Guarantee Badge */}
            <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Lock className="w-4 h-4 text-green-600 shrink-0" />
                <span>100% Safe &amp; Secure Payments with 256-Bit SSL</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-70">
                <img src="/icons/visa.svg" alt="Visa" className="h-4" />
                <img
                  src="/icons/mastercard.svg"
                  alt="Mastercard"
                  className="h-4"
                />
                <img src="/icons/rupay.svg" alt="RuPay" className="h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Gift Card Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowGiftModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Add Gift Card
            </h3>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Gift Card Number (16 Digits)
                </label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={giftCardNumber}
                  onChange={(e) =>
                    setGiftCardNumber(
                      e.target.value
                        .replace(/\D/g, "")
                        .replace(/(\d{4})(?=\d)/g, "$1 "),
                    )
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  6-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={giftCardPin}
                  onChange={(e) =>
                    setGiftCardPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 font-medium tracking-widest"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (
                  giftCardNumber.replace(/\s/g, "").length === 16 &&
                  giftCardPin.length === 6
                ) {
                  setGiftCardBalance((prev) => prev + 500);
                  setApplyGiftCard(true);
                  setShowGiftModal(false);
                  Swal.fire({
                    icon: "success",
                    title: "Gift Card Added!",
                    text: "₹500 added to your available gift card balance.",
                    timer: 1500,
                    showConfirmButton: false,
                  });
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "Invalid Details",
                    text: "Please enter valid 16-digit card number and 6-digit PIN.",
                    confirmButtonColor: "#ff5500",
                  });
                }
              }}
              className="w-full py-2.5 bg-[#FF6A00] hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
            >
              Apply Gift Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
