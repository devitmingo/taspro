"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBooking } from "@/context/BookingContext";
import {
  Lock,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  Building2,
  Percent,
  Wallet,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Check,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Copy,
  User,
  Phone,
  HelpCircle,
  FileText,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import Swal from "sweetalert2";

type PaymentMethodType =
  | "upi"
  | "qr"
  | "card"
  | "emi"
  | "netbanking"
  | "wallet"
  | "cod";

export default function DedicatedCheckoutPaymentPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useBooking();

  // Active payment method tab
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("upi");

  // Booking / Session state
  const [sessionData, setSessionData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [bookingDateTime, setBookingDateTime] = useState<any>(null);
  const [addGst, setAddGst] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [gstName, setGstName] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Form states for methods
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [otherBank, setOtherBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("paytm");
  const [selectedEmiBank, setSelectedEmiBank] = useState("HDFC Bank");
  const [selectedEmiTenure, setSelectedEmiTenure] = useState(3);

  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // Transaction state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [qrTimeLeft, setQrTimeLeft] = useState(895); // ~15 mins countdown

  // QR Timer Countdown
  useEffect(() => {
    if (selectedMethod !== "qr") return;
    const timer = setInterval(() => {
      setQrTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedMethod]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Load Razorpay Script dynamically
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

  // Hydrate checkout data
  useEffect(() => {
    loadRazorpayScript();

    if (typeof window === "undefined") return;

    try {
      const storedSession = localStorage.getItem("checkoutSession");
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setSessionData(parsed);
        if (parsed.selectedAddress) setSelectedAddress(parsed.selectedAddress);
        if (parsed.bookingDateTime) setBookingDateTime(parsed.bookingDateTime);
        if (parsed.addGst) setAddGst(parsed.addGst);
        if (parsed.gstNo) setGstNo(parsed.gstNo);
        if (parsed.gstName) setGstName(parsed.gstName);
        if (parsed.appliedCoupon) setAppliedCoupon(parsed.appliedCoupon);
        if (parsed.userData) setUserData(parsed.userData);
      }
    } catch (e) {
      console.error("Error loading checkoutSession:", e);
    }

    // Fallbacks from storage if session wasn't set
    try {
      if (!selectedAddress) {
        const savedAddr = localStorage.getItem("selectedAddress");
        if (savedAddr) setSelectedAddress(JSON.parse(savedAddr));
      }
      if (!bookingDateTime) {
        const savedDateTime = localStorage.getItem("bookingDateTime");
        if (savedDateTime) setBookingDateTime(JSON.parse(savedDateTime));
      }
      if (!userData) {
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUserData(JSON.parse(savedUser));
      }
      if (!appliedCoupon) {
        const savedCoupon = localStorage.getItem("appliedCoupon");
        if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {}
  }, []);

  // Compute pricing
  const effectiveCartItems = useMemo(() => {
    if (sessionData?.cartItems && sessionData.cartItems.length > 0) {
      return sessionData.cartItems;
    }
    return cartItems;
  }, [sessionData, cartItems]);

  const rawTotalMRP = effectiveCartItems.reduce(
    (sum: number, item: any) =>
      sum +
      (item.originalPrice || item.strike_price || item.price || item.discountedPrice || 0) *
        (item.quantity || 1),
    0,
  );

  const rawTotalAmount = effectiveCartItems.reduce(
    (sum: number, item: any) =>
      sum + (item.price || item.discountedPrice || 0) * (item.quantity || 1),
    0,
  );

  const totalMRP = sessionData?.totalMRP || Math.round(rawTotalMRP) || 219;
  const totalAmount = sessionData?.totalAmount || Math.round(rawTotalAmount) || 199;
  const totalDiscount =
    sessionData?.totalDiscount !== undefined
      ? sessionData.totalDiscount
      : Math.max(Math.round(totalMRP - totalAmount), 0);
  const couponDiscount = Math.round(
    appliedCoupon ? appliedCoupon.discount : sessionData?.couponDiscount || 0,
  );
  const finalAmount =
    sessionData?.finalAmount || Math.max(totalAmount - couponDiscount, 0);

  const basePriceExcludingGst = Math.round(finalAmount / 1.18);
  const gstAmount = Math.max(finalAmount - basePriceExcludingGst, 0);

  // Customer contact info
  const customerName =
    userData?.name ||
    (userData?.first_name ? `${userData.first_name} ${userData.last_name || ""}`.trim() : null) ||
    sessionData?.userData?.name ||
    "Amit Jaiswal";

  const customerMobile =
    userData?.mobile ||
    userData?.phone ||
    sessionData?.userData?.mobile ||
    selectedAddress?.mobile ||
    selectedAddress?.phone ||
    "+91 78129 91993";

  const customerEmail =
    userData?.email || sessionData?.userData?.email || "customer@tascompany.in";

  // Address text
  const addressFormatted = useMemo(() => {
    if (!selectedAddress) return "259, Hirapur, Raipur, Chhattisgarh - 492099";
    const parts = [
      selectedAddress.house_number,
      selectedAddress.street,
      selectedAddress.landmark ? `Near ${selectedAddress.landmark}` : null,
      typeof selectedAddress.city === "object" ? selectedAddress.city.name : selectedAddress.city,
      typeof selectedAddress.state === "object" ? selectedAddress.state.name : selectedAddress.state,
      selectedAddress.postal_code,
    ].filter(Boolean);
    return parts.length > 0
      ? parts.join(", ")
      : "259, Hirapur, Raipur, Chhattisgarh - 492099";
  }, [selectedAddress]);

  // Appointment Slot text
  const scheduledDate = bookingDateTime?.date || "Today";
  const scheduledTime =
    bookingDateTime?.time ||
    bookingDateTime?.slotName ||
    bookingDateTime?.timeSlot ||
    bookingDateTime?.slot_time ||
    bookingDateTime?.slot ||
    "Anytime (Standard Slot)";

  // Format Card input
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // -------------------------------------------------------------
  // COD SUBMISSION HANDLER
  // -------------------------------------------------------------
  const handleConfirmCod = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Confirming your Cash on Delivery booking...");

      const token = localStorage.getItem("token");
      if (!token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("redirectAfterLogin", "/checkout-payment");
        }
        window.dispatchEvent(new Event("open-auth-modal"));
        setLoading(false);
        return;
      }

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

      let formattedDate = new Date().toISOString().split("T")[0];
      if (bookingDateTime?.date) {
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
        slot_id: Number(bookingDateTime?.slotId || 1),
        customer_notes: bookingDateTime?.notes?.trim() || "Doorstep service request (COD)",
        address_id: addressId,
        payment_type: "COD",
        gst_no: addGst && gstNo.trim() ? gstNo.trim() : "22AAAAA0000A1Z5",
        gst_name: addGst && gstName.trim() ? gstName.trim() : null,
        pan_no: "ABCDE1234F",
        service_category_id: Number(
          effectiveCartItems[0]?.service_category_id ||
            effectiveCartItems[0]?.serviceCategoryId ||
            1,
        ),
        service_id: Number(
          effectiveCartItems[0]?.service_id || effectiveCartItems[0]?.serviceId || 1,
        ),
        razorpay_payment_id: "",
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

      const bookingObj =
        res.data?.data?.booking ||
        (res.data?.data?.booking_no ? res.data?.data : null);

      if (res.data?.status || bookingObj) {
        const bookingId =
          bookingObj?.id || res.data?.data?.booking_id || res.data?.data?.id;
        const orderId =
          bookingObj?.booking_no ||
          res.data?.data?.order_id ||
          `TS${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}C${Math.floor(10000 + Math.random() * 90000)}`;

        const lastBooking = {
          bookingId,
          orderId,
          orderDate: new Date().toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          items: effectiveCartItems.length > 0 ? [...effectiveCartItems] : [],
          serviceName:
            effectiveCartItems[0]?.serviceName || effectiveCartItems[0]?.name || "Home Service",
          totalMRP,
          totalDiscount,
          couponDiscount,
          finalAmount,
          gstAmount,
          gstNo: addGst ? gstNo : null,
          gstName: addGst ? gstName : null,
          bookingDateTime,
          selectedAddress,
          paymentMethod: "COD",
          paymentStatus: "pending",
        };

        try {
          localStorage.setItem("lastConfirmedBooking", JSON.stringify(lastBooking));
          localStorage.removeItem("checkoutSession");
          localStorage.removeItem("bookingDateTime");
          localStorage.removeItem("selectedAddress");
          localStorage.removeItem("cartItems");
        } catch (e) {}

        clearCart();

        Swal.fire({
          icon: "success",
          title: "Booking Confirmed!",
          text: `Your service booking #${orderId} is confirmed with Cash on Delivery.`,
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          router.push(
            bookingId
              ? `/order-confirmation?booking_id=${bookingId}`
              : "/order-confirmation",
          );
        }, 1200);
      } else {
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          text: res.data?.message || "Unable to confirm COD booking. Please try again.",
          confirmButtonColor: "#ff5500",
        });
      }
    } catch (err: any) {
      console.error("COD booking error:", err);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: err?.response?.data?.message || err?.message || "Could not confirm COD booking.",
        confirmButtonColor: "#ff5500",
      });
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // -------------------------------------------------------------
  // ONLINE PAYMENT INITIATION & VERIFICATION
  // -------------------------------------------------------------
  const handleOnlinePayment = async (methodType: PaymentMethodType) => {
    try {
      setLoading(true);
      setLoadingMessage("Initializing secure payment gateway...");

      const token = localStorage.getItem("token");
      if (!token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("redirectAfterLogin", "/checkout-payment");
        }
        window.dispatchEvent(new Event("open-auth-modal"));
        setLoading(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        Swal.fire({
          icon: "error",
          title: "Gateway Unavailable",
          text: "Razorpay SDK could not be loaded. Please check your internet connection.",
          confirmButtonColor: "#ff5500",
        });
        setLoading(false);
        return;
      }

      let addressId = Number(selectedAddress?.id) || 1;
      let formattedDate = new Date().toISOString().split("T")[0];
      if (bookingDateTime?.date) {
        const parts = bookingDateTime.date.split("-");
        if (parts.length === 3) {
          if (parts[0].length === 2 && parts[2].length === 4) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else {
            formattedDate = bookingDateTime.date;
          }
        }
      }

      let razorpayOrderId = "";
      let razorKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.NEXT_PUBLIC_KEY_ID ||
        "rzp_test_TvL5gF2aAKznOU";
      let orderAmount = Math.round(finalAmount * 100);

      // 1. Create order on backend
      try {
        const initOrderRes = await axios.post(
          `${API_BASE_URL}/customers/customer-bookings`,
          {
            date: formattedDate,
            slot_id: Number(bookingDateTime?.slotId || 1),
            customer_notes: bookingDateTime?.notes?.trim() || "Doorstep service request",
            address_id: addressId,
            payment_type: "ONLINE",
            service_category_id: Number(
              effectiveCartItems[0]?.service_category_id ||
                effectiveCartItems[0]?.serviceCategoryId ||
                1,
            ),
            service_id: Number(
              effectiveCartItems[0]?.service_id || effectiveCartItems[0]?.serviceId || 1,
            ),
            gst_no: addGst && gstNo.trim() ? gstNo.trim() : "22AAAAA0000A1Z5",
            gst_name: addGst && gstName.trim() ? gstName.trim() : null,
            razorpay_payment_id: "", // Blank triggers Razorpay Order creation on backend
            state_name: "Chhattisgarh",
            city_name: "Raipur",
            enquiry_source: "web",
            platform_type: "web",
          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (initOrderRes.data?.data?.razorpay_order_id) {
          razorpayOrderId = initOrderRes.data.data.razorpay_order_id;
          if (initOrderRes.data.data.key) {
            razorKey = initOrderRes.data.data.key;
          }
          if (initOrderRes.data.data.amount) {
            orderAmount = initOrderRes.data.data.amount;
          }
        }
      } catch (orderErr) {
        console.warn("Backend order creation warning:", orderErr);
      }

      // Configure Razorpay payment options
      const options: any = {
        key: razorKey,
        amount: orderAmount,
        currency: "INR",
        name: "TASpro Company",
        description: effectiveCartItems[0]?.name || "Home Service Booking",
        image: "https://files.catbox.moe/l742u1.png",
        prefill: {
          name: customerName,
          contact: customerMobile.replace(/\s+/g, ""),
          email: customerEmail,
        },
        theme: {
          color: "#FFA05C",
          backdrop_color: "rgba(0, 0, 0, 0.65)",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setLoadingMessage("");
          },
        },
        handler: async function (response: any) {
          console.log("PAYMENT SUCCESS CALLBACK:", response);
          if (response?.razorpay_payment_id) {
            // Verify payment and complete booking on backend
            try {
              setLoading(true);
              setLoadingMessage("Verifying payment and finalizing booking...");

              const verifyPayload = {
                date: formattedDate,
                slot_id: Number(bookingDateTime?.slotId || 1),
                customer_notes: bookingDateTime?.notes?.trim() || "Doorstep service request",
                address_id: addressId,
                payment_type: "ONLINE",
                gst_no: addGst && gstNo.trim() ? gstNo.trim() : "22AAAAA0000A1Z5",
                gst_name: addGst && gstName.trim() ? gstName.trim() : null,
                pan_no: "ABCDE1234F",
                service_category_id: Number(
                  effectiveCartItems[0]?.service_category_id ||
                    effectiveCartItems[0]?.serviceCategoryId ||
                    1,
                ),
                service_id: Number(
                  effectiveCartItems[0]?.service_id || effectiveCartItems[0]?.serviceId || 1,
                ),
                razorpay_payment_id: response.razorpay_payment_id,
                state_name: "Chhattisgarh",
                city_name: "Raipur",
                enquiry_source: "web",
                platform_type: "web",
              };

              const finalizeRes = await axios.post(
                `${API_BASE_URL}/customers/customer-bookings`,
                verifyPayload,
                {
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              const bookingObj =
                finalizeRes.data?.data?.booking ||
                (finalizeRes.data?.data?.booking_no ? finalizeRes.data?.data : null);

              const bookingId =
                bookingObj?.id || finalizeRes.data?.data?.booking_id || finalizeRes.data?.data?.id;
              const orderId =
                bookingObj?.booking_no ||
                finalizeRes.data?.data?.order_id ||
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
                items: effectiveCartItems.length > 0 ? [...effectiveCartItems] : [],
                serviceName:
                  effectiveCartItems[0]?.serviceName || effectiveCartItems[0]?.name || "Home Service",
                totalMRP,
                totalDiscount,
                couponDiscount,
                finalAmount,
                gstAmount,
                gstNo: addGst ? gstNo : null,
                gstName: addGst ? gstName : null,
                bookingDateTime,
                selectedAddress,
                paymentMethod: "ONLINE",
                paymentStatus: "success",
                razorpayPaymentId: response.razorpay_payment_id,
              };

              try {
                localStorage.setItem("lastConfirmedBooking", JSON.stringify(lastBooking));
                localStorage.removeItem("checkoutSession");
                localStorage.removeItem("bookingDateTime");
                localStorage.removeItem("selectedAddress");
                localStorage.removeItem("cartItems");
              } catch (e) {}

              clearCart();

              Swal.fire({
                icon: "success",
                title: "Payment Successful!",
                text: `Transaction ID: ${response.razorpay_payment_id}. Your booking #${orderId} is confirmed.`,
                timer: 2000,
                showConfirmButton: false,
              });

              setTimeout(() => {
                router.push(
                  bookingId
                    ? `/order-confirmation?booking_id=${bookingId}`
                    : "/order-confirmation",
                );
              }, 1200);
            } catch (finErr: any) {
              console.error("Booking finalization error:", finErr);
              Swal.fire({
                icon: "error",
                title: "Booking Recording Error",
                text: "Payment was captured, but booking confirmation encountered an error. Support will assist you.",
                confirmButtonColor: "#ff5500",
              });
            }
          }
        },
      };

      if (razorpayOrderId) {
        options.order_id = razorpayOrderId;
      }

      // Prefill specific payment method based on active tab
      if (methodType === "upi" || methodType === "qr") {
        options.prefill.method = "upi";
        if (upiId && upiId.includes("@")) {
          options.prefill.vpa = upiId.trim();
        }
      } else if (methodType === "card") {
        options.prefill.method = "card";
      } else if (methodType === "netbanking") {
        options.prefill.method = "netbanking";
      } else if (methodType === "wallet") {
        options.prefill.method = "wallet";
      } else if (methodType === "emi") {
        options.prefill.method = "emi";
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (failRes: any) {
        console.error("Payment failed:", failRes?.error);
        setLoading(false);
        setLoadingMessage("");
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: failRes?.error?.description || "Transaction failed or was declined.",
          confirmButtonColor: "#ff5500",
        });
      });

      rzp.open();
    } catch (err: any) {
      console.error("Payment gateway launch error:", err);
      setLoading(false);
      setLoadingMessage("");
      Swal.fire({
        icon: "error",
        title: "Payment Error",
        text: err?.message || "Failed to initialize payment gateway.",
        confirmButtonColor: "#ff5500",
      });
    }
  };

  // Payment navigation method items
  const paymentMethodsList = [
    {
      id: "upi" as PaymentMethodType,
      name: "UPI",
      subtitle: "Google Pay, PhonePe, Paytm, Any UPI ID",
      icon: Smartphone,
      badge: "Fastest",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      id: "qr" as PaymentMethodType,
      name: "UPI QR",
      subtitle: "Scan QR code via any banking / UPI app",
      icon: QrCode,
      badge: "Instant",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "card" as PaymentMethodType,
      name: "Debit / Credit Cards",
      subtitle: "Visa, MasterCard, RuPay, Maestro",
      icon: CreditCard,
      badge: "All Cards",
      badgeColor: "bg-gray-100 text-gray-700",
    },
    {
      id: "emi" as PaymentMethodType,
      name: "EMI / Pay Later",
      subtitle: "Low cost EMI on major bank cards",
      icon: Percent,
      badge: "Easy EMIs",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      id: "netbanking" as PaymentMethodType,
      name: "Net Banking",
      subtitle: "SBI, HDFC, ICICI, Axis & 50+ Banks",
      icon: Building2,
      badge: "All Banks",
      badgeColor: "bg-gray-100 text-gray-700",
    },
    {
      id: "wallet" as PaymentMethodType,
      name: "Wallet",
      subtitle: "Paytm, PhonePe, Mobikwik, Amazon",
      icon: Wallet,
      badge: "Wallets",
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      id: "cod" as PaymentMethodType,
      name: "Cash on Delivery (COD)",
      subtitle: "Pay cash after service completion",
      icon: Banknote,
      badge: "Doorstep Cash",
      badgeColor: "bg-orange-100 text-[#FF6A00]",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col justify-between">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white px-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-[#FF6A00] rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-bold">Processing Transaction</h3>
          <p className="text-sm text-gray-300 mt-1 max-w-sm text-center">
            {loadingMessage || "Please do not refresh or close this window..."}
          </p>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="w-full 2xl:w-[88%] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/booking-payment")}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Booking</span>
            </button>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* TASpro Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#FF8C33] flex items-center justify-center shadow-xs">
                <span className="text-white font-black text-sm tracking-tighter">T</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-gray-900 group-hover:text-[#FF6A00] transition-colors leading-none">
                  TAS<span className="text-[#FF6A00]">pro</span>
                </span>
                <span className="text-[9px] tracking-widest uppercase font-semibold text-gray-400 leading-none mt-0.5">
                  COMPANY
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span className="hidden sm:inline">256-Bit SSL Secure Gateway</span>
              <span className="sm:hidden">100% Secure</span>
            </div>

            <div className="text-right hidden md:block">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Payable Amount
              </p>
              <p className="text-base font-black text-gray-900 tracking-tight leading-none">
                ₹{finalAmount}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main 3-Column Payment Viewport */}
      <main className="w-full 2xl:w-[88%] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Summary, Customer, Slot & Amount Breakdown */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Price Summary & Payable Card */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6A00] flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="font-bold text-sm text-gray-900">
                    Payment Summary
                  </h2>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                  Order Details
                </span>
              </div>

              {/* Items List snippet */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Booked Service ({effectiveCartItems.length || 1})
                </p>
                {effectiveCartItems.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div className="truncate max-w-[200px]">
                      <span className="font-bold text-gray-800">{item.name || "Home Service"}</span>
                      <span className="text-gray-400 text-[11px] ml-1">x{item.quantity || 1}</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{(item.price || item.discountedPrice || 199) * (item.quantity || 1)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation rows */}
              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total (MRP)</span>
                  <span className="font-semibold text-gray-900">₹{totalMRP}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount Savings</span>
                    <span>-₹{totalDiscount}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 pt-1">
                  <span className="flex items-center gap-1">
                    <span>Taxes (18% GST)</span>
                    <span className="text-[10px] text-gray-400">Included</span>
                  </span>
                  <span className="font-semibold text-gray-700">₹{gstAmount}</span>
                </div>

                {addGst && gstNo && (
                  <div className="bg-orange-50/70 p-2 rounded-lg border border-orange-100 text-[11px] text-orange-800">
                    <span className="font-bold">GSTIN:</span> {gstNo}
                    {gstName && <span className="block text-[10px] text-gray-600">{gstName}</span>}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-gray-900">Final Payable</span>
                    <p className="text-[10px] text-green-700 font-medium">Inclusive of all taxes</p>
                  </div>
                  <span className="text-2xl font-black text-gray-900 tracking-tight">
                    ₹{finalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                Customer &amp; Service Details
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-800">
                  <User className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                  <span className="font-bold">{customerName}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                  <span>{customerMobile}</span>
                </div>

                <div className="flex items-start gap-2 text-gray-600 pt-1 border-t border-gray-100">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6A00] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{addressFormatted}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700 pt-1 border-t border-gray-100">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                  <span>
                    <strong className="text-gray-900">{scheduledDate}</strong> at{" "}
                    <strong className="text-[#FF6A00]">{scheduledTime}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Trust & Guarantee Banner */}
            <div className="bg-gradient-to-br from-orange-50/80 to-amber-50/60 border border-orange-100 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#FF6A00] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>TASpro Trust &amp; Safety</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-gray-600">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-600 shrink-0" />
                  <span>Verified, background-checked technicians</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-600 shrink-0" />
                  <span>30 Days post-service repair warranty</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-600 shrink-0" />
                  <span>Free cancellation up to 2 hours before slot</span>
                </li>
              </ul>
            </div>

          </div>

          {/* ======================================================== */}
          {/* MIDDLE COLUMN: Vertical Payment Method Navigation List  */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="pb-1">
              <h2 className="font-bold text-sm text-gray-900 tracking-tight">
                Select Payment Method
              </h2>
              <p className="text-[11px] text-gray-400">
                Choose an online option or cash on delivery
              </p>
            </div>

            <div className="space-y-2">
              {paymentMethodsList.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedMethod === method.id;

                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-[#FF6A00] bg-orange-50/40 shadow-xs ring-1 ring-orange-200"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#FF6A00] text-white shadow-xs"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-xs sm:text-sm ${
                              isSelected ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {method.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                          {method.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {method.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block ${method.badgeColor}`}
                        >
                          {method.badge}
                        </span>
                      )}

                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-[#FF6A00] bg-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-[#FF6A00]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Dynamic Payment Interface for Active Method*/}
          {/* ======================================================== */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs min-h-[460px] flex flex-col justify-between">
              
              {/* ---------------------------------------------------- */}
              {/* 1. UPI METHOD PANEL                                  */}
              {/* ---------------------------------------------------- */}
              {selectedMethod === "upi" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        Pay with UPI
                      </h3>
                      <p className="text-xs text-gray-400">
                        Select a popular UPI app or enter your UPI ID (VPA)
                      </p>
                    </div>
                    <Smartphone className="w-5 h-5 text-[#FF6A00]" />
                  </div>

                  {/* Popular UPI Apps Quick Select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Popular UPI Apps
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "gpay", name: "Google Pay", icon: "GPay" },
                        { id: "phonepe", name: "PhonePe", icon: "PhonePe" },
                        { id: "paytm", name: "Paytm UPI", icon: "Paytm" },
                        { id: "cred", name: "CRED UPI", icon: "CRED" },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedUpiApp === app.id
                              ? "border-[#FF6A00] bg-orange-50/40 font-bold text-gray-900"
                              : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                          }`}
                        >
                          <div className="w-7 h-7 mx-auto rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-[#FF6A00] mb-1">
                            {app.icon.slice(0, 2)}
                          </div>
                          <span className="text-[11px] block truncate">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual UPI ID Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">
                      Or Enter UPI ID (VPA)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="mobile@upi or username@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                        className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#FF6A00] transition-colors"
                      />
                      {upiId && (
                        <button
                          type="button"
                          onClick={() => setUpiId("")}
                          className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Quick Handle Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-gray-400">Quick handles:</span>
                      {["@oksbi", "@okhdfcbank", "@okaxis", "@ybl", "@paytm"].map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => {
                            const prefix = upiId.includes("@") ? upiId.split("@")[0] : upiId || customerMobile.replace(/\D/g, "");
                            setUpiId(`${prefix}${handle}`);
                          }}
                          className="text-[10px] font-semibold bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-[#FF6A00] px-2 py-0.5 rounded-md transition-colors"
                        >
                          {handle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                      <span>How UPI payment works:</span>
                    </p>
                    <p className="text-[11px] text-gray-500">
                      A payment request of <strong>₹{finalAmount}</strong> will be sent to your UPI app. Approve the payment request to immediately confirm your appointment.
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOnlinePayment("upi")}
                      className="w-full py-4 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>Pay ₹{finalAmount} via UPI</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* 2. UPI QR CODE METHOD PANEL                          */}
              {/* ---------------------------------------------------- */}
              {selectedMethod === "qr" && (
                <div className="space-y-4 animate-fadeIn text-center">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between text-left">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        Scan &amp; Pay with UPI QR
                      </h3>
                      <p className="text-xs text-gray-400">
                        Scan using Google Pay, PhonePe, Paytm, or any UPI app
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                        Expires in {formatTimer(qrTimeLeft)}
                      </span>
                    </div>
                  </div>

                  {/* High Quality Stylized Live QR Box */}
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50/80 rounded-2xl border border-gray-200">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 relative group">
                      {/* Stylized QR Code SVG matching Razorpay checkout */}
                      <svg
                        className="w-48 h-48 sm:w-52 sm:h-52"
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* QR Corners */}
                        <rect x="15" y="15" width="45" height="45" rx="6" fill="#111827" />
                        <rect x="23" y="23" width="29" height="29" rx="3" fill="white" />
                        <rect x="29" y="29" width="17" height="17" rx="2" fill="#FF6A00" />

                        <rect x="140" y="15" width="45" height="45" rx="6" fill="#111827" />
                        <rect x="148" y="23" width="29" height="29" rx="3" fill="white" />
                        <rect x="154" y="29" width="17" height="17" rx="2" fill="#FF6A00" />

                        <rect x="15" y="140" width="45" height="45" rx="6" fill="#111827" />
                        <rect x="23" y="148" width="29" height="29" rx="3" fill="white" />
                        <rect x="29" y="154" width="17" height="17" rx="2" fill="#FF6A00" />

                        {/* QR Pattern Blocks */}
                        <rect x="70" y="15" width="12" height="12" fill="#1F2937" />
                        <rect x="90" y="15" width="12" height="24" fill="#1F2937" />
                        <rect x="110" y="15" width="18" height="12" fill="#1F2937" />
                        <rect x="70" y="35" width="14" height="14" fill="#1F2937" />
                        <rect x="115" y="35" width="12" height="14" fill="#1F2937" />

                        <rect x="15" y="70" width="24" height="12" fill="#1F2937" />
                        <rect x="45" y="70" width="14" height="25" fill="#1F2937" />
                        <rect x="15" y="90" width="12" height="35" fill="#1F2937" />
                        <rect x="35" y="100" width="24" height="12" fill="#1F2937" />

                        <rect x="140" y="70" width="15" height="25" fill="#1F2937" />
                        <rect x="165" y="70" width="20" height="12" fill="#1F2937" />
                        <rect x="170" y="90" width="15" height="35" fill="#1F2937" />
                        <rect x="140" y="110" width="22" height="15" fill="#1F2937" />

                        <rect x="70" y="140" width="14" height="25" fill="#1F2937" />
                        <rect x="90" y="150" width="22" height="14" fill="#1F2937" />
                        <rect x="120" y="140" width="12" height="35" fill="#1F2937" />
                        <rect x="140" y="145" width="45" height="14" fill="#1F2937" />
                        <rect x="140" y="165" width="15" height="20" fill="#1F2937" />
                        <rect x="165" y="165" width="20" height="20" fill="#1F2937" />

                        {/* Center Logo Area */}
                        <circle cx="100" cy="100" r="22" fill="white" />
                        <circle cx="100" cy="100" r="19" fill="#FF6A00" />
                        <text
                          x="100"
                          y="105"
                          fontSize="13"
                          fontWeight="900"
                          fill="white"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          TAS
                        </text>
                      </svg>
                    </div>

                    <p className="font-extrabold text-sm text-gray-900 mt-3">
                      Amount: ₹{finalAmount}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      TASpro Service Private Limited • Verified Merchant
                    </p>
                  </div>

                  {/* App Icons Row */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Supported:
                    </span>
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">GPay</span>
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">PhonePe</span>
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Paytm</span>
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">BHIM</span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOnlinePayment("qr")}
                      className="w-full py-4 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Launch Online QR / Pay ₹{finalAmount}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* 3. DEBIT / CREDIT CARDS METHOD PANEL                */}
              {/* ---------------------------------------------------- */}
              {selectedMethod === "card" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        Debit / Credit Cards
                      </h3>
                      <p className="text-xs text-gray-400">
                        Pay via Visa, MasterCard, RuPay, Maestro &amp; Diners
                      </p>
                    </div>
                    <CreditCard className="w-5 h-5 text-[#FF6A00]" />
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4532  ••••  ••••  ••••"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono tracking-wider outline-none focus:border-[#FF6A00] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Name as printed on card"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:border-[#FF6A00] uppercase transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono tracking-wider outline-none focus:border-[#FF6A00] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          CVV / CVC *
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="3 digits"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono tracking-widest outline-none focus:border-[#FF6A00] transition-colors"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                      />
                      <span className="text-[11px] text-gray-600">
                        Securely save card as per RBI tokenization guidelines
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOnlinePayment("card")}
                      className="w-full py-4 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{finalAmount} Securely</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* 4. EMI METHOD PANEL                                  */}
              {/* ---------------------------------------------------- */}
              {selectedMethod === "emi" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        Credit / Debit Card EMI
                      </h3>
                      <p className="text-xs text-gray-400">
                        Pay in convenient monthly installments
                      </p>
                    </div>
                    <Percent className="w-5 h-5 text-[#FF6A00]" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Select Bank for EMI
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["HDFC Bank", "SBI Card", "ICICI Bank", "Axis Bank", "Kotak", "Other"].map(
                        (bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedEmiBank(bank)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                              selectedEmiBank === bank
                                ? "border-[#FF6A00] bg-orange-50/40 text-gray-900"
                                : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                            }`}
                          >
                            {bank}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Select Tenure
                    </label>
                    <div className="space-y-2">
                      {[
                        { months: 3, rate: "14% p.a." },
                        { months: 6, rate: "15% p.a." },
                        { months: 9, rate: "15% p.a." },
                        { months: 12, rate: "16% p.a." },
                      ].map((plan) => {
                        const monthly = Math.round(finalAmount / plan.months);
                        const isChosen = selectedEmiTenure === plan.months;
                        return (
                          <div
                            key={plan.months}
                            onClick={() => setSelectedEmiTenure(plan.months)}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              isChosen
                                ? "border-[#FF6A00] bg-orange-50/30 font-bold"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div>
                              <span className="font-extrabold text-gray-900">
                                {plan.months} Months
                              </span>
                              <span className="text-gray-400 text-[10px] ml-2">
                                Interest: {plan.rate}
                              </span>
                            </div>
                            <span className="font-black text-gray-900">
                              ₹{monthly}/month
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOnlinePayment("emi")}
                      className="w-full py-4 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>Proceed with {selectedEmiBank} EMI</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* 5. NET BANKING METHOD PANEL                          */}
              {/* ---------------------------------------------------- */}
              {selectedMethod === "netbanking" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        Net Banking
                      </h3>
                      <p className="text-xs text-gray-400">
                        Direct bank transfer through all major Indian banks
                      </p>
                    </div>
                    <Building2 className="w-5 h-5 text-[#FF6A00]" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Popular Banks
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "SBI", name: "State Bank of India" },
                        { id: "HDFC", name: "HDFC Bank" },
                        { id: "ICICI", name: "ICICI Bank" },
                        { id: "AXIS", name: "Axis Bank" },
                        { id: "KOTAK", name: "Kotak Mahindra" },
                        { id: "PNB", name: "Punjab National" },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => {
                            setSelectedBank(bank.id);
                            setOtherBank("");
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedBank === bank.id && !otherBank
                              ? "border-[#FF6A00] bg-orange-50/40 font-bold text-gray-900"
                              : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                          }`}
                        >
                          <span className="block font-black text-sm text-[#FF6A00]">
                            {bank.id}
                          </span>
                          <span className="text-[10px] block truncate text-gray-500 mt-0.5">
                            {bank.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Or Select from All Other Banks
                    </label>
                    <select
                      value={otherBank}
                      onChange={(e) => {
                        setOtherBank(e.target.value);
                        if (e.target.value) setSelectedBank(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#FF6A00] bg-white cursor-pointer"
                    >
                      <option value="">-- Choose from 50+ Banks --</option>
                      <option value="BOB">Bank of Baroda</option>
                      <option value="CANARA">Canara Bank</option>
                      <option value="UNION">Union Bank of India</option>
                      <option value="IDBI">IDBI Bank</option>
                      <option value="YES">Yes Bank</option>
                      <option value="INDUS">IndusInd Bank</option>
                      <option value="FEDERAL">Federal Bank</option>
                      <option value="IDFC">IDFC First Bank</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOnlinePayment("netbanking")}
                      className="w-full py-4 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>Pay ₹{finalAmount} via Net Banking</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* 6. WALLET METHOD PANEL                               */}
              {/* ---------------------------------------------------- */}
              {selectedMethod === "wallet" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        Digital Wallets
                      </h3>
                      <p className="text-xs text-gray-400">
                        Fast checkout with linked digital balance
                      </p>
                    </div>
                    <Wallet className="w-5 h-5 text-[#FF6A00]" />
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { id: "paytm", name: "Paytm Wallet", desc: "Fastest checkout" },
                      { id: "phonepe", name: "PhonePe Wallet", desc: "UPI & wallet balance" },
                      { id: "mobikwik", name: "Mobikwik", desc: "Zip & wallet balance" },
                      { id: "amazon", name: "Amazon Pay", desc: "Pay with Amazon account" },
                      { id: "airtel", name: "Airtel Payments Bank", desc: "Instant mobile banking" },
                    ].map((wallet) => (
                      <div
                        key={wallet.id}
                        onClick={() => setSelectedWallet(wallet.id)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          selectedWallet === wallet.id
                            ? "border-[#FF6A00] bg-orange-50/30 font-bold"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-gray-900 text-sm">
                            {wallet.name}
                          </span>
                          <span className="block text-[11px] text-gray-400 mt-0.5">
                            {wallet.desc}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedWallet === wallet.id
                              ? "border-[#FF6A00] bg-white"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedWallet === wallet.id && (
                            <div className="w-2 h-2 rounded-full bg-[#FF6A00]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOnlinePayment("wallet")}
                      className="w-full py-4 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>Pay ₹{finalAmount} with Wallet</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* 7. CASH ON DELIVERY (COD) METHOD PANEL               */}
              {/* ---------------------------------------------------- */}
              {selectedMethod === "cod" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">
                        Cash on Delivery (COD)
                      </h3>
                      <p className="text-xs text-gray-400">
                        Pay cash directly to technician at doorstep
                      </p>
                    </div>
                    <Banknote className="w-5 h-5 text-green-600" />
                  </div>

                  {/* COD Key Details Card */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero Advance Payment Required</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      You do not need to make any payment right now. Our technician will carry an invoice and collect payment after the service is successfully performed.
                    </p>
                  </div>

                  {/* Instructions Bullet Points */}
                  <div className="space-y-2 text-xs text-gray-600">
                    <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                      Important Instructions:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>
                          Exact payable amount at doorstep:{" "}
                          <strong className="text-gray-900 font-extrabold">₹{finalAmount}</strong>. No extra doorstep surcharge.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>
                          Technician will arrive on{" "}
                          <strong className="text-gray-900">{scheduledDate}</strong> during the{" "}
                          <strong className="text-gray-900">{scheduledTime}</strong> window.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>
                          You may pay via <strong>Cash</strong> or <strong>Technician UPI QR</strong> upon service completion.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>
                          Your booking status will remain <strong>PENDING / UNPAID</strong> until work completion.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Prominent COD Confirmation Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleConfirmCod}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Confirm Booking with Cash on Delivery (₹{finalAmount})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Security & Disclaimer Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>End-to-End SSL Encrypted</span>
                </span>
                <span>Powered by TASpro Secure</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-4 mt-8">
        <div className="w-full 2xl:w-[88%] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} TASpro Company. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-900">Terms of Use</Link>
            <Link href="/privacy-policy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/cancellation-refund" className="hover:text-gray-900">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

