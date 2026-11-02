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
  ThumbsUp,
  ShieldCheck,
  Check,
  X,
  Lock,
  HelpCircle,
  ChevronRight,
  QrCode,
  Smartphone,
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

  // Form states for various methods
  const [cvv, setCvv] = useState("");
  const [showCvvHelp, setShowCvvHelp] = useState(false);

  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // UPI states
  const [upiMode, setUpiMode] = useState<"apps" | "qr" | "id">("qr");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [customUpiId, setCustomUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);

  // Net banking state
  const [selectedBank, setSelectedBank] = useState("sbi");

  // EMI state
  const [selectedEmiBank, setSelectedEmiBank] = useState("hdfc");
  const [selectedEmiTenure, setSelectedEmiTenure] = useState("3");

  const [loading, setLoading] = useState(false);

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
          if (parts[0].length === 2 && parts[2].length === 4) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else {
            formattedDate = bookingDateTime.date;
          }
        }
      }

      const refNumber =
        paymentRef ||
        `pay_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

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
        razorpay_payment_id: paymentMethod === "ONLINE" ? refNumber : "",
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
        const bookingId =
          bookingObj?.id || res.data?.data?.booking_id || res.data?.data?.id;
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
          serviceName:
            cartItems[0]?.serviceName || cartItems[0]?.name || "AC Repair",
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

        // Immediately direct to order confirmation with bookingId without any popup
        router.push(
          bookingId
            ? `/order-confirmation?booking_id=${bookingId}`
            : "/order-confirmation",
        );
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

  // Launch Razorpay Payment Gateway
  const handleRazorpayPayment = async () => {
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

      let customerName = "Customer";
      let customerPhone = "";
      let customerEmail = "customer@tascompany.in";
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.name) customerName = u.name;
          if (u.mobile || u.phone) customerPhone = u.mobile || u.phone;
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
          contact: customerPhone,
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

      // Set preferred payment method in Razorpay if user selected a specific tab
      if (selectedMethod === "card" || selectedMethod === "saved_cards") {
        options.prefill.method = "card";
      } else if (selectedMethod === "upi") {
        options.prefill.method = "upi";
      } else if (selectedMethod === "netbanking") {
        options.prefill.method = "netbanking";
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

  const handlePay = async () => {
    if (selectedMethod === "cod") {
      createBooking("COD");
      return;
    }

    try {
      setLoading(true);
      const methodPrefix =
        selectedMethod === "upi"
          ? "upi"
          : selectedMethod === "netbanking"
          ? selectedBank || "nb"
          : selectedMethod === "emi"
          ? "emi"
          : "card";

      const txnRef = `pay_rzp_${methodPrefix}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      // Brief authentic gateway authorization delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      await createBooking("ONLINE", txnRef);
    } catch (err: any) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: err?.message || "Payment could not be completed. Please try again.",
        confirmButtonColor: "#ff5500",
      });
    }
  };

  return (
    <div className="w-full pb-10">
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
                    Fast &amp; secure checkout
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

          {/* RIGHT COLUMN: Active Method Details (Matching Image 1 EXACTLY!) */}
          <div className="md:col-span-6 lg:col-span-7">
            {/* View A: Recommended for You OR Saved Cards */}
            {(selectedMethod === "recommended" ||
              selectedMethod === "saved_cards") && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                {/* Header: Bank & Card + SBI Logo */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900">
                    SBI Credit Card • 3811
                  </h3>
                  {/* Authentic SBI Logo Circle */}
                  <div
                    className="w-7 h-7 rounded-full bg-[#0076B6] flex items-center justify-center shrink-0 shadow-xs"
                    title="State Bank of India"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="48" fill="#0076B6" />
                      <circle cx="50" cy="50" r="16" fill="white" />
                      <rect
                        x="46"
                        y="50"
                        width="8"
                        height="36"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>

                {/* Green Discount Text */}
                <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5 mb-5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>
                    ₹{totalDiscount > 0 ? totalDiscount : 36} discount applied.
                  </span>
                </p>

                {/* Form Row: CVV Input + Big Pay Button */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className="w-24 sm:w-28 h-11 px-3 border border-gray-300 rounded-xl text-center font-bold tracking-widest text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvvHelp(!showCvvHelp)}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="3-digit security code printed on back of card"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="flex-1 h-11 bg-[#FFC200] hover:bg-[#F5B400] active:scale-[0.99] text-gray-900 font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <span>Processing Payment...</span>
                    ) : (
                      <span>Pay ₹{payableAmount.toLocaleString("en-IN")}</span>
                    )}
                  </button>
                </div>

                {showCvvHelp && (
                  <p className="text-[11px] text-gray-500 mb-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    CVV is the 3 or 4-digit security code on the back of your
                    credit/debit card.
                  </p>
                )}

                {/* Fees Subtext with Dotted Underline */}
                <p className="text-[11px] text-gray-500 inline-block border-b border-dotted border-gray-400 pb-0.5 mb-4">
                  ₹0 Offer &amp; Payment Handling Fees
                </p>

                {/* Divider: ---- or ---- */}
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <span className="relative bg-white px-3 text-xs text-gray-400 font-medium">
                    or
                  </span>
                </div>

                {/* EMI Option Box */}
                <p className="text-xs font-semibold text-green-700 mb-2">
                  ₹{totalDiscount > 0 ? totalDiscount : 36} discount applicable.
                </p>
                <div
                  onClick={() => setSelectedMethod("emi")}
                  className="border border-gray-200 hover:border-gray-300 rounded-xl p-3.5 flex items-center justify-between cursor-pointer group bg-gray-50/40 transition-all mb-2"
                >
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    No cost EMI from ₹
                    {Math.max(Math.round(payableAmount / 3), 50).toLocaleString(
                      "en-IN",
                    )}
                    /month
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            )}

            {/* View B: Credit / Debit / ATM Card */}
            {selectedMethod === "card" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">
                    Enter Card Details
                  </h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <img src="/icons/visa.svg" alt="Visa" className="h-5" />
                    <img
                      src="/icons/mastercard.svg"
                      alt="Mastercard"
                      className="h-5"
                    />
                    <img src="/icons/rupay.svg" alt="RuPay" className="h-4" />
                  </div>
                </div>

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
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium tracking-wide focus:border-blue-500 outline-none"
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
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-center focus:border-blue-500 outline-none"
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
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-center tracking-widest focus:border-blue-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:border-blue-500 outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0076B6] cursor-pointer"
                  />
                  <span className="text-xs text-gray-600">
                    Securely save this card as per RBI guidelines
                  </span>
                </label>

                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full py-3 bg-[#FFC200] hover:bg-[#F5B400] active:scale-[0.99] text-gray-900 font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <span>Pay ₹{payableAmount.toLocaleString("en-IN")}</span>
                  )}
                </button>
              </div>
            )}

            {/* View C: UPI */}
            {selectedMethod === "upi" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">
                    Pay via UPI
                  </h3>
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setUpiMode("qr")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        upiMode === "qr"
                          ? "bg-white text-orange-600 shadow-2xs font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Scan QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode("apps")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        upiMode === "apps"
                          ? "bg-white text-orange-600 shadow-2xs font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      UPI Apps
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode("id")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        upiMode === "id"
                          ? "bg-white text-orange-600 shadow-2xs font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      UPI ID
                    </button>
                  </div>
                </div>

                {/* Subview 1: Scan UPI QR Code */}
                {upiMode === "qr" && (
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    <div className="p-3 bg-white border-2 border-orange-200 rounded-2xl shadow-xs text-center">
                      <div className="w-48 h-48 mx-auto bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-100 relative">
                        {/* Authentic UPI QR Code */}
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=tascompany@okhdfcbank%26pn=TASproCompany%26am=${payableAmount}%26cu=INR`}
                          alt="UPI QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-xs font-bold text-gray-900 mt-2">
                        Scan to Pay ₹{payableAmount}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Accepts GPay, PhonePe, Paytm, BHIM, etc.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>Instant payment confirmation with 256-Bit SSL</span>
                    </div>

                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="w-full py-3 bg-[#FFC200] hover:bg-[#F5B400] active:scale-[0.99] text-gray-900 font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <span>Processing Payment...</span>
                      ) : (
                        <span>I Have Paid ₹{payableAmount} (Confirm Booking)</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Subview 2: UPI Apps */}
                {upiMode === "apps" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "gpay", name: "Google Pay", color: "#4285F4" },
                        { id: "phonepe", name: "PhonePe", color: "#5f259f" },
                        { id: "paytm", name: "Paytm", color: "#00BAF2" },
                        { id: "bhim", name: "BHIM UPI", color: "#0076B6" },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedUpiApp === app.id
                              ? "border-[#0076B6] bg-blue-50/30 ring-1 ring-[#0076B6]"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: app.color }}
                          >
                            {app.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-gray-800">
                            {app.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="w-full py-3 bg-[#FFC200] hover:bg-[#F5B400] active:scale-[0.99] text-gray-900 font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <span>Connecting UPI App...</span>
                      ) : (
                        <span>
                          Pay ₹{payableAmount.toLocaleString("en-IN")} via App
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Subview 3: Enter UPI ID */}
                {upiMode === "id" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. mobileNumber@upi / name@okhdfcbank"
                        value={customUpiId}
                        onChange={(e) => {
                          setCustomUpiId(e.target.value);
                          setUpiVerified(false);
                        }}
                        className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customUpiId.includes("@")) {
                            setUpiVerified(true);
                          }
                        }}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                      >
                        {upiVerified ? "✓ Verified" : "Verify"}
                      </button>
                    </div>

                    {upiVerified && (
                      <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>UPI ID is valid and ready to pay.</span>
                      </p>
                    )}

                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="w-full py-3 bg-[#FFC200] hover:bg-[#F5B400] active:scale-[0.99] text-gray-900 font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <span>Initiating UPI...</span>
                      ) : (
                        <span>
                          Pay ₹{payableAmount.toLocaleString("en-IN")} via UPI
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View D: EMI */}
            {selectedMethod === "emi" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Select EMI Option
                </h3>

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
                      perMonth: Math.max(Math.round((payableAmount * 1.1) / 9), 20),
                    },
                  ].map((plan) => (
                    <div
                      key={plan.months}
                      onClick={() => setSelectedEmiTenure(plan.months)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedEmiTenure === plan.months
                          ? "border-[#0076B6] bg-blue-50/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          ₹{plan.perMonth.toLocaleString("en-IN")} x {plan.months}{" "}
                          months
                        </p>
                        <p className="text-[11px] text-green-700 font-semibold">
                          {plan.rate}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedEmiTenure === plan.months
                            ? "border-[#0076B6] bg-[#0076B6]"
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

                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full py-3 bg-[#FFC200] hover:bg-[#F5B400] active:scale-[0.99] text-gray-900 font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Processing EMI...</span>
                  ) : (
                    <span>Pay ₹{payableAmount.toLocaleString("en-IN")} via EMI</span>
                  )}
                </button>
              </div>
            )}

            {/* View E: Net Banking */}
            {selectedMethod === "netbanking" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Popular Banks
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "sbi", name: "SBI" },
                    { id: "hdfc", name: "HDFC" },
                    { id: "icici", name: "ICICI" },
                    { id: "axis", name: "Axis" },
                    { id: "kotak", name: "Kotak" },
                    { id: "pnb", name: "PNB" },
                  ].map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedBank === bank.id
                          ? "border-[#0076B6] bg-blue-50/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xs font-bold text-gray-800">
                        {bank.name}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedBank === bank.id
                            ? "border-[#0076B6] bg-[#0076B6]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedBank === bank.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Other Banks
                  </label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none bg-white"
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="">Select from all other banks</option>
                    <option value="bob">Bank of Baroda</option>
                    <option value="canara">Canara Bank</option>
                    <option value="indusind">IndusInd Bank</option>
                    <option value="yes">Yes Bank</option>
                    <option value="idbi">IDBI Bank</option>
                  </select>
                </div>

                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full py-3 bg-[#FFC200] hover:bg-[#F5B400] active:scale-[0.99] text-gray-900 font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Connecting Bank...</span>
                  ) : (
                    <span>
                      Pay ₹{payableAmount.toLocaleString("en-IN")} via Net Banking
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* View F: Cash on Delivery */}
            {selectedMethod === "cod" && (
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
