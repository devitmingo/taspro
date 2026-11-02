"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Building2,
  Percent,
  ShieldCheck,
  Check,
  X,
  Lock,
  HelpCircle,
  ChevronRight,
  QrCode,
  Smartphone,
  Search,
  Wallet,
  Clock,
  Sparkles,
  Shield,
  CircleDot,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import Swal from "sweetalert2";

export default function CompletePaymentPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useBooking();

  // Active payment method (matching Image 1 options)
  const [selectedMethod, setSelectedMethod] = useState<
    "upi" | "card" | "emi" | "netbanking" | "wallet" | "paylater" | "cod"
  >("upi");

  // User details
  const [customerPhone, setCustomerPhone] = useState("+91 78129 91993");
  const [customerName, setCustomerName] = useState("Amit Jaiswal");

  // Gift Card State
  const [applyGiftCard, setApplyGiftCard] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftCardNumber, setGiftCardNumber] = useState("");
  const [giftCardPin, setGiftCardPin] = useState("");
  const [giftCardBalance, setGiftCardBalance] = useState(996);

  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [showCvvHelp, setShowCvvHelp] = useState(false);

  // UPI states
  const [upiMode, setUpiMode] = useState<"qr" | "apps" | "id">("qr");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [customUpiId, setCustomUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);

  // Net banking state
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState("ICIC");

  // EMI state
  const [selectedEmiBank, setSelectedEmiBank] = useState("hdfc");
  const [selectedEmiTenure, setSelectedEmiTenure] = useState("3");

  // Wallet & PayLater state
  const [selectedWallet, setSelectedWallet] = useState("paytm");
  const [selectedPayLater, setSelectedPayLater] = useState("simpl");

  const [loading, setLoading] = useState(false);

  // Price calculations
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

      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.name) setCustomerName(u.name);
          if (u.phone || u.mobile) {
            const rawPhone = String(u.phone || u.mobile).replace(/\D/g, "");
            setCustomerPhone(
              rawPhone.startsWith("91") ? `+${rawPhone}` : `+91 ${rawPhone}`,
            );
          }
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
    paymentMethod: "ONLINE" | "COD",
    paymentRef: string = "",
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("redirectAfterLogin", "/booking-payment");
        }
        window.dispatchEvent(new Event("open-auth-modal"));
        setLoading(false);
        return;
      }

      // If online payment is requested without a verified reference, launch Razorpay first
      if (paymentMethod === "ONLINE" && !paymentRef) {
        handleRazorpayPayment();
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

      let formattedDate = "2026-11-02";
      if (bookingDateTime.date) {
        const parts = bookingDateTime.date.split("-");
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        } else {
          formattedDate = bookingDateTime.date;
        }
      }

      const payload = {
        date: formattedDate,
        slot_id: Number(bookingDateTime.slotId || 1),
        customer_notes: bookingDateTime.notes
          ? bookingDateTime.notes.trim()
          : "",
        address_id: addressId,
        payment_type: paymentMethod,
        gst_no: null,
        pan_no: null,
        service_category_id: Number(
          cartItems[0]?.service_category_id ||
            cartItems[0]?.serviceCategoryId ||
            1,
        ),
        service_id: Number(
          cartItems[0]?.service_id || cartItems[0]?.serviceId || 1,
        ),
        razorpay_payment_id: paymentMethod === "ONLINE" ? paymentRef : "",
        state_name: "Chhattisgarh",
        city_name: "Raipur",
        enquiry_source: "web",
        platform_type: "web",
      };

      const response = await axios.post(
        `${API_BASE_URL}/customers/customer-bookings`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data?.status || response.data?.booking) {
        const bookingObj = response.data.booking || response.data.data || {};
        const bookingId = bookingObj.id || bookingObj.booking_id || "";
        const orderId =
          bookingObj.booking_no ||
          bookingObj.order_id ||
          `ENQ-${String(bookingId).padStart(4, "0")}`;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const dynamicOrderDate = `${year}-${month}-${day}`;

        const lastBookingData = {
          orderId: orderId,
          orderDate: dynamicOrderDate,
          bookingId: bookingId,
          bookingDateTime: {
            date: now.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            time: bookingDateTime.time || "11:15 AM",
          },
          selectedAddress: selectedAddress,
          items: cartItems,
          serviceName: cartItems[0]?.name || "AC Repair",
          totalMRP: totalMRP,
          totalDiscount: totalDiscount,
          couponDiscount: couponDiscount,
          finalAmount: payableAmount,
          paymentMethod: paymentMethod,
        };

        localStorage.setItem(
          "lastBooking",
          JSON.stringify(lastBookingData),
        );
        localStorage.removeItem("cart");
        localStorage.removeItem("appliedCoupon");
        clearCart();

        router.push(
          bookingId
            ? `/order-confirmation?booking_id=${bookingId}`
            : `/order-confirmation`,
        );
      } else {
        throw new Error(
          response.data?.message || "Could not complete booking",
        );
      }
    } catch (error: any) {
      console.log("Booking error:", error);
      const apiMsg =
        error?.response?.data?.message ||
        (error?.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(", ")
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

  // Launch Razorpay Payment Gateway
  const handleRazorpayPayment = async (preferredMethodOverride?: string, bankCodeOverride?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("redirectAfterLogin", "/booking-payment");
        }
        window.dispatchEvent(new Event("open-auth-modal"));
        setLoading(false);
        return;
      }

      if (!cartItems.length) {
        Swal.fire({
          icon: "warning",
          title: "Cart Empty",
          text: "Your cart is empty. Please add a service first.",
          confirmButtonColor: "#ff5500",
        });
        setLoading(false);
        router.push("/cart");
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        Swal.fire({
          icon: "error",
          title: "Payment Gateway Error",
          text: "Razorpay SDK could not be loaded. Please check your internet connection.",
          confirmButtonColor: "#ff5500",
        });
        setLoading(false);
        return;
      }

      let customerEmail = "customer@tascompany.in";
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.email) customerEmail = u.email;
        }
      } catch (e) {}

      const razorKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.NEXT_PUBLIC_KEY_ID ||
        "rzp_test_TvL5gF2aAKznOU";

      const options: any = {
        key: razorKey,
        amount: Math.round(payableAmount * 100), // in paisa
        currency: "INR",
        name: "TASpro Company",
        description: cartItems[0]?.name || "Home Service Booking",
        image: "https://files.catbox.moe/l742u1.png",
        prefill: {
          name: customerName,
          contact: customerPhone.replace(/\s+/g, ""),
          email: customerEmail,
        },
        theme: {
          color: "#FF5500",
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout closed by user without completing payment.");
            setLoading(false);
          },
        },
        handler: async function (response: any) {
          console.log("RAZORPAY PAYMENT SUCCESS:", response);
          if (response?.razorpay_payment_id) {
            // ONLY after real verified payment from Razorpay, create the booking!
            await createBooking("ONLINE", response.razorpay_payment_id);
          } else {
            Swal.fire({
              icon: "error",
              title: "Payment Unverified",
              text: "Payment was not verified by Razorpay. Please try again.",
              confirmButtonColor: "#ff5500",
            });
            setLoading(false);
          }
        },
      };

      // Set preferred payment method in Razorpay based on user's active selection
      const methodToUse = preferredMethodOverride || selectedMethod;
      if (methodToUse === "card") {
        options.prefill.method = "card";
      } else if (methodToUse === "upi") {
        options.prefill.method = "upi";
      } else if (methodToUse === "netbanking") {
        options.prefill.method = "netbanking";
        if (bankCodeOverride || selectedBank) {
          options.prefill.bank = bankCodeOverride || selectedBank;
        }
      } else if (methodToUse === "wallet") {
        options.prefill.method = "wallet";
      }

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", function (failRes: any) {
        console.error("Razorpay Payment Failed:", failRes?.error);
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: failRes?.error?.description || "Transaction failed. Please try another payment method.",
          confirmButtonColor: "#ff5500",
        });
        setLoading(false);
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error("Error opening Razorpay:", err);
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Payment Gateway Error",
        text: err?.message || "Failed to initialize payment gateway.",
        confirmButtonColor: "#ff5500",
      });
    }
  };

  const handlePay = () => {
    if (selectedMethod === "cod") {
      createBooking("COD");
    } else {
      handleRazorpayPayment();
    }
  };

  // Banks data matching Image 1
  const suggestedBanks = [
    {
      id: "ICIC",
      name: "ICICI Bank",
      logo: (
        <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
          i
        </div>
      ),
    },
    {
      id: "KKBK",
      name: "Kotak Mahindra Bank",
      logo: (
        <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
          8
        </div>
      ),
    },
    {
      id: "UTIB",
      name: "Axis Bank",
      logo: (
        <div className="w-7 h-7 rounded-full bg-rose-900 text-white flex items-center justify-center font-bold text-xs">
          ▲
        </div>
      ),
    },
    {
      id: "BARB_R",
      name: "Bank of Baroda - Retail Banking",
      sub: "For Individuals",
      logo: (
        <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
          B
        </div>
      ),
    },
    {
      id: "CNRB",
      name: "Canara Bank",
      logo: (
        <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
          C
        </div>
      ),
    },
    {
      id: "SBIN",
      name: "State Bank of India",
      logo: (
        <div className="w-7 h-7 rounded-full bg-[#0076B6] text-white flex items-center justify-center font-bold text-xs">
          SBI
        </div>
      ),
    },
    {
      id: "HDFC",
      name: "HDFC Bank",
      logo: (
        <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
          H
        </div>
      ),
    },
  ];

  const allBanks = [
    { id: "AIRP", name: "Airtel Payments Bank" },
    { id: "INDB", name: "IndusInd Bank" },
    { id: "YESB", name: "Yes Bank" },
    { id: "PUNB_R", name: "Punjab National Bank - Retail Banking" },
    { id: "IDFB", name: "IDFC FIRST Bank" },
    { id: "UBIN", name: "Union Bank of India" },
    { id: "BKID", name: "Bank of India" },
  ];

  const filteredSuggested = suggestedBanks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );
  const filteredAll = allBanks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  return (
    <div className="w-full bg-[#F5F5F7] min-h-screen py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Complete Payment
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Choose your preferred payment method to complete booking
            </p>
          </div>
        </div>

        {/* Support Pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>100% Safe &amp; 256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN PAYMENT CONSOLE (EXACT 3-COLUMN POPUP UI IN FULL WIDTH) */}
      {/* ============================================================== */}
      <div className="max-w-[1400px] w-full mx-auto bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
        {/* ================= PANEL 1: ORANGE BRAND & PRICE SUMMARY (LEFT) ================= */}
        <div className="lg:w-[320px] xl:w-[360px] shrink-0 bg-gradient-to-b from-[#FF5500] via-[#F24E00] to-[#E04600] text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow Rings */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* 1. Logo & Brand Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md shrink-0">
                <img
                  src="/tas.logo.png"
                  alt="TASpro"
                  className="w-full h-full object-contain"
                  onError={(e: any) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                  TASpro Company
                </h2>
                <span className="text-[11px] text-orange-100 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-orange-200" />
                  Verified Merchant
                </span>
              </div>
            </div>

            {/* 2. White Price Summary Card (Matching Image 1) */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 text-gray-900 shadow-lg border border-orange-200/50">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Price Summary
                </p>
                {totalDiscount > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                    SAVE ₹{totalDiscount + couponDiscount}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                  ₹{payableAmount.toLocaleString("en-IN")}
                </span>
                {totalMRP > payableAmount && (
                  <span className="text-sm text-gray-400 line-through font-semibold">
                    ₹{totalMRP.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Service description item */}
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span className="font-semibold text-gray-800 truncate pr-2">
                  {cartItems[0]?.name || "Home Service Booking"}
                </span>
                <span className="font-bold text-gray-900 shrink-0">
                  Total: {cartItems.length}
                </span>
              </div>

              {/* Gift Card Deduction Pill */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyGiftCard}
                    onChange={(e) => setApplyGiftCard(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#ff5500] cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-gray-700">
                    Apply Gift Card (₹{giftCardBalance})
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowGiftModal(true)}
                  className="text-[#ff5500] hover:underline text-[11px] font-extrabold cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* 3. Customer Info Pill: Using as +91 ... (Matching Image 1) */}
            <div className="bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-xl px-4 py-3 flex items-center justify-between text-white text-xs font-bold transition-all shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5 text-white" />
                </div>
                <span>Using as {customerPhone}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70" />
            </div>
          </div>

          {/* 4. 3D Coins & Gift Illustration Graphic (Matching Image 1) */}
          <div className="relative z-10 pt-6 mt-4 flex flex-col items-center justify-end">
            <div className="w-48 h-32 relative flex items-center justify-center opacity-95">
              <svg
                viewBox="0 0 200 130"
                className="w-full h-full drop-shadow-xl"
                fill="none"
              >
                {/* 3D Isometric Base Box */}
                <polygon
                  points="100,20 160,50 100,80 40,50"
                  fill="#FF8A4C"
                />
                <polygon
                  points="40,50 100,80 100,120 40,90"
                  fill="#E64D00"
                />
                <polygon
                  points="160,50 100,80 100,120 160,90"
                  fill="#C63C00"
                />
                {/* Ribbon Top */}
                <line
                  x1="70"
                  y1="35"
                  x2="130"
                  y2="65"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="130"
                  y1="35"
                  x2="70"
                  y2="65"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Golden Coins Stack Left */}
                <ellipse cx="60" cy="95" rx="20" ry="8" fill="#F59E0B" />
                <ellipse cx="60" cy="90" rx="20" ry="8" fill="#FBBF24" />
                <ellipse cx="60" cy="85" rx="20" ry="8" fill="#FDE68A" />
                <text
                  x="56"
                  y="88"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#92400E"
                >
                  ₹
                </text>

                <ellipse cx="60" cy="78" rx="18" ry="7" fill="#F59E0B" />
                <ellipse cx="60" cy="74" rx="18" ry="7" fill="#FBBF24" />
                <ellipse cx="60" cy="70" rx="18" ry="7" fill="#FEF3C7" />
                <text
                  x="56"
                  y="73"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#92400E"
                >
                  ₹
                </text>

                {/* Golden Coins Stack Right */}
                <ellipse cx="145" cy="105" rx="18" ry="7" fill="#F59E0B" />
                <ellipse cx="145" cy="101" rx="18" ry="7" fill="#FBBF24" />
                <ellipse cx="145" cy="97" rx="18" ry="7" fill="#FEF3C7" />
              </svg>
            </div>

            {/* Razorpay Secured Footer inside Orange Panel */}
            <div className="pt-4 flex items-center justify-center gap-1.5 text-orange-100 text-[11px] font-bold">
              <Shield className="w-3.5 h-3.5 fill-white text-white" />
              <span>Secured by</span>
              <strong className="text-white tracking-wide font-black">
                Razorpay
              </strong>
            </div>
          </div>
        </div>

        {/* ================= PANEL 2: PAYMENT METHODS MENU (MIDDLE) ================= */}
        <div className="lg:w-[260px] xl:w-[280px] shrink-0 bg-[#FAF9F8] border-r border-gray-200/90 py-5 px-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            {/* 1. UPI */}
            <div
              onClick={() => setSelectedMethod("upi")}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "upi"
                  ? "bg-white text-gray-950 shadow-sm border border-orange-200 font-extrabold ring-1 ring-orange-500/20"
                  : "text-gray-700 hover:bg-gray-200/60 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-black tracking-tight">
                  UPI
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-[7px] font-bold">
                  G
                </div>
                <div className="w-4 h-4 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[7px] font-bold">
                  P
                </div>
                <div className="w-4 h-4 rounded-full bg-[#00BAF2] text-white flex items-center justify-center text-[7px] font-bold">
                  P
                </div>
              </div>
            </div>

            {/* 2. Cards */}
            <div
              onClick={() => setSelectedMethod("card")}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "card"
                  ? "bg-white text-gray-950 shadow-sm border border-orange-200 font-extrabold ring-1 ring-orange-500/20"
                  : "text-gray-700 hover:bg-gray-200/60 font-semibold"
              }`}
            >
              <span className="text-xs font-bold">Cards</span>
              <div className="flex items-center gap-1 opacity-80">
                <span className="text-[9px] font-black text-blue-800">VISA</span>
                <span className="text-[9px] font-black text-red-600">MC</span>
                <span className="text-[9px] font-black text-green-700">RUPAY</span>
              </div>
            </div>

            {/* 3. EMI */}
            <div
              onClick={() => setSelectedMethod("emi")}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "emi"
                  ? "bg-white text-gray-950 shadow-sm border border-orange-200 font-extrabold ring-1 ring-orange-500/20"
                  : "text-gray-700 hover:bg-gray-200/60 font-semibold"
              }`}
            >
              <span className="text-xs font-bold">EMI</span>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-blue-100 text-blue-700 rounded">
                  NO COST
                </span>
              </div>
            </div>

            {/* 4. Netbanking */}
            <div
              onClick={() => setSelectedMethod("netbanking")}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "netbanking"
                  ? "bg-white text-gray-950 shadow-sm border border-orange-200 font-extrabold ring-1 ring-orange-500/20"
                  : "text-gray-700 hover:bg-gray-200/60 font-semibold"
              }`}
            >
              <span className="text-xs font-bold">Netbanking</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-700" />
                <div className="w-3.5 h-3.5 rounded-full bg-red-600" />
                <div className="w-3.5 h-3.5 rounded-full bg-orange-500" />
              </div>
            </div>

            {/* 5. Wallet */}
            <div
              onClick={() => setSelectedMethod("wallet")}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "wallet"
                  ? "bg-white text-gray-950 shadow-sm border border-orange-200 font-extrabold ring-1 ring-orange-500/20"
                  : "text-gray-700 hover:bg-gray-200/60 font-semibold"
              }`}
            >
              <span className="text-xs font-bold">Wallet</span>
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-bold text-sky-600">PAYTM</span>
                <span className="text-[8px] font-bold text-red-600">AIRTEL</span>
              </div>
            </div>

            {/* 6. Pay Later */}
            <div
              onClick={() => setSelectedMethod("paylater")}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "paylater"
                  ? "bg-white text-gray-950 shadow-sm border border-orange-200 font-extrabold ring-1 ring-orange-500/20"
                  : "text-gray-700 hover:bg-gray-200/60 font-semibold"
              }`}
            >
              <span className="text-xs font-bold">Pay Later</span>
              <span className="px-1.5 py-0.5 text-[8px] font-bold bg-amber-100 text-amber-800 rounded">
                SIMPL
              </span>
            </div>

            {/* 7. Cash on Delivery */}
            <div
              onClick={() => setSelectedMethod("cod")}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === "cod"
                  ? "bg-white text-gray-950 shadow-sm border border-orange-200 font-extrabold ring-1 ring-orange-500/20"
                  : "text-gray-700 hover:bg-gray-200/60 font-semibold"
              }`}
            >
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Quick Help Link */}
          <div className="pt-4 border-t border-gray-200/80 text-center">
            <p className="text-[11px] text-gray-400 font-medium">
              Need assistance?
            </p>
            <p className="text-xs font-bold text-[#ff5500]">7447-0000-45</p>
          </div>
        </div>

        {/* ================= PANEL 3: PAYMENT OPTIONS DETAILS (RIGHT) ================= */}
        <div className="flex-1 bg-white p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Top Bar inside Right Panel (Matching Image 1) */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                {selectedMethod === "netbanking" && "Payment Options • Netbanking"}
                {selectedMethod === "upi" && "Payment Options • UPI"}
                {selectedMethod === "card" && "Payment Options • Cards"}
                {selectedMethod === "emi" && "Payment Options • EMI"}
                {selectedMethod === "wallet" && "Payment Options • Wallets"}
                {selectedMethod === "paylater" && "Payment Options • Pay Later"}
                {selectedMethod === "cod" && "Payment Options • Cash on Delivery"}
              </h3>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-xs font-mono font-bold text-gray-400">
                  Step 2 of 2
                </span>
              </div>
            </div>

            {/* ----------------- VIEW 1: NETBANKING (EXACT MATCH OF IMAGE 1!) ----------------- */}
            {selectedMethod === "netbanking" && (
              <div className="space-y-4">
                {/* Search Bar matching Image 1 */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search for Banks"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-[#ff5500] transition-all"
                  />
                </div>

                {/* Suggested Banks Section matching Image 1 */}
                <div>
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                    Suggested Banks
                  </p>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                    {filteredSuggested.map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                          selectedBank === bank.id
                            ? "bg-orange-50/40"
                            : "hover:bg-gray-50/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {bank.logo}
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-900">
                              {bank.name}
                            </p>
                            {bank.sub && (
                              <p className="text-[11px] text-gray-400 font-medium">
                                {bank.sub}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedBank === bank.id ? (
                            <div className="w-5 h-5 rounded-full bg-[#ff5500] text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Banks Section matching Image 1 */}
                {filteredAll.length > 0 && (
                  <div>
                    <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                      All Banks
                    </p>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                      {filteredAll.map((bank) => (
                        <div
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                            selectedBank === bank.id
                              ? "bg-orange-50/40"
                              : "hover:bg-gray-50/80"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs">
                              {bank.name.slice(0, 1)}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-gray-800">
                              {bank.name}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------- VIEW 2: UPI (QR / APPS / ID) ----------------- */}
            {selectedMethod === "upi" && (
              <div className="space-y-4">
                {/* Sub-tabs: Scan QR | UPI Apps | UPI ID */}
                <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl max-w-sm">
                  <button
                    type="button"
                    onClick={() => setUpiMode("qr")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      upiMode === "qr"
                        ? "bg-white text-[#ff5500] shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    UPI QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode("apps")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      upiMode === "apps"
                        ? "bg-white text-[#ff5500] shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    UPI Apps
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode("id")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      upiMode === "id"
                        ? "bg-white text-[#ff5500] shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    UPI ID
                  </button>
                </div>

                {/* Submode A: QR CODE (matching Image 1 QR screen!) */}
                {upiMode === "qr" && (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-gray-200/90 rounded-2xl bg-gradient-to-r from-orange-50/30 to-amber-50/20">
                    <div className="w-48 h-48 bg-white p-2.5 rounded-2xl border-2 border-orange-200 shadow-sm shrink-0 relative flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=tascompany@okhdfcbank%26pn=TASproCompany%26am=${payableAmount}%26cu=INR`}
                        alt="UPI QR"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-2.5 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 bg-orange-100/70 text-[#ff5500] text-xs font-extrabold px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expires in 11:38 mins</span>
                      </div>
                      <h4 className="text-base font-black text-gray-900">
                        Scan the QR using any UPI App
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                        Open Google Pay, PhonePe, Paytm, CRED or any BHIM UPI app
                        on your phone to scan and pay instantly.
                      </p>

                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                        <span className="text-[10px] font-black uppercase text-gray-400">
                          Supports:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-[9px] font-bold">
                            G
                          </span>
                          <span className="w-5 h-5 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[9px] font-bold">
                            P
                          </span>
                          <span className="w-5 h-5 rounded-full bg-[#00BAF2] text-white flex items-center justify-center text-[9px] font-bold">
                            Pay
                          </span>
                          <span className="w-5 h-5 rounded-full bg-[#0076B6] text-white flex items-center justify-center text-[9px] font-bold">
                            BH
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submode B: UPI APPS */}
                {upiMode === "apps" && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-600">
                      Select your preferred UPI App to proceed:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: "gpay", name: "Google Pay", color: "#4285F4" },
                        { id: "phonepe", name: "PhonePe", color: "#5f259f" },
                        { id: "paytm", name: "Paytm", color: "#00BAF2" },
                        { id: "bhim", name: "BHIM UPI", color: "#0076B6" },
                      ].map((app) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                            selectedUpiApp === app.id
                              ? "border-[#ff5500] bg-orange-50/30 ring-1 ring-[#ff5500]"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold shadow-xs"
                            style={{ backgroundColor: app.color }}
                          >
                            {app.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-gray-800 block">
                            {app.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submode C: UPI ID */}
                {upiMode === "id" && (
                  <div className="space-y-3 max-w-md">
                    <label className="block text-xs font-bold text-gray-700">
                      Enter your UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. mobileNumber@upi / name@okhdfcbank"
                        value={customUpiId}
                        onChange={(e) => {
                          setCustomUpiId(e.target.value);
                          setUpiVerified(false);
                        }}
                        className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#ff5500]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customUpiId.includes("@")) {
                            setUpiVerified(true);
                          } else {
                            Swal.fire({
                              icon: "warning",
                              title: "Invalid UPI ID",
                              text: "Please enter a valid UPI ID (e.g. yourname@upi)",
                              confirmButtonColor: "#ff5500",
                            });
                          }
                        }}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-800 transition-colors"
                      >
                        {upiVerified ? "✓ Verified" : "Verify"}
                      </button>
                    </div>

                    {upiVerified && (
                      <p className="text-xs text-green-700 font-bold flex items-center gap-1.5 bg-green-50 p-2 rounded-lg border border-green-200">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>UPI ID verified and ready for payment.</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ----------------- VIEW 3: CARDS ----------------- */}
            {selectedMethod === "card" && (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .replace(/(\d{4})(?=\d)/g, "$1 ");
                      setCardNumber(val);
                    }}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium tracking-wide focus:border-[#ff5500] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Valid Thru (MM/YY)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length >= 2) {
                          val = val.slice(0, 2) + "/" + val.slice(2, 4);
                        }
                        setCardExpiry(val);
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-center focus:border-[#ff5500] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-center tracking-widest focus:border-[#ff5500] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name as printed on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:border-[#ff5500] outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#ff5500] cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 font-medium">
                    Securely save this card as per RBI guidelines
                  </span>
                </label>
              </div>
            )}

            {/* ----------------- VIEW 4: EMI ----------------- */}
            {selectedMethod === "emi" && (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Bank
                  </label>
                  <select
                    value={selectedEmiBank}
                    onChange={(e) => setSelectedEmiBank(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none bg-white"
                  >
                    <option value="hdfc">HDFC Bank Credit Card EMI</option>
                    <option value="icici">ICICI Bank Credit Card EMI</option>
                    <option value="sbi">SBI Credit Card EMI</option>
                    <option value="axis">Axis Bank Credit Card EMI</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Select Tenure
                  </label>
                  {[
                    {
                      months: "3",
                      rate: "No Cost EMI",
                      perMonth: Math.max(Math.round(payableAmount / 3), 50),
                    },
                    {
                      months: "6",
                      rate: "No Cost EMI",
                      perMonth: Math.max(Math.round(payableAmount / 6), 25),
                    },
                    {
                      months: "9",
                      rate: "15% p.a. standard EMI",
                      perMonth: Math.max(
                        Math.round((payableAmount * 1.1) / 9),
                        20,
                      ),
                    },
                  ].map((plan) => (
                    <div
                      key={plan.months}
                      onClick={() => setSelectedEmiTenure(plan.months)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedEmiTenure === plan.months
                          ? "border-[#ff5500] bg-orange-50/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          ₹{plan.perMonth.toLocaleString("en-IN")} x{" "}
                          {plan.months} months
                        </p>
                        <p className="text-[11px] text-green-700 font-semibold">
                          {plan.rate}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedEmiTenure === plan.months
                            ? "border-[#ff5500] bg-[#ff5500]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedEmiTenure === plan.months && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- VIEW 5: WALLETS ----------------- */}
            {selectedMethod === "wallet" && (
              <div className="space-y-3 max-w-md">
                <p className="text-xs font-bold text-gray-600">
                  Select your wallet to pay:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "paytm", name: "Paytm Wallet", badge: "Popular" },
                    { id: "mobikwik", name: "MobiKwik", badge: "Offers" },
                    { id: "airtel", name: "Airtel Money", badge: "" },
                    { id: "phonepe", name: "PhonePe Wallet", badge: "" },
                  ].map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWallet(w.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedWallet === w.id
                          ? "border-[#ff5500] bg-orange-50/25 ring-1 ring-[#ff5500]"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-800">
                          {w.name}
                        </p>
                        {w.badge && (
                          <span className="text-[9px] font-extrabold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                            {w.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedWallet === w.id
                            ? "border-[#ff5500] bg-[#ff5500]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedWallet === w.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- VIEW 6: PAY LATER ----------------- */}
            {selectedMethod === "paylater" && (
              <div className="space-y-3 max-w-md">
                <p className="text-xs font-bold text-gray-600">
                  Choose a Pay Later service:
                </p>
                <div className="space-y-2">
                  {[
                    {
                      id: "simpl",
                      name: "Simpl Pay Later",
                      desc: "Pay in 15 days or 3 easy installments",
                    },
                    {
                      id: "lazypay",
                      name: "LazyPay",
                      desc: "Buy now, pay later with 1-click checkout",
                    },
                  ].map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => setSelectedPayLater(pl.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedPayLater === pl.id
                          ? "border-[#ff5500] bg-orange-50/25 ring-1 ring-[#ff5500]"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-800">
                          {pl.name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {pl.desc}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPayLater === pl.id
                            ? "border-[#ff5500] bg-[#ff5500]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedPayLater === pl.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- VIEW 7: CASH ON DELIVERY ----------------- */}
            {selectedMethod === "cod" && (
              <div className="space-y-4 max-w-md">
                <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                      Cash on Delivery Available
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      You can pay cash or scan the technician's QR code directly
                      after service completion at your doorstep.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No advance payment needed to place your booking.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      100% background-verified professionals with warranty.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= BOTTOM ACTION BAR (MATCHING IMAGE 1) ================= */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>By proceeding, you agree to TASpro Terms &amp; Conditions</span>
              </div>

              {/* Big Vibrant Action Button */}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full sm:w-auto min-w-[280px] h-12 bg-[#FFC200] hover:bg-[#F5B400] active:scale-[0.99] text-gray-950 font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : selectedMethod === "cod" ? (
                  <span>Confirm Booking (Cash on Delivery)</span>
                ) : selectedMethod === "netbanking" ? (
                  <span>Pay ₹{payableAmount.toLocaleString("en-IN")} via Netbanking</span>
                ) : selectedMethod === "upi" ? (
                  <span>Pay ₹{payableAmount.toLocaleString("en-IN")} via UPI</span>
                ) : (
                  <span>Pay ₹{payableAmount.toLocaleString("en-IN")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= GIFT CARD MODAL ================= */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowGiftModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-gray-900 mb-4">
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-medium"
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-medium tracking-widest"
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
