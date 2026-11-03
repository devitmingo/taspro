"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Lock,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Building,
  Check,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import Swal from "sweetalert2";

export default function CheckoutConfirmationPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useBooking();

  // Payment method selection: "ONLINE" or "COD" matching user's screenshot
  const [selectedPayment, setSelectedPayment] = useState<"ONLINE" | "COD">("ONLINE");

  // GST Number & Business Invoice State
  const [addGst, setAddGst] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [gstName, setGstName] = useState("");
  const [gstError, setGstError] = useState("");

  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Booking review data loaded from localStorage
  const [bookingDateTime, setBookingDateTime] = useState<any>({});
  const [selectedAddress, setSelectedAddress] = useState<any>({});

  // GST regex validator for standard Indian GSTIN: 2 digits + 5 chars + 4 digits + 1 char + 1 digit/char + Z + 1 digit/char
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  useEffect(() => {
    loadRazorpayScript();

    if (typeof window !== "undefined") {
      try {
        const savedCoupon = localStorage.getItem("appliedCoupon");
        if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {}

      try {
        const savedDateTime = localStorage.getItem("bookingDateTime");
        if (savedDateTime) setBookingDateTime(JSON.parse(savedDateTime));
      } catch (e) {}

      try {
        const savedAddr = localStorage.getItem("selectedAddress");
        if (savedAddr) setSelectedAddress(JSON.parse(savedAddr));
      } catch (e) {}
    }
  }, []);

  // Price calculations matching exact checkout math
  const rawTotalMRP = cartItems.reduce(
    (sum: number, item: any) =>
      sum +
      (item.originalPrice || item.strike_price || item.price || item.discountedPrice || 0) *
        (item.quantity || 1),
    0,
  );

  const rawTotalAmount = cartItems.reduce(
    (sum: number, item: any) =>
      sum + (item.price || item.discountedPrice || 0) * (item.quantity || 1),
    0,
  );

  const totalMRP = Math.round(rawTotalMRP) || 219;
  const totalAmount = Math.round(rawTotalAmount) || 199;
  const totalDiscount = Math.max(Math.round(totalMRP - totalAmount), 0);
  const couponDiscount = Math.round(appliedCoupon ? appliedCoupon.discount : 0);
  const finalAmount = Math.max(totalAmount - couponDiscount, 0);

  // Estimated GST (18% inclusive calculation)
  const basePriceExcludingGst = Math.round(finalAmount / 1.18);
  const estimatedGst = finalAmount - basePriceExcludingGst;

  // Dynamically load Razorpay SDK
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

  const handleGstChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
    setGstNo(cleaned);
    if (cleaned.length === 15) {
      if (gstRegex.test(cleaned)) {
        setGstError("");
      } else {
        setGstError("Invalid GST format. (e.g. 22AAAAA0000A1Z5)");
      }
    } else if (cleaned.length > 0) {
      setGstError("GSTIN must be 15 characters long");
    } else {
      setGstError("");
    }
  };

  // Final booking creator in Laravel
  const createBooking = async (
    paymentMethod: "ONLINE" | "COD",
    paymentRef: string = "",
  ) => {
    if (paymentMethod === "ONLINE" && (!paymentRef || !paymentRef.startsWith("pay_"))) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Payment Incomplete",
        text: "Please complete your payment through Razorpay to confirm the booking.",
        confirmButtonColor: "#ff5500",
      });
      return;
    }

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

      // Address resolution
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

      const validGstNo = addGst && gstRegex.test(gstNo.trim()) ? gstNo.trim() : null;
      const validGstName = addGst && gstName.trim() ? gstName.trim() : null;

      const payload = {
        date: formattedDate,
        slot_id: Number(bookingDateTime?.slotId || 1),
        customer_notes: bookingDateTime?.notes?.trim() || "Doorstep service request",
        address_id: addressId,
        payment_type: paymentMethod === "COD" ? "COD" : "ONLINE",
        gst_no: validGstNo || "22AAAAA0000A1Z5",
        gst_name: validGstName || (validGstNo ? "Business Client" : null),
        pan_no: "ABCDE1234F",
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

      if (res.data?.status && (bookingObj || paymentMethod === "COD")) {
        const bookingId =
          bookingObj?.id || res.data?.data?.booking_id || res.data?.data?.id;
        const orderId =
          bookingObj?.booking_no ||
          res.data?.data?.order_id ||
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
          finalAmount,
          estimatedGst,
          gstNo: validGstNo,
          gstName: validGstName,
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

        // Redirect directly to Order Confirmation
        router.push(
          bookingId
            ? `/order-confirmation?booking_id=${bookingId}`
            : "/order-confirmation",
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          text: res.data?.message || "Unable to complete booking.",
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

  // Launch Razorpay Payment Gateway directly here on checkout
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

      if (addGst && gstNo.trim() && !gstRegex.test(gstNo.trim())) {
        setLoading(false);
        Swal.fire({
          icon: "warning",
          title: "Invalid GSTIN",
          text: "Please enter a valid 15-character GST number or uncheck GST option.",
          confirmButtonColor: "#ff5500",
        });
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
          if (u.firstName)
            customerName = u.firstName + (u.lastName ? ` ${u.lastName}` : "");
          if (u.mobile || u.phone) customerPhone = u.mobile || u.phone;
          if (u.email) customerEmail = u.email;
        }
      } catch (e) {}

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

      let razorpayOrderId = "";
      let razorKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.NEXT_PUBLIC_KEY_ID ||
        "rzp_test_TvL5gF2aAKznOU";
      let orderAmount = Math.round(finalAmount * 100);

      // Create official Razorpay Order via Backend
      try {
        const validGstNo = addGst && gstRegex.test(gstNo.trim()) ? gstNo.trim() : null;
        const validGstName = addGst && gstName.trim() ? gstName.trim() : null;

        const initOrderRes = await axios.post(
          `${API_BASE_URL}/customers/customer-bookings`,
          {
            date: formattedDate,
            slot_id: Number(bookingDateTime?.slotId || 1),
            customer_notes: bookingDateTime?.notes?.trim() || "Doorstep service request",
            address_id: addressId,
            payment_type: "ONLINE",
            service_category_id: Number(
              cartItems[0]?.service_category_id ||
                cartItems[0]?.serviceCategoryId ||
                1,
            ),
            service_id: Number(
              cartItems[0]?.service_id || cartItems[0]?.serviceId || 1,
            ),
            gst_no: validGstNo || "22AAAAA0000A1Z5",
            gst_name: validGstName || null,
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

      const options: any = {
        key: razorKey,
        amount: orderAmount,
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
            console.log("Razorpay modal dismissed without payment.");
            setLoading(false);
          },
        },
        handler: async function (response: any) {
          console.log("RAZORPAY PAYMENT SUCCESS:", response);
          if (response?.razorpay_payment_id) {
            // ONLY after real verified payment from Razorpay, create the booking!
            await createBooking("ONLINE", response.razorpay_payment_id);
          } else {
            setLoading(false);
            Swal.fire({
              icon: "error",
              title: "Payment Unverified",
              text: "Payment was not verified by Razorpay. Please try again.",
              confirmButtonColor: "#ff5500",
            });
          }
        },
      };

      if (razorpayOrderId) {
        options.order_id = razorpayOrderId;
      }

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", function (failRes: any) {
        console.error("Razorpay Payment Failed:", failRes?.error);
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text:
            failRes?.error?.description ||
            "Transaction failed. Please try another payment method.",
          confirmButtonColor: "#ff5500",
        });
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
    if (selectedPayment === "COD") {
      await createBooking("COD");
      return;
    }

    await handleRazorpayPayment();
  };

  return (
    <div className="w-full min-h-screen bg-white pb-16">
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Top Header: Title & Subtitle */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Checkout
            </h1>
          </div>
          <p className="text-sm text-gray-500 pl-12 max-w-2xl leading-relaxed">
            Choose your preferred payment method to complete your booking. We ensure all transactions are safe and encrypted for your security.
          </p>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Payment Options + GST No + Booking Review */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Payment Options Section */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3.5">
                Payment Options
              </h2>

              <div className="space-y-3">
                
                {/* 1. Online Payment Option */}
                <div
                  onClick={() => setSelectedPayment("ONLINE")}
                  className={`rounded-2xl p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all ${
                    selectedPayment === "ONLINE"
                      ? "border-2 border-[#FF6A00] bg-orange-50/20 shadow-xs"
                      : "border border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        selectedPayment === "ONLINE"
                          ? "bg-[#FF6A00] text-white shadow-xs"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        Online Payment
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        Pay securely via Razorpay, Cards, UPI or Wallets
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedPayment === "ONLINE"
                        ? "border-[#FF6A00] bg-white"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedPayment === "ONLINE" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]" />
                    )}
                  </div>
                </div>

                {/* 2. Cash on Delivery Option */}
                <div
                  onClick={() => setSelectedPayment("COD")}
                  className={`rounded-2xl p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all ${
                    selectedPayment === "COD"
                      ? "border-2 border-[#FF6A00] bg-orange-50/20 shadow-xs"
                      : "border border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        selectedPayment === "COD"
                          ? "bg-[#FF6A00] text-white shadow-xs"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        Cash on Delivery
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        Pay cash after service completion
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedPayment === "COD"
                        ? "border-[#FF6A00] bg-white"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedPayment === "COD" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]" />
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* GST Number / Business Invoice Details Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">
                      Add GST Details (Tax Invoice)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Claim input tax credit by providing your business GSTIN
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addGst}
                    onChange={(e) => setAddGst(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
                </label>
              </div>

              {addGst && (
                <div className="pt-2 space-y-3 border-t border-gray-100 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        GST Number (15 Digits)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={gstNo}
                        onChange={(e) => handleGstChange(e.target.value)}
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm uppercase font-mono tracking-wider outline-none transition-colors ${
                          gstError
                            ? "border-red-400 bg-red-50/20 focus:border-red-500"
                            : gstNo.length === 15 && !gstError
                            ? "border-green-400 bg-green-50/20 focus:border-green-500"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                      />
                      {gstError && (
                        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          <span>{gstError}</span>
                        </p>
                      )}
                      {gstNo.length === 15 && !gstError && (
                        <p className="text-[11px] text-green-700 mt-1 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Valid GSTIN format</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Business / Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TAS Enterprise"
                        value={gstName}
                        onChange={(e) => setGstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-800 font-medium">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Your tax invoice with GSTIN will be sent to your registered email upon booking confirmation.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Details Review Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2.5">
                Service &amp; Delivery Review
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Service Address */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Service Address</p>
                    <p className="text-gray-500 mt-0.5 leading-relaxed">
                      {selectedAddress?.house_number || selectedAddress?.street
                        ? `${selectedAddress?.house_number ? `${selectedAddress.house_number}, ` : ""}${selectedAddress?.street || ""}, ${selectedAddress?.city || "Raipur"}`
                        : "Office No. 201, Altnis Corporate Park, Raipur"}
                    </p>
                  </div>
                </div>

                {/* Scheduled Slot */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Scheduled Date &amp; Time</p>
                    <p className="text-gray-500 mt-0.5 leading-relaxed">
                      {bookingDateTime?.date || "Today"} • {bookingDateTime?.slotName || "Anytime (Standard Slot)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {cartItems.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="font-bold text-gray-700 text-xs mb-2">Booked Services ({cartItems.length}):</p>
                  <div className="space-y-1.5">
                    {cartItems.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-gray-600 bg-gray-50/60 p-2 rounded-lg">
                        <span className="font-semibold text-gray-800 truncate pr-2">
                          {item.name || "Home Service"} ({item.quantity || 1}x)
                        </span>
                        <span className="font-bold text-gray-900 shrink-0">
                          ₹{(item.price || item.discountedPrice || 199) * (item.quantity || 1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Amount Summary Card (Exact match to screenshot) */}
          <div className="lg:col-span-5">
            <div className="bg-[#FAF9F6]/80 sm:bg-gray-50/70 border border-gray-200/90 rounded-2xl p-5 sm:p-6 space-y-5 sticky top-24 shadow-xs">
              
              <h2 className="text-base font-bold text-gray-900">
                Amount Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                
                {/* Total Item */}
                <div className="flex justify-between items-center text-gray-600">
                  <span>Total Item ({cartItems.length || 1})</span>
                  <span className="font-semibold text-gray-900">₹{totalMRP}</span>
                </div>

                {/* Total Discount */}
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-semibold">
                    <span>Total Discount</span>
                    <span>-₹{totalDiscount}</span>
                  </div>
                )}

                {/* Coupon Discount */}
                <div className={`flex justify-between items-center ${couponDiscount > 0 ? "text-green-600 font-bold" : "text-gray-500"}`}>
                  <span>Coupon Discount {appliedCoupon ? `(${appliedCoupon.code})` : ""}</span>
                  <span>{couponDiscount > 0 ? `-₹${couponDiscount}` : "₹0"}</span>
                </div>

                {/* GST Notice Breakdown */}
                <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                  <span>Taxes (18% GST)</span>
                  <span className="font-medium text-gray-700">Included in total</span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-3.5 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-base text-gray-900">Total Amount</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      (Inclusive of all taxes &amp; GST)
                    </p>
                  </div>
                  <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                    ₹{finalAmount}
                  </span>
                </div>

              </div>

              {/* Action Checkout Button */}
              <button
                disabled={loading}
                onClick={handlePay}
                className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#F05A00] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <span>
                    Pay ₹{finalAmount}
                  </span>
                )}
              </button>

              {/* Safe & secure checkout + payment logos */}
              <div className="flex flex-col items-center justify-center gap-2 pt-1 text-center">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Safe &amp; secure checkout</span>
                </div>
                
                {/* Visual payment logos from public/grp.png with fallbacks */}
                <div className="flex items-center justify-center gap-2 opacity-80 pt-1">
                  <img
                    src="/grp.png"
                    alt="Payment Methods"
                    className="h-4 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <img
                    src="/icons/visa.svg"
                    alt="Visa"
                    className="h-4"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <img
                    src="/icons/mastercard.svg"
                    alt="Mastercard"
                    className="h-4"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <img
                    src="/icons/rupay.svg"
                    alt="RuPay"
                    className="h-3.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Easy Cancellation & Verified Provider Trust Badge (Matching screenshot) */}
            <div className="flex items-start gap-2.5 mt-3.5 px-2">
              <img
                src="/tick.png"
                alt="Verified Service Provider"
                className="w-5 h-5 shrink-0 object-contain mt-0.5"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-gray-500 leading-snug">
                Easy Cancellation/Returns, Background Verified Service Provider.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
