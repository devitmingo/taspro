"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import {
  Lock,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Building2,
  Check,
  AlertCircle,
  Clock,
  ChevronDown,
  Edit3,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  Percent,
  Wallet,
  Wrench,
  X,
  RotateCw,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import Swal from "sweetalert2";
import { SelectDateTimeModal } from "@/components/booking-flow/SelectDateTimeModal";

type PaymentMethodType =
  | "upi"
  | "card"
  | "netbanking"
  | "wallet"
  | "emi"
  | "cod";

export default function CheckoutConfirmationPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useBooking();

  // Active payment method option
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("upi");

  const paymentMethodsList = [
    {
      id: "upi" as PaymentMethodType,
      name: "UPI",
      subtitle: "Google Pay, PhonePe, Paytm, QR & UPI ID",
      icon: Smartphone,
      iconColor: "text-orange-600 bg-orange-50 border-orange-200/60",
      tags: ["GPay", "PhonePe", "Paytm", "Scan QR"],
    },
    {
      id: "card" as PaymentMethodType,
      name: "Debit / Credit Cards",
      subtitle: "All Indian and international cards",
      icon: CreditCard,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200/60",
      tags: ["Visa", "Mastercard", "RuPay"],
    },
    {
      id: "netbanking" as PaymentMethodType,
      name: "Net Banking",
      subtitle: "Direct bank payment from 50+ banks",
      icon: Building2,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
      tags: ["HDFC", "SBI", "ICICI", "Axis"],
    },
    {
      id: "wallet" as PaymentMethodType,
      name: "Wallets",
      subtitle: "Pay with digital wallet balance",
      icon: Wallet,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200/60",
      tags: ["Paytm", "PhonePe", "Amazon"],
    },
    {
      id: "emi" as PaymentMethodType,
      name: "EMI / Pay Later",
      subtitle: "Monthly installments on cards",
      icon: Percent,
      iconColor: "text-rose-600 bg-rose-50 border-rose-200/60",
      tags: ["Cardless", "Low Cost EMI"],
    },
    {
      id: "cod" as PaymentMethodType,
      name: "Cash on Delivery (COD)",
      subtitle: "Pay in cash or UPI to technician after service",
      icon: Banknote,
      iconColor: "text-teal-700 bg-teal-50 border-teal-200/60",
      tags: ["Zero Advance", "Pay at Doorstep"],
    },
  ];

  // Payment method selection: "ONLINE" or "COD"
  const [selectedPayment, setSelectedPayment] = useState<"ONLINE" | "COD">("ONLINE");

  // GST State
  const [addGst, setAddGst] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [gstName, setGstName] = useState("");
  const [gstError, setGstError] = useState("");
  const [gstSaved, setGstSaved] = useState(false);

  // Enriched cart items for consistent problem images, subtitles & warranties
  const [enrichedCartItems, setEnrichedCartItems] = useState<any[]>([]);

  // COD OTP Confirmation States
  const [showCodOtpModal, setShowCodOtpModal] = useState(false);
  const [codPhone, setCodPhone] = useState("");
  const [codOtpDigits, setCodOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [codOtpError, setCodOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Address and Slot confirmation states
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [availableAddresses, setAvailableAddresses] = useState<any[]>([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [bookingDateTime, setBookingDateTime] = useState<any>({});
  const [userData, setUserData] = useState<any>(null);

  const handleDateTimeChange = (
    date: string,
    time: string,
    notes: string,
    slotId?: number
  ) => {
    const updated = {
      date,
      time,
      slotName: time,
      timeSlot: time,
      slot_time: time,
      notes,
      slotId: Number(slotId || 1),
    };
    setBookingDateTime(updated);
    try {
      localStorage.setItem("bookingDateTime", JSON.stringify(updated));
      localStorage.setItem("selectedSlotId", String(slotId || 1));
    } catch (e) { }
    setShowDateTimeModal(false);
  };

  // Standard Indian GST regex (15 chars)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const getCityName = (city: any) => {
    if (!city) return "Raipur";
    if (typeof city === "object") return city.name || city.cityName || "Raipur";
    return String(city);
  };

  const getStateName = (state: any) => {
    if (!state) return "Chhattisgarh";
    if (typeof state === "object") return state.name || state.stateName || "Chhattisgarh";
    return String(state);
  };

  const getAddressName = (addr: any) => {
    if (!addr) return userData?.name || userData?.firstName || "Amit Jaiswal";
    if (addr.name && typeof addr.name === "string") return addr.name;
    if (addr.first_name) return `${addr.first_name} ${addr.last_name || ""}`.trim();
    return userData?.name || userData?.firstName || "Amit Jaiswal";
  };

  useEffect(() => {
    loadRazorpayScript();

    if (typeof window !== "undefined") {
      try {
        const savedCoupon = localStorage.getItem("appliedCoupon");
        if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) { }

      try {
        const savedDateTime = localStorage.getItem("bookingDateTime");
        if (savedDateTime) setBookingDateTime(JSON.parse(savedDateTime));
      } catch (e) { }

      try {
        const savedAddr = localStorage.getItem("selectedAddress");
        if (savedAddr) setSelectedAddress(JSON.parse(savedAddr));
      } catch (e) { }

      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUserData(JSON.parse(savedUser));
      } catch (e) { }

      // Restore saved GST details if previously entered & saved
      try {
        const savedGst = localStorage.getItem("saved_gst");
        if (savedGst) {
          const parsed = JSON.parse(savedGst);
          if (parsed.gstNo) {
            setGstNo(parsed.gstNo);
            setGstName(parsed.gstName || "");
            setAddGst(true);
            setGstSaved(true);
          }
        }
      } catch (e) { }

      // Fetch customer addresses for address confirmation & switching
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .get(`${API_BASE_URL}/customers/customer-addresses`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          })
          .then((res) => {
            if (res.data?.data?.length > 0) {
              setAvailableAddresses(res.data.data);
              setSelectedAddress((prev: any) => prev?.id ? prev : res.data.data[0]);
            }
          })
          .catch((err) => console.log("Address fetch error:", err));
      }
    }
  }, []);

  // Enrich cart items dynamically from API to guarantee exact problem image, subtitle and warranty
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setEnrichedCartItems([]);
      return;
    }

    const enrichItems = async () => {
      try {
        const serviceId = cartItems[0]?.service_id || cartItems[0]?.serviceId || 1;
        const res = await axios.get(
          `${API_BASE_URL}/service?service_id=${serviceId}&state_name=Chhattisgarh&city_name=Raipur`
        );
        const issues = res.data?.data?.issues || [];
        const subCats = res.data?.data?.sub_categories || res.data?.data?.subServices || [];
        const subCatMap: Record<string, string> = {};
        subCats.forEach((sc: any) => {
          const scId = sc.id ?? sc.sub_category_id;
          const scName = sc.name ?? sc.sub_category_name;
          if (scId && scName) subCatMap[String(scId)] = scName;
        });

        const issueMap: Record<string, any> = {};
        issues.forEach((iss: any) => {
          if (iss?.id) issueMap[String(iss.id)] = iss;
        });

        const merged = cartItems.map((item: any) => {
          const issue = issueMap[String(item.id)] || {};
          const subCatName =
            item.subCategoryName ||
            item.sub_category_name ||
            subCatMap[String(issue.service_sub_category_id || item.service_sub_category_id)] ||
            issue.service_sub_category?.name ||
            item.subService ||
            "Split AC";

          let baseName = item.baseName || issue.name || item.name || "Service";
          const match = baseName.match(/^(.*?)\s*\((.*?)\)$/);
          if (match) {
            baseName = match[1].trim();
          }

          const rawImg =
            issue.icon_url ||
            issue.icon ||
            item.image ||
            item.icon_url ||
            item.icon;

          return {
            ...item,
            baseName,
            subCategoryName: subCatName,
            sub_category_name: subCatName,
            warrantyDays:
              issue.warranty_days ??
              item.warrantyDays ??
              item.warranty_days ??
              15,
            image: rawImg,
            price: Number(item.price || item.discountedPrice || issue.final_price || 199),
            originalPrice: Number(
              item.originalPrice ||
                issue.strike_price ||
                Math.round((item.price || 199) * 1.15)
            ),
          };
        });

        setEnrichedCartItems(merged);
      } catch (e) {
        setEnrichedCartItems(cartItems);
      }
    };

    enrichItems();
  }, [cartItems]);

  // Timer countdown for COD OTP modal
  useEffect(() => {
    let interval: any = null;
    if (showCodOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showCodOtpModal, otpTimer]);

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

  // Exact 18% GST breakdown
  const basePriceExcludingGst = Math.round(finalAmount / 1.18);
  const gstAmount = Math.max(finalAmount - basePriceExcludingGst, 0);

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

  const getServiceImage = (item: any) => {
    const raw = item?.image || item?.icon_url || item?.icon;
    if (!raw || typeof raw !== "string" || raw.trim() === "") return "/tas.logo.png";
    if (!raw.includes("/") && !raw.startsWith("http")) {
      const host = API_BASE_URL.replace(/\/api\/?$/, "");
      return `${host}/storage/service-issues/${raw}`;
    }
    return getImageUrl(raw, "/tas.logo.png");
  };

  const getDisplayDetails = (item: any) => {
    let baseName = item?.baseName || item?.name || "Service";
    let subCat =
      item?.subCategoryName ||
      item?.sub_category_name ||
      item?.subService ||
      "";

    const match = baseName.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      baseName = match[1].trim();
      if (!subCat) subCat = match[2].trim();
    }

    if (!subCat) {
      subCat = "Split AC";
    }

    return { baseName, subCat };
  };

  const handleSaveGst = () => {
    const trimmedNo = gstNo.trim().toUpperCase();
    if (!trimmedNo) {
      setGstError("Please enter 15-character GST number");
      return;
    }
    if (!gstRegex.test(trimmedNo)) {
      setGstError("Invalid GST format. (e.g. 22AAAAA0000A1Z5)");
      return;
    }
    setGstError("");
    setGstNo(trimmedNo);
    setGstSaved(true);
    try {
      localStorage.setItem(
        "saved_gst",
        JSON.stringify({
          gstNo: trimmedNo,
          gstName: gstName.trim(),
        })
      );
    } catch (e) { }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "GST Saved Successfully",
      text: "Your GSTIN has been saved for tax invoice.",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // Trigger COD OTP verification modal
  const handleInitiateCodOtp = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("redirectAfterLogin", "/booking-payment");
      }
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }

    if (!cartItems.length) {
      Swal.fire({
        icon: "warning",
        title: "Cart Empty",
        text: "Your cart is empty. Please add a service first.",
        confirmButtonColor: "#ff5500",
      });
      return;
    }

    let customerPhone =
      userData?.mobile ||
      userData?.phone ||
      selectedAddress?.contact_number ||
      selectedAddress?.phone ||
      "";
    if (customerPhone) {
      customerPhone = customerPhone.replace(/\D/g, "").slice(-10);
    }
    if (!customerPhone || customerPhone.length !== 10) {
      customerPhone = "7812991993";
    }

    setCodPhone(customerPhone);
    setCodOtpDigits(["", "", "", ""]);
    setCodOtpError("");
    setOtpTimer(30);
    setCanResendOtp(false);
    setShowCodOtpModal(true);

    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 150);

    try {
      setOtpSending(true);
      await axios.post(`${API_BASE_URL}/customers/send-otp`, {
        country_id: 1,
        mobile: customerPhone,
      });
    } catch (e: any) {
      console.warn("COD OTP send error/notice:", e?.response?.data || e);
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendCodOtp = async () => {
    if (!codPhone) return;
    try {
      setOtpSending(true);
      setCodOtpError("");
      setOtpTimer(30);
      setCanResendOtp(false);
      setCodOtpDigits(["", "", "", ""]);

      const res = await axios.post(`${API_BASE_URL}/customers/send-otp`, {
        country_id: 1,
        mobile: codPhone,
      });

      if (res.data?.status) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "New OTP Sent Successfully",
          showConfirmButton: false,
          timer: 2000,
        });
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      } else {
        setCodOtpError(res.data?.message || "Failed to resend OTP.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not resend OTP. Please try again.";
      setCodOtpError(msg);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyCodOtpAndBook = async (explicitOtp?: string) => {
    const fullOtp = typeof explicitOtp === "string" ? explicitOtp : codOtpDigits.join("");
    if (fullOtp.length !== 4) {
      setCodOtpError("Please enter the complete 4-digit OTP.");
      return;
    }

    try {
      setOtpVerifying(true);
      setCodOtpError("");

      const res = await axios.post(`${API_BASE_URL}/customers/verify-otp`, {
        country_id: 1,
        mobile: codPhone,
        otp: fullOtp,
      });

      if (res.data?.status) {
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
        setShowCodOtpModal(false);
        await createBooking("COD");
      } else {
        setCodOtpError(res.data?.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      console.error("COD Verify OTP Error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        "Invalid or expired OTP. Please check the code and try again.";
      setCodOtpError(msg);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleCodOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (codOtpError) setCodOtpError("");

    const newDigits = [...codOtpDigits];
    newDigits[index] = value.slice(-1);
    setCodOtpDigits(newDigits);

    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    const fullOtp = newDigits.join("");
    if (fullOtp.length === 4) {
      handleVerifyCodOtpAndBook(fullOtp);
    }
  };

  const handleCodOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codOtpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (codOtpError) setCodOtpError("");
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pastedData) return;

    const newDigits = ["", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setCodOtpDigits(newDigits);
    const nextIdx = Math.min(pastedData.length, 3);
    otpInputsRef.current[nextIdx]?.focus();

    if (pastedData.length === 4) {
      handleVerifyCodOtpAndBook(pastedData);
    }
  };

  const handleGstChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
    setGstNo(cleaned);
    setGstSaved(false);
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
        alt_mobile: selectedAddress?.alt_contact_number || selectedAddress?.altPhone || userData?.alt_mobile || null,
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
          couponCode: appliedCoupon?.code || null,
          finalAmount,
          gstAmount,
          gstNo: validGstNo,
          gstName: validGstName,
          bookingDateTime,
          selectedAddress,
          altPhone: selectedAddress?.alt_contact_number || selectedAddress?.altPhone || userData?.alt_mobile || "",
          paymentMethod,
        };

        try {
          localStorage.setItem("lastConfirmedBooking", JSON.stringify(lastBooking));
        } catch (e) { }

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
  const handleRazorpayPayment = async (methodType: PaymentMethodType = selectedMethod) => {
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

      let customerName = userData?.name || userData?.firstName || "Customer";
      let customerPhone =
        userData?.mobile ||
        userData?.phone ||
        selectedAddress?.contact_number ||
        selectedAddress?.phone ||
        "";
      if (customerPhone) {
        customerPhone = customerPhone.replace(/\D/g, "").slice(-10);
      }
      if (!customerPhone || customerPhone.length !== 10) {
        customerPhone = "7812991993";
      }
      let customerEmail = userData?.email || "customer@tascompany.in";

      let addressId = Number(selectedAddress?.id);
      if (!addressId || isNaN(addressId)) {
        addressId = 1;
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

      // Helper to check if an order_id is an authentic Razorpay order ID (must start with order_ and contain letters, not PHP numeric fallback)
      const isRealRazorpayOrderId = (id?: string) =>
        Boolean(
          id &&
          typeof id === "string" &&
          /^order_[a-zA-Z0-9]{14,}$/.test(id) &&
          /[a-zA-Z]/.test(id.replace("order_", ""))
        );

      // 1. Create official Razorpay Order via Next.js backend API
      try {
        const orderRes = await axios.post("/api/razorpay/create-order", {
          amount: orderAmount,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: {
            service_name: cartItems[0]?.name || "Home Service Booking",
            customer_name: customerName,
            customer_phone: customerPhone,
          },
        });

        if (orderRes.data?.status && isRealRazorpayOrderId(orderRes.data?.order_id)) {
          razorpayOrderId = orderRes.data.order_id;
          if (orderRes.data.key) {
            razorKey = orderRes.data.key;
          }
          if (orderRes.data.amount) {
            orderAmount = orderRes.data.amount;
          }
        }
      } catch (orderErr) {
        console.warn("Direct Razorpay order creation notice:", orderErr);
      }

      // 2. Only if direct Razorpay order wasn't obtained, check backend order attempt
      if (!razorpayOrderId) {
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

          if (initOrderRes.data?.data?.razorpay_order_id && isRealRazorpayOrderId(initOrderRes.data.data.razorpay_order_id)) {
            razorpayOrderId = initOrderRes.data.data.razorpay_order_id;
            if (initOrderRes.data.data.key) {
              razorKey = initOrderRes.data.data.key;
            }
            if (initOrderRes.data.data.amount) {
              orderAmount = initOrderRes.data.data.amount;
            }
          }
        } catch (orderErr) {
          console.warn("Backend order notification notice:", orderErr);
        }
      }

      let rzpMethod: string | undefined = undefined;
      if (methodType === "upi") rzpMethod = "upi";
      else if (methodType === "card") rzpMethod = "card";
      else if (methodType === "netbanking") rzpMethod = "netbanking";
      else if (methodType === "wallet") rzpMethod = "wallet";
      else if (methodType === "emi") rzpMethod = "emi";

      const prefillData: any = {
        name: customerName,
        contact: customerPhone,
        email: customerEmail,
      };

      if (rzpMethod) {
        prefillData.method = rzpMethod;
      }

      const options: any = {
        key: razorKey,
        amount: orderAmount,
        currency: "INR",
        name: "TASpro Company",
        description: cartItems[0]?.name || "Home Service Booking",
        prefill: prefillData,
        theme: {
          color: "#ffffff",
          backdrop_color: "rgba(0, 0, 0, 0.65)",
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

      // Only pass order_id if it is a real verified Razorpay order
      if (isRealRazorpayOrderId(razorpayOrderId)) {
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
    if (selectedMethod === "cod") {
      handleInitiateCodOtp();
      return;
    }

    await handleRazorpayPayment(selectedMethod);
  };

  const displayItems = enrichedCartItems.length > 0 ? enrichedCartItems : cartItems;

  return (
    <div className="w-full min-h-screen bg-[#FDFCFB] pb-20">
      <main className="w-full 2xl:w-[85%] mx-auto px-4 sm:px-5 py-6 sm:py-8">

            {/* Top Header: Title & Subtitle */}
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">
                Checkout &amp; Confirmation
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
                Review your service address, appointment slot, GST invoice details, and choose your payment method to complete checkout.
              </p>
            </div>

            {/* 2-Column Checkout Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* LEFT COLUMN: Service Address -> Service Details -> Time Slot -> GST -> Payment Options */}
              <div className="lg:col-span-8 space-y-5">

                {/* 1. SERVICE ADDRESS CONFIRMATION CARD */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                          1. Service Address Confirmation
                        </h2>
                        <p className="text-[11px] text-gray-400">
                          Service will be provided at this address
                        </p>
                      </div>
                    </div>

                    {availableAddresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressPicker(!showAddressPicker)}
                        className="text-xs font-bold text-[#FF6A00] hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                    )}
                  </div>

                  {/* Selected Address Display */}
                  <div className="pt-3.5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-gray-900">
                            {getAddressName(selectedAddress)}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#FF6A00] px-2 py-0.5 rounded-full">
                            {selectedAddress?.type || "Home"}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed max-w-lg">
                          {selectedAddress?.house_number ? `${selectedAddress.house_number}, ` : ""}
                          {selectedAddress?.street ? `${selectedAddress.street}, ` : ""}
                          {selectedAddress?.landmark ? `Near ${selectedAddress.landmark}, ` : ""}
                          {getCityName(selectedAddress?.city)}, {getStateName(selectedAddress?.state)}
                          {selectedAddress?.postal_code ? ` - ${selectedAddress.postal_code}` : ""}
                        </p>

                        <p className="text-xs text-gray-500 font-medium">
                          Phone: <span className="font-semibold text-gray-800">{selectedAddress?.mobile || selectedAddress?.phone || userData?.mobile || userData?.phone || "+91 7812991993"}</span>
                        </p>
                      </div>

                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    {/* Address Selector Drawer / List */}
                    {showAddressPicker && availableAddresses.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
                        <p className="text-xs font-bold text-gray-700">Select Another Address:</p>
                        <div className="space-y-2">
                          {availableAddresses.map((addr: any) => (
                            <div
                              key={addr.id}
                              onClick={() => {
                                setSelectedAddress(addr);
                                setShowAddressPicker(false);
                                try {
                                  localStorage.setItem("selectedAddress", JSON.stringify(addr));
                                } catch (e) { }
                              }}
                              className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${selectedAddress?.id === addr.id
                                  ? "border-[#FF6A00] bg-orange-50/30 font-semibold"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                            >
                              <div>
                                <span className="font-bold text-gray-900 uppercase mr-2">[{addr.type || "Address"}]</span>
                                <span className="text-gray-600">
                                  {addr.house_number ? `${addr.house_number}, ` : ""}
                                  {addr.street ? `${addr.street}, ` : ""}
                                  {getCityName(addr.city)}
                                </span>
                              </div>
                              {selectedAddress?.id === addr.id && (
                                <Check className="w-4 h-4 text-[#FF6A00]" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SERVICE DETAILS CARD (PLACED BELOW SERVICE ADDRESS) */}
                {cartItems.length > 0 && (
                  <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4">
                    <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                          <Wrench className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                            Service Details
                          </h2>
                          <p className="text-[11px] text-gray-400">
                            Selected service items and warranty details
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#FF6A00] bg-orange-50 border border-orange-200/70 px-3 py-1 rounded-full">
                        {cartItems.length} {cartItems.length === 1 ? "Service" : "Services"}
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {displayItems.map((item: any, idx: number) => {
                        const { baseName, subCat } = getDisplayDetails(item);
                        const qty = item.quantity || 1;
                        const itemPrice = Math.round(Number(item.price || item.discountedPrice || 199));
                        const itemOriginalPrice = Math.round(
                          Number(item.originalPrice || Math.round(itemPrice * 1.15))
                        );
                        const discountPercent =
                          itemOriginalPrice > itemPrice
                            ? Math.round(((itemOriginalPrice - itemPrice) / itemOriginalPrice) * 100)
                            : 0;
                        const warrantyDays = item.warrantyDays || item.warranty_days || 15;

                        return (
                          <div
                            key={item.id || idx}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                              idx > 0 ? "pt-4" : ""
                            } ${idx < displayItems.length - 1 ? "pb-4" : ""}`}
                          >
                            {/* Left: Problem Image + Title & Subtitle + Warranty Badge + Qty */}
                            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-orange-50/50 border border-orange-100/80 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                                <img
                                  src={getServiceImage(item)}
                                  alt={baseName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/tas.logo.png";
                                  }}
                                />
                              </div>

                              <div className="min-w-0 space-y-1">
                                <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                                  {baseName}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">
                                  {subCat}
                                </p>

                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  <span className="inline-flex items-center gap-1 bg-orange-50 text-[#FF6A00] border border-orange-200/70 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>{warrantyDays} Days Warranty</span>
                                  </span>

                                  <span className="inline-flex items-center text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200/80 px-2.5 py-0.5 rounded-lg">
                                    Qty: {qty}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Pricing */}
                            <div className="text-right sm:text-right shrink-0 self-end sm:self-center pl-2">
                              <div className="flex sm:flex-col items-baseline sm:items-end justify-end gap-2 sm:gap-0.5">
                                <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                                  ₹{itemPrice * qty}
                                </span>
                                {itemOriginalPrice > itemPrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{itemOriginalPrice * qty}
                                  </span>
                                )}
                              </div>
                              {discountPercent > 0 && (
                                <span className="inline-block mt-0.5 text-[10px] font-extrabold text-green-700 bg-green-50 border border-green-200/80 px-1.5 py-0.5 rounded">
                                  {discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. TIME SLOT CONFIRMATION CARD */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                          2. Scheduled Time Slot Confirmation
                        </h2>
                        <p className="text-[11px] text-gray-400">
                          Confirmed appointment date and time for technician visit
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDateTimeModal(true)}
                        className="text-xs font-bold text-[#FF6A00] hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-3 p-3 bg-gray-50/70 border border-gray-100 rounded-xl">
                      <Clock className="w-4 h-4 text-[#FF6A00] shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Scheduled Date</p>
                        <p className="font-bold text-sm text-gray-900 mt-0.5">
                          {bookingDateTime?.date || "Today"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50/70 border border-gray-100 rounded-xl">
                      <Sparkles className="w-4 h-4 text-[#FF6A00] shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time Slot</p>
                        <p className="font-bold text-sm text-gray-900 mt-0.5">
                          {bookingDateTime?.time ||
                            bookingDateTime?.slotName ||
                            bookingDateTime?.timeSlot ||
                            bookingDateTime?.slot_time ||
                            bookingDateTime?.slot ||
                            "Anytime (Standard Slot)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {bookingDateTime?.notes && (
                    <div className="mt-2.5 text-[11px] text-gray-500 bg-orange-50/40 p-2.5 rounded-lg border border-orange-100">
                      <span className="font-bold text-gray-700">Special Instructions:</span> {bookingDateTime.notes}
                    </div>
                  )}
                </div>

                {/* 3. GST DETAILS CARD (ADD GST NO. FOR TAX INVOICE) */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                          3. GST Details (Tax Invoice)
                        </h2>
                        <p className="text-[11px] text-gray-400">
                          Add registered GSTIN to claim 18% input tax credit for your business
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={addGst}
                        onChange={(e) => {
                          setAddGst(e.target.checked);
                          if (!e.target.checked) setGstSaved(false);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
                    </label>
                  </div>

                  {addGst && (
                    <div className="pt-2 space-y-3 border-t border-gray-100 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            GST Number (15 Digits) *
                          </label>
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="e.g. 22AAAAA0000A1Z5"
                            value={gstNo}
                            onChange={(e) => {
                              handleGstChange(e.target.value);
                              setGstSaved(false);
                            }}
                            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm uppercase font-mono tracking-wider outline-none transition-colors ${gstError
                                ? "border-red-400 bg-red-50/20 focus:border-red-500"
                                : gstNo.length === 15 && !gstError
                                  ? "border-green-400 bg-green-50/20 focus:border-green-500"
                                  : "border-gray-300 focus:border-orange-500"
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
                              <span>Valid GSTIN format (18% input credit eligible)</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Registered Company / Business Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. TAS Technologies Pvt Ltd"
                            value={gstName}
                            onChange={(e) => {
                              setGstName(e.target.value);
                              setGstSaved(false);
                            }}
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Dedicated Save Button for GST */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px]">
                          {gstSaved ? (
                            <span className="text-green-700 font-bold flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>GST details saved &amp; ready for tax invoice</span>
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Click Save to confirm GSTIN for this booking
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleSaveGst}
                          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            gstSaved
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-[#FF6A00] hover:bg-[#E05500] text-white active:scale-95"
                          }`}
                        >
                          {gstSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <span>Save GST</span>
                          )}
                        </button>
                      </div>

                      <div className="bg-orange-50/60 border border-orange-200/60 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-orange-800 font-medium">
                        <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>Your B2B tax invoice with GSTIN will be sent to your registered email upon booking confirmation.</span>
                      </div>
                    </div>
                  )}
                </div>

            {/* 4. PAYMENT METHOD SECTION */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all space-y-4">
              <div className="flex items-center gap-2.5 pb-3.5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                    4. Select Payment Method
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Choose an option below — it will be opened directly in the secure payment gateway
                  </p>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {paymentMethodsList.map((method) => {
                  const IconComponent = method.icon;
                  const isSelected = selectedMethod === method.id;
                  const isCod = method.id === "cod";

                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between ${
                        isCod ? "sm:col-span-2" : ""
                      } ${
                        isSelected
                          ? "border-[#FF6A00] bg-orange-50/25 shadow-xs ring-1 ring-[#FF6A00]/25"
                          : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/40 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all border ${method.iconColor}`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <span
                            className={`font-bold text-xs sm:text-sm block tracking-tight ${
                              isSelected ? "text-gray-900 font-extrabold" : "text-gray-800"
                            }`}
                          >
                            {method.name}
                          </span>
                          <span className="text-[11px] text-gray-400 block truncate">
                            {method.subtitle}
                          </span>

                          {/* Subtle sleek tags */}
                          {method.tags && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              {method.tags.map((t: string) => (
                                <span
                                  key={t}
                                  className="text-[9px] font-semibold text-gray-600 bg-gray-50 border border-gray-200/70 rounded px-1.5 py-0.5 tracking-tight"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3 pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-[#FF6A00] bg-[#FF6A00]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informational reassurance banner for COD */}
              {selectedMethod === "cod" && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-900">
                      Zero Advance Payment Required (Cash on Delivery)
                    </p>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      You do not need to make any payment online right now. Our technician will carry an invoice and collect ₹{finalAmount} in cash or UPI QR after the service is completed at your doorstep.
                    </p>
                  </div>
                </div>
              )}
            </div>

              </div>

              {/* RIGHT COLUMN: Sticky Fixed Amount Summary Card */}
              <div className="lg:col-span-4 relative">
                <div className="lg:sticky lg:top-24 space-y-3.5">
                  <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">

                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h2 className="text-base font-bold text-gray-900">
                        Amount Summary
                      </h2>
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Final Checkout
                      </span>
                    </div>

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

                      {/* Taxes & GST line */}
                      <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                        <span className="flex items-center gap-1">
                          <span>Taxes (18% GST)</span>
                          <span className="text-[10px] text-gray-400">Included</span>
                        </span>
                        <span className="font-semibold text-gray-800">
                          ₹{gstAmount} (Included)
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 pt-4 flex justify-between items-baseline">
                        <div>
                          <span className="font-extrabold text-base text-gray-900">Total Amount</span>
                          <p className="text-[11px] text-green-700 font-semibold mt-0.5">
                            (Inclusive of all taxes &amp; GST)
                          </p>
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tight">
                          ₹{finalAmount}
                        </span>
                      </div>

                    </div>

                    {/* Action Checkout Submission Button */}
                    <button
                      disabled={loading}
                      onClick={handlePay}
                      className="w-full py-4 bg-[#FF6A00] hover:bg-[#F05A00] active:scale-[0.99] text-white font-extrabold rounded-xl text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <span>Processing {selectedMethod === "cod" ? "Booking..." : "Payment..."}</span>
                      ) : selectedMethod === "cod" ? (
                        <span className="flex items-center gap-2">
                          <Banknote className="w-5 h-5" />
                          <span>Place Order (Cash on Delivery)</span>
                        </span>
                      ) : (
                        <span>
                          Pay ₹{finalAmount} via {paymentMethodsList.find((m) => m.id === selectedMethod)?.name || "Online"}
                        </span>
                      )}
                    </button>

                {/* Safe & secure checkout + payment logos */}
                <div className="flex flex-col items-center justify-center gap-2 pt-1 text-center">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    {selectedMethod === "cod" ? (
                      <>
                        <Banknote className="w-3.5 h-3.5 text-green-600" />
                        <span>Pay ₹{finalAmount} in cash after service completion</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Safe &amp; secure 256-Bit SSL checkout</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 opacity-80 pt-1">
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

                  {/* Easy Cancellation & Verified Provider Trust Badge */}
                  <div className="flex items-start gap-2.5 px-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-gray-500 leading-snug">
                      Easy Cancellation/Returns, Background Verified Service Provider.
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* Date Time Selection Modal for changing slot */}
            <SelectDateTimeModal
              isOpen={showDateTimeModal}
              onClose={() => setShowDateTimeModal(false)}
              onContinue={handleDateTimeChange}
              serviceId={
                cartItems?.[0]?.service_id || cartItems?.[0]?.serviceId || 1
              }
            />

            {/* COD Booking Confirmation OTP Modal */}
            {showCodOtpModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 relative">
                  {/* Close Modal Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!otpVerifying) setShowCodOtpModal(false);
                    }}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Top Banknote/Security Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 text-[#FF6A00] flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                    <Banknote className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-extrabold text-gray-900 text-center tracking-tight">
                    Confirm COD Booking
                  </h3>
                  <p className="text-xs text-gray-500 text-center mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Enter the 4-digit verification code sent to{" "}
                    <span className="font-bold text-gray-800">
                      +91 {codPhone.slice(0, 2)}******{codPhone.slice(-2)}
                    </span>{" "}
                    to confirm your Cash on Delivery booking.
                  </p>

                  {/* 4-digit OTP Input Fields */}
                  <div className="flex justify-center gap-3 my-6">
                    {codOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleCodOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleCodOtpPaste : undefined}
                        className={`w-12 h-14 text-center text-xl font-black rounded-xl border transition-all outline-none ${
                          codOtpError
                            ? "border-red-400 bg-red-50/20 text-red-600 focus:border-red-500"
                            : digit
                            ? "border-[#FF6A00] bg-orange-50/20 text-gray-900 shadow-xs"
                            : "border-gray-300 bg-gray-50/50 text-gray-900 focus:border-[#FF6A00] focus:bg-white"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Error Message */}
                  {codOtpError && (
                    <p className="text-xs text-red-600 text-center font-medium flex items-center justify-center gap-1.5 mb-4 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{codOtpError}</span>
                    </p>
                  )}

                  {/* Resend OTP Timer / Button */}
                  <div className="flex items-center justify-center text-xs text-gray-500 mb-5">
                    {otpTimer > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          Resend OTP in <strong className="text-gray-800 font-bold">{otpTimer}s</strong>
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={otpSending}
                        onClick={handleResendCodOtp}
                        className="font-bold text-[#FF6A00] hover:text-[#E05500] flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${otpSending ? "animate-spin" : ""}`} />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  {/* Confirm & Verify Button */}
                  <button
                    type="button"
                    disabled={otpVerifying || codOtpDigits.join("").length !== 4}
                    onClick={() => handleVerifyCodOtpAndBook()}
                    className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E05500] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {otpVerifying ? (
                      <span>Verifying &amp; Confirming...</span>
                    ) : (
                      <span>Verify &amp; Confirm Booking</span>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span>Secure OTP confirmation • Pay cash upon service delivery</span>
                  </p>
                </div>
              </div>
            )}

          </main>
        </div>
      );
    }
