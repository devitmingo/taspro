"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Calendar,
  FileText,
  Home,
  ListOrdered,
  Clock,
  Shield,
  Award,
  List,
  Pencil,
  MapPin,
  User,
  Phone,
  Lock,
  Gift,
  Star,
  ChevronRight,
  Info,
  Headphones,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ShieldCheck,
  Percent,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { SelectAddressModal } from "@/components/booking-flow/SelectAddressModal";
import AddNewAddressModal from "@/components/AddNewAddressModal";
import Swal from "sweetalert2";

export default function OrderConfirmationPage() {
  const router = useRouter();

  const [bookingData, setBookingData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddNewAddressModal, setShowAddNewAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [activeAddress, setActiveAddress] = useState<any>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    // 1. Load last confirmed booking or fallback defaults
    if (typeof window !== "undefined") {
      const savedBooking = localStorage.getItem("lastConfirmedBooking");
      let parsedBooking: any = null;
      if (savedBooking) {
        try {
          parsedBooking = JSON.parse(savedBooking);
        } catch (e) {}
      }

      // Default mock booking data matching Image 3 if not present
      const now = new Date();
      const defaultOrderDate = now.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const fallback = {
        orderId: `TS${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}A12567`,
        orderDate: defaultOrderDate,
        serviceName: "AC Repair",
        items: [
          {
            id: 1,
            name: "AC Gas Refilling",
            subService: "Split AC",
            quantity: 1,
            price: 800,
            unitPrice: 800,
            amount: 800,
            warranty: "30 Days",
            image: "/tas.logo.png",
          },
          {
            id: 2,
            name: "AC Power Jet Cleaning",
            subService: "Split AC",
            quantity: 1,
            price: 400,
            unitPrice: 400,
            amount: 400,
            warranty: "30 Days",
            image: "/tas.logo.png",
          },
        ],
        bookingDate: "14 Jun 2026, 09:15 AM",
        scheduledTime: "14 Jun 2026, 10:00 AM",
        customerName: "Tikesh Dewangan",
        customerPhone: "+91 9644430161",
        customerAddress:
          "Office No.201, Altnis Corporate park, Ring Road No., Raipur, Raipur Tahsil, Raipur, Chhattisgarh, 493332",
        convenienceFee: 50,
        itemDiscount: 36,
        couponDiscount: 0,
        totalAmount: 1214,
        savings: 36,
      };

      if (parsedBooking) {
        const items =
          parsedBooking.items && parsedBooking.items.length > 0
            ? parsedBooking.items.map((it: any, idx: number) => ({
                id: it.id || idx + 1,
                name: it.name || "AC Service",
                subService: it.subService || it.sub_category_name || "Standard",
                quantity: it.quantity || 1,
                unitPrice: it.price || it.discountedPrice || 800,
                amount:
                  (it.price || it.discountedPrice || 800) *
                  (it.quantity || 1),
                warranty: it.warrantyDays
                  ? `${it.warrantyDays} Days`
                  : "30 Days",
                image: it.image || "/tas.logo.png",
              }))
            : fallback.items;

        const subtotal = items.reduce(
          (sum: number, it: any) => sum + (it.amount || 0),
          0,
        );
        const convenienceFee = 50;
        const discount = parsedBooking.totalDiscount || 36;
        const couponDisc = parsedBooking.couponDiscount || 0;
        const finalTot = Math.max(
          subtotal + convenienceFee - discount - couponDisc,
          0,
        );

        let dt = parsedBooking.bookingDateTime || {};
        let dateStr = dt.date || "14 Jun 2026";
        let timeStr = dt.time || "10:00 AM";

        setBookingData({
          orderId: parsedBooking.orderId || fallback.orderId,
          orderDate: parsedBooking.orderDate || defaultOrderDate,
          serviceName: parsedBooking.serviceName || "AC Repair",
          items,
          bookingDate: `${dateStr}, 09:15 AM`,
          scheduledTime: `${dateStr}, ${timeStr}`,
          customerName:
            parsedBooking.selectedAddress?.full_name ||
            parsedBooking.selectedAddress?.name ||
            fallback.customerName,
          customerPhone:
            parsedBooking.selectedAddress?.contact_number ||
            parsedBooking.selectedAddress?.phone ||
            fallback.customerPhone,
          customerAddress:
            [
              parsedBooking.selectedAddress?.house_number,
              parsedBooking.selectedAddress?.street,
              parsedBooking.selectedAddress?.city_name ||
                parsedBooking.selectedAddress?.city?.name,
              parsedBooking.selectedAddress?.state_name ||
                parsedBooking.selectedAddress?.state?.name,
              parsedBooking.selectedAddress?.postal_code ||
                parsedBooking.selectedAddress?.pincode,
            ]
              .filter(Boolean)
              .join(", ") || fallback.customerAddress,
          convenienceFee,
          itemDiscount: discount,
          couponDiscount: couponDisc,
          totalAmount: finalTot,
          savings: discount + couponDisc,
        });

        if (parsedBooking.selectedAddress) {
          setActiveAddress(parsedBooking.selectedAddress);
        }
      } else {
        setBookingData(fallback);
      }
    }

    // 2. Fetch customer addresses
    if (token) {
      axios
        .get(`${API_BASE_URL}/customers/customer-addresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          if (res.data?.data) {
            setAddresses(res.data.data);
            if (!activeAddress && res.data.data.length > 0) {
              setActiveAddress(res.data.data[0]);
            }
          }
        })
        .catch((e) => console.log(e));
    }
  }, [token]);

  const items = bookingData?.items || [];
  const displayAddress =
    activeAddress ||
    addresses[0] || {
      full_name: bookingData?.customerName || "Tikesh Dewangan",
      contact_number: bookingData?.customerPhone || "+91 9644430161",
      house_number: "Office No.201",
      street: "Altnis Corporate park, Ring Road No.",
      city_name: "Raipur",
      state_name: "Chhattisgarh",
      postal_code: "493332",
    };

  return (
    <div className="w-full pb-10">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 flex-1">
        {/* Top Two Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT COLUMN (Col 1-8) ================= */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* 1. SUCCESS BANNER: Thank you for your order! */}
            <div className="bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Green Check Badge with Celebration Confetti dots */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
                  <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400" />
                  <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-blue-400" />
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-orange-400" />
                </div>

                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                    Thank you for your order!
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Your service request has been confirmed successfully. We will notify you once a service provider is assigned.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3.5 pt-3 border-t border-emerald-100/80 text-xs text-gray-600 font-medium">
                    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>Order Placed on <strong className="text-gray-900">{bookingData?.orderDate || "Fri, 26 Jan 2026"}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span>Order ID: <strong className="text-gray-900">{bookingData?.orderId || "TS20260126A12567"}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SERVICE HERO CARD: AC Repair */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-xs">
              <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <img
                  src="https://files.catbox.moe/l742u1.png"
                  alt="Service Technician"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {bookingData?.serviceName || "AC Repair"}
                  </h2>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">4.8</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">3,287 reviews</span>
                </div>

                {/* 3 Verification Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-gray-600">
                  <div className="flex items-center gap-1.5 text-blue-900">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Trusted &amp; Verified Professionals</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-orange-600">
                    <Award className="w-4 h-4 text-[#ff5500]" />
                    <span>30 Days Service Warranty</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Approx. 1-2 Hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SERVICES IN THIS BOOKING TABLE CARD */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5 text-[#ff5500]" />
                  <h3 className="text-base font-bold text-gray-900">
                    Services in this Booking
                  </h3>
                </div>
                <span className="bg-orange-50 text-[#ff5500] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-200">
                  Total Services: {items.length}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-[11px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-2">#</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Warranty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    {items.map((it: any, idx: number) => (
                      <tr key={it.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-2 font-bold text-gray-900">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                              <img
                                src={it.image || "/tas.logo.png"}
                                alt=""
                                className="w-7 h-7 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-xs sm:text-sm">
                                {it.name}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {it.subService || "Split AC"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-xs font-bold">
                            {it.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-800">
                          ₹{it.unitPrice}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900">
                          ₹{it.amount}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-600">
                          {it.warranty || "30 Days"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Booking & Scheduled Date Cards Below Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Booking Date</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      {bookingData?.bookingDate || "14 Jun 2026, 09:15 AM"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-orange-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Scheduled Service</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      {bookingData?.scheduledTime || "14 Jun 2026, 10:00 AM"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. CUSTOMER DETAILS CARD */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#ff5500]" />
                  <h3 className="text-base font-bold text-gray-900">
                    Customer Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="border border-[#ff5500] text-[#ff5500] hover:bg-orange-50 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Customer Name</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {displayAddress.full_name || displayAddress.name || bookingData?.customerName || "Tikesh Dewangan"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Phone Number</p>
                      <p className="font-bold text-gray-900">
                        {displayAddress.contact_number || displayAddress.phone || bookingData?.customerPhone || "+91 9644430161"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Service Address</p>
                    <p className="font-medium text-gray-700 leading-relaxed text-xs">
                      {[
                        displayAddress.house_number || displayAddress.houseNo,
                        displayAddress.street || displayAddress.location,
                        displayAddress.city_name || displayAddress.city?.name || "Raipur",
                        displayAddress.state_name || displayAddress.state?.name || "Chhattisgarh",
                        displayAddress.postal_code || displayAddress.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                        bookingData?.customerAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. OTP REQUIRED FOR SERVICE CARD */}
            <div className="bg-gradient-to-r from-orange-50/60 via-white to-amber-50/50 border border-orange-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#ff5500] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    OTP Required for Service
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed max-w-xl">
                    Service provider will ask for OTP at the time of service to start the work. This ensures your safety and confirms the service at your location.
                  </p>
                </div>
              </div>

              {/* Graphic OTP card with smiling technician */}
              <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-orange-200 shadow-2xs shrink-0">
                <div className="text-center border-r border-gray-100 pr-3">
                  <span className="block text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                    OTP
                  </span>
                  <span className="font-mono font-extrabold text-sm text-[#ff5500] tracking-widest">
                    ★★★★
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ff5500]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Col 9-12 Sticky Sidebar) ================= */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Top Action Buttons (Matching Image 3) */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/"
                className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Home className="w-4 h-4 text-orange-500" />
                <span>Back to Home</span>
              </Link>

              <Link
                href="/my-booking"
                className="py-2.5 px-3 rounded-xl bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <ListOrdered className="w-4 h-4" />
                <span>Track &amp; Manage Order</span>
              </Link>
            </div>

            {/* CARD 1: Price Details */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#ff5500] flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Price Details
                </h3>
              </div>

              {/* Items list breakdown */}
              <div className="space-y-2.5 text-xs sm:text-sm">
                {items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span className="truncate pr-2">
                      {it.name} ({it.quantity} × ₹{it.unitPrice})
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₹{it.amount}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between text-gray-600 pt-1">
                  <span>Convenience Fee</span>
                  <span className="font-semibold text-gray-800">
                    ₹{bookingData?.convenienceFee || 50}
                  </span>
                </div>

                {bookingData?.itemDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Item Discount</span>
                    <span>- ₹{bookingData?.itemDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Coupon Discount</span>
                  <span className="text-gray-500">
                    {bookingData?.couponDiscount > 0
                      ? `- ₹${bookingData?.couponDiscount}`
                      : "- ₹0"}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-extrabold text-gray-900">
                  <span>Total Amount <span className="text-[11px] font-normal text-gray-400 block">(Inclusive of all taxes)</span></span>
                  <span className="text-base text-gray-900 font-extrabold">
                    ₹{bookingData?.totalAmount?.toLocaleString("en-IN") || "1,214"}
                  </span>
                </div>
              </div>

              {/* Green Savings Pill */}
              <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Percent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600 font-medium uppercase">
                      You saved
                    </p>
                    <p className="text-xs font-bold text-emerald-800">
                      ₹{bookingData?.savings || 36} on this order
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md">
                  15% OFF
                </span>
              </div>
            </div>

            {/* CARD 2: Offer Earned */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-[#ff5500]">
                <Gift className="w-4 h-4" />
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Offer Earned
                </h4>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mt-0.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      You earned <span className="text-orange-600 font-extrabold">20 Reward Points</span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      These points can be used on your next booking.
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-500" />
              </div>
            </div>

            {/* CARD 3: Important Information */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#ff5500]">
                <Info className="w-4 h-4" />
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Important Information
                </h4>
              </div>

              <div className="space-y-3 pt-1 text-xs text-gray-600 leading-snug">
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-orange-600 text-xs mt-0.5">₹</span>
                  <div>
                    <strong className="text-gray-900 font-bold block text-xs">
                      ₹150 Visit Charge
                    </strong>
                    <span className="text-[11px] text-gray-500">
                      If the service is not available at the time of visit, ₹150 visit charge will be applicable.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-bold block text-xs">
                      Easy Cancellation
                    </strong>
                    <span className="text-[11px] text-gray-500">
                      You can cancel before service starts.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Headphones className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-bold block text-xs">
                      Dedicated Support
                    </strong>
                    <span className="text-[11px] text-gray-500">
                      For any help, contact our support team.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-bold block text-xs">
                      Background Verified Service Providers
                    </strong>
                    <span className="text-[11px] text-gray-500">
                      Trained, verified and professional technicians.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Need help? */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ff5500] flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    Need help?
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    Our support team is here to help you.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  Swal.fire({
                    icon: "info",
                    title: "TASpro Customer Support",
                    html: `
                      <div class="text-left text-sm space-y-2">
                        <p><strong>Toll Free:</strong> 7447-0000-45</p>
                        <p><strong>Email:</strong> support@taspro.com</p>
                        <p><strong>Hours:</strong> Mon - Sun (8:00 AM - 9:00 PM)</p>
                      </div>
                    `,
                    confirmButtonColor: "#ff5500",
                  });
                }}
                className="px-3 py-1.5 rounded-xl border border-[#ff5500] text-[#ff5500] hover:bg-orange-50 text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM SECTION: You might be also interested in ================= */}
        <div className="mt-12 pt-8 border-t border-gray-200/80">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              You might be also interested in
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 1,
                name: "Domestic Help Services",
                price: 550,
                strikePrice: 650,
                rating: 4.5,
                reviews: "12m",
                duration: "45 mins",
                image: "/bathroom.png",
                slug: "domestic-help-services",
              },
              {
                id: 2,
                name: "Home Appliances Repair & Service",
                price: 550,
                strikePrice: 650,
                rating: 4.5,
                reviews: "12m",
                duration: "45 mins",
                image: "/washing-machine.png",
                slug: "ac-repair-appliances-repair-service",
              },
              {
                id: 3,
                name: "Furniture Dealers",
                price: 550,
                strikePrice: 650,
                rating: 4.5,
                reviews: "12m",
                duration: "45 mins",
                image: "/carpenter.png",
                slug: "furniture-assembly-dismantle",
              },
              {
                id: 4,
                name: "Packer and Movers",
                price: 550,
                strikePrice: 650,
                rating: 4.5,
                reviews: "12m",
                duration: "45 mins",
                image: "/heroimage.jpg",
                slug: "packer-and-movers",
              },
            ].map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">
                      {service.name}
                    </h3>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-gray-800">{service.rating}</span>
                      <span>({service.reviews} Reviews)</span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-base font-extrabold text-gray-900">
                        ₹{service.price}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ₹{service.strikePrice}
                      </span>
                      <span className="text-[11px] text-gray-500 ml-1">
                        {service.duration}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/service/${service.slug}`}
                    className="w-full py-2 bg-[#ff5500] hover:bg-[#e64d00] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center cursor-pointer mt-2"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Address Modals */}
      <SelectAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addresses={addresses}
        onContinue={(address) => {
          setActiveAddress(address);
          setShowAddressModal(false);
        }}
        onAddNew={() => {
          setEditingAddress(null);
          setShowAddressModal(false);
          setShowAddNewAddressModal(true);
        }}
      />

      <AddNewAddressModal
        isOpen={showAddNewAddressModal}
        onClose={() => {
          setShowAddNewAddressModal(false);
          setEditingAddress(null);
        }}
        onSave={async (newAddress: any) => {
          if (!token) return;
          try {
            const cleanPhone = (val: string) => `+91 ${val.replace(/\D/g, "").slice(-10)}`;
            await axios.post(
              `${API_BASE_URL}/customers/customer-addresses`,
              {
                full_name: newAddress.fullName || newAddress.name,
                contact_number: cleanPhone(newAddress.contactNumber || newAddress.phone),
                postal_code: newAddress.postalCode || newAddress.pincode,
                house_number: newAddress.houseNo || "",
                street: newAddress.street || newAddress.address || "",
                country_id: 1,
                state_id: 1,
                city_id: 1,
                state_name: "Chhattisgarh",
                city_name: "Raipur",
                latitude: 21.2514,
                longitude: 81.6296,
                type: "Home",
                is_active: 1,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              },
            );

            const addrRes = await axios.get(
              `${API_BASE_URL}/customers/customer-addresses`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              },
            );
            if (addrRes.data?.data) {
              setAddresses(addrRes.data.data);
              setActiveAddress(addrRes.data.data[0]);
            }
            setShowAddNewAddressModal(false);
            setEditingAddress(null);
            setShowAddressModal(true);
          } catch (e) {
            console.log(e);
          }
        }}
      />
    </div>
  );
}
