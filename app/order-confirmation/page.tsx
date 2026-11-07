"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { SelectAddressModal } from "@/components/booking-flow/SelectAddressModal";
import AddNewAddressModal from "@/components/AddNewAddressModal";
import Swal from "sweetalert2";

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdFromUrl =
    searchParams.get("booking_id") || searchParams.get("id");

  const [bookingData, setBookingData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddNewAddressModal, setShowAddNewAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [activeAddress, setActiveAddress] = useState<any>(null);
  const [cityName, setCityName] = useState("Raipur");
  const [stateName, setStateName] = useState("Chhattisgarh");
  const [recommendedServices, setRecommendedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync selected city/location
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem("selected_location");
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed.city) setCityName(parsed.city);
        if (parsed.state) setStateName(parsed.state);
      }
    } catch (e) {}

    const handleLocationChange = (e: any) => {
      if (e.detail) {
        if (e.detail.city) setCityName(e.detail.city);
        if (e.detail.state) setStateName(e.detail.state);
      }
    };
    window.addEventListener("location-changed", handleLocationChange);
    return () => window.removeEventListener("location-changed", handleLocationChange);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Helper to populate booking state from API data
  const populateFromApi = (apiData: any) => {
    if (!apiData) return;

    const b = apiData.booking || {};
    const sd = apiData.service_details || {};
    const cd = apiData.customer_details || {};
    const ps = apiData.payment_summary || {};
    const sp = apiData.service_provider || {};
    const tracking = apiData.tracking_info?.tracking_steps || [];

    // Parse items
    const rawItems = sd.items && sd.items.length > 0 ? sd.items : [];
    const items = rawItems.map((it: any, idx: number) => {
      const price = Number(it.price) || 200;
      const qty = Number(it.qty) || 1;
      return {
        id: it.detail_id || idx + 1,
        name: it.subtitle || it.name || "Gas Filling",
        subService: sd.title || "Split AC",
        quantity: qty,
        unitPrice: price,
        amount: price * qty,
        warranty: it.warranty || "30 Days",
        image: getImageUrl(it.image, "/tas.logo.png"),
      };
    });

    // Dates
    const orderCreatedTime =
      tracking[0]?.time ||
      (b.enquiry_date_time
        ? new Date(b.enquiry_date_time).toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          }));

    const scheduledTime =
      b.scheduled_at ||
      (b.slot_time
        ? `${orderCreatedTime}, ${b.slot_time}`
        : `${orderCreatedTime}, 09:00 AM`);

    const itemDiscount = Number(ps.item_discount) || 36;
    const specialDiscount = Number(ps.special_discount) || 0;
    const totalAmount = Number(ps.total) || 200;
    const convenienceFee = Number(ps.visit_charge) || 0;

    setBookingData({
      orderId: b.booking_no || apiData.delivery_status?.order_id || `ENQ-00${b.booking_id || 33}`,
      orderDate: orderCreatedTime,
      serviceName: sd.title || "AC Repair",
      serviceImage: getImageUrl(items[0]?.image, "/tas.logo.png"),
      items: items.length > 0 ? items : [
        {
          id: 1,
          name: "Gas Filling",
          subService: "Split AC",
          quantity: 1,
          unitPrice: 200,
          amount: 200,
          warranty: "30 Days",
          image: "/tas.logo.png",
        },
      ],
      bookingDate: orderCreatedTime,
      scheduledTime,
      customerName: cd.name || "Amit Jaiswal",
      customerPhone: cd.phone ? `+91 ${cd.phone.replace(/\D/g, "").slice(-10)}` : "+91 7812991993",
      customerAddress: cd.address || "259, hirapur, Raipur, Chhattisgarh, 492099",
      otp: sp.otp || sp.service_otp || b.otp || "4826",
      convenienceFee,
      itemDiscount,
      couponDiscount: 0,
      totalAmount,
      savings: itemDiscount + specialDiscount,
      paymentMethod: apiData.payment_method || "COD",
    });

    setActiveAddress({
      full_name: cd.name || "Amit Jaiswal",
      contact_number: cd.phone || "7812991993",
      street: cd.address || "259, hirapur, Raipur, Chhattisgarh, 492099",
    });
  };

  useEffect(() => {
    // 1. Initial immediate load from localStorage (instant display, no flash)
    if (typeof window !== "undefined") {
      const savedBooking = localStorage.getItem("lastConfirmedBooking");
      const savedUser = localStorage.getItem("user");
      let parsedUser: any = {};
      if (savedUser) {
        try {
          parsedUser = JSON.parse(savedUser);
        } catch (e) {}
      }

      if (savedBooking) {
        try {
          const parsed = JSON.parse(savedBooking);
          const rawItems = parsed.items && parsed.items.length > 0 ? parsed.items : [];
          const items = rawItems.map((it: any, idx: number) => ({
            id: it.id || idx + 1,
            name: it.name || it.serviceName || "Gas Filling",
            subService: it.subService || it.sub_category_name || "Split AC",
            quantity: it.quantity || 1,
            unitPrice: it.price || it.discountedPrice || 200,
            amount: (it.price || it.discountedPrice || 200) * (it.quantity || 1),
            warranty: it.warrantyDays ? `${it.warrantyDays} Days` : "30 Days",
            image: getImageUrl(it.image || it.icon, "/tas.logo.png"),
          }));

          const subtotal = items.reduce(
            (sum: number, it: any) => sum + (it.amount || 0),
            0,
          );
          const discount = parsed.totalDiscount || 36;
          const couponDisc = parsed.couponDiscount || 0;
          const finalTot = parsed.finalAmount || Math.max(subtotal - discount - couponDisc, 0) || 200;

          const dt = parsed.bookingDateTime || {};
          const dateStr = dt.date || new Date().toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const timeStr =
            dt.time ||
            dt.timeSlot ||
            dt.slotName ||
            dt.slot_time ||
            "09:00 AM";

          const custAddr = parsed.selectedAddress || {};
          const fullAddr = [
            custAddr.house_number,
            custAddr.street,
            custAddr.city_name || custAddr.city?.name || "Raipur",
            custAddr.state_name || custAddr.state?.name || "Chhattisgarh",
            custAddr.postal_code || custAddr.pincode || "492099",
          ]
            .filter(Boolean)
            .join(", ");

          setBookingData({
            orderId: parsed.orderId || "ENQ-0033",
            orderDate: parsed.orderDate || dateStr,
            serviceName: parsed.serviceName || items[0]?.name || "AC Repair",
            serviceImage: getImageUrl(items[0]?.image, "/tas.logo.png"),
            items: items.length > 0 ? items : [
              {
                id: 1,
                name: "Gas Filling",
                subService: "Split AC",
                quantity: 1,
                unitPrice: 200,
                amount: 200,
                warranty: "30 Days",
                image: "/tas.logo.png",
              },
            ],
            bookingDate: `${dateStr}, 09:15 AM`,
            scheduledTime: `${dateStr}, ${timeStr}`,
            customerName:
              custAddr.full_name ||
              custAddr.name ||
              parsedUser.name ||
              "Amit Jaiswal",
            customerPhone:
              custAddr.contact_number ||
              custAddr.phone ||
              (parsedUser.phone ? `+91 ${parsedUser.phone}` : "+91 7812991993"),
            customerAddress:
              fullAddr || "259, hirapur, Raipur, Chhattisgarh, 492099",
            otp: "4826",
            convenienceFee: 0,
            itemDiscount: discount,
            couponDiscount: couponDisc,
            totalAmount: finalTot,
            savings: discount + couponDisc,
            paymentMethod: parsed.paymentMethod || "COD",
          });

          if (custAddr && Object.keys(custAddr).length > 0) {
            setActiveAddress(custAddr);
          }
        } catch (e) {
          console.error("Error parsing local booking:", e);
        }
      }
    }

    // 2. Fetch live original booking data from backend API
    const fetchLiveBooking = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        let bookingApiUrl = "";
        if (bookingIdFromUrl) {
          bookingApiUrl = `${API_BASE_URL}/customers/customer-bookings/${bookingIdFromUrl}`;
        } else {
          // If no booking_id param, fetch customer's bookings list to get the latest one
          const listRes = await axios.get(
            `${API_BASE_URL}/customers/customer-bookings?page=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            },
          );

          if (listRes.data?.data?.data?.length > 0) {
            const latestBooking = listRes.data.data.data[0];
            bookingApiUrl = `${API_BASE_URL}/customers/customer-bookings/${latestBooking.id}`;
          }
        }

        if (bookingApiUrl) {
          const detRes = await axios.get(bookingApiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });

          if (detRes.data?.status && detRes.data.data) {
            populateFromApi(detRes.data.data);
          }
        }
      } catch (err) {
        console.log("Could not fetch live booking from API, keeping cached:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveBooking();

    // 3. Fetch customer addresses for the edit modal
    if (token) {
      axios
        .get(`${API_BASE_URL}/customers/customer-addresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          if (res.data?.data && res.data.data.length > 0) {
            setAddresses(res.data.data);
            if (!activeAddress) {
              setActiveAddress(res.data.data[0]);
            }
          }
        })
        .catch((e) => console.log(e));
    }
  }, [token, bookingIdFromUrl]);

  // Fetch services whose service issues are available in the selected city
  useEffect(() => {
    let isMounted = true;
    const fetchCityServices = async () => {
      try {
        const dynamicList: any[] = [];

        // 1. Fetch service issues available in the selected city
        const issuesUrl = `${API_BASE_URL}/service-issues?city_name=${encodeURIComponent(cityName)}`;
        // 2. Fetch services available in the selected city
        const servicesUrl = `${API_BASE_URL}/services?city_name=${encodeURIComponent(cityName)}&state_name=${encodeURIComponent(stateName)}`;

        const [issuesRes, servicesRes] = await Promise.allSettled([
          fetch(issuesUrl).then((r) => r.json()),
          fetch(servicesUrl).then((r) => r.json()),
        ]);

        // Add service issues available in this city
        if (issuesRes.status === "fulfilled" && issuesRes.value?.data) {
          const issuesData = issuesRes.value.data;
          if (Array.isArray(issuesData)) {
            issuesData.forEach((issue: any) => {
              const basePrice = Number(issue.base_price) || 200;
              const strikePrice =
                Number(issue.strike_price) || Math.round(basePrice * 1.18);
              const serviceSlug =
                issue.service?.slug || "ac-repair-appliances-repair-service";

              dynamicList.push({
                id: `issue_${issue.id}`,
                name: issue.name,
                slug: `${serviceSlug}?service_id=${issue.service_id || issue.service?.id || 1}`,
                image: getImageUrl(
                  issue.icon_url || issue.icon,
                  "/bathroom.png",
                ),
                price: basePrice > 0 ? basePrice : 199,
                strikePrice:
                  strikePrice > basePrice
                    ? strikePrice
                    : Math.round(basePrice * 1.2),
                rating: 5.0,
                reviews: "1.2k",
                duration: issue.duration_minutes
                  ? `${issue.duration_minutes} mins`
                  : "45 mins",
              });
            });
          }
        }

        // Also add services that have active service issues in this city
        if (servicesRes.status === "fulfilled" && servicesRes.value?.data) {
          const servicesData = servicesRes.value.data;
          if (Array.isArray(servicesData)) {
            servicesData.forEach((s: any) => {
              if (
                !dynamicList.some(
                  (item) =>
                    item.name.toLowerCase() === (s.name || "").toLowerCase(),
                )
              ) {
                const visitingCharge = Number(s.visiting_charge) || 200;
                dynamicList.push({
                  id: `svc_${s.id}`,
                  name: s.name,
                  slug:
                    s.slug ||
                    `ac-repair-appliances-repair-service?service_id=${s.id}`,
                  image: getImageUrl(
                    s.image || s.home_icon_image,
                    "/washing-machine.png",
                  ),
                  price: visitingCharge,
                  strikePrice: Math.round(visitingCharge * 1.2),
                  rating: s.rating ? parseFloat(s.rating) : 4.8,
                  reviews: s.reviews ? `${s.reviews}k` : "1.2k",
                  duration: "45 mins",
                });
              }
            });
          }
        }

        if (isMounted) {
          setRecommendedServices(dynamicList);
        }
      } catch (e) {
        console.error("Error fetching city-filtered services:", e);
      }
    };

    fetchCityServices();
    return () => {
      isMounted = false;
    };
  }, [cityName, stateName]);

  const items = bookingData?.items || [];
  const displayAddress =
    activeAddress ||
    addresses[0] || {
      full_name: bookingData?.customerName || "Amit Jaiswal",
      contact_number: bookingData?.customerPhone || "+91 7812991993",
      street: bookingData?.customerAddress || "259, hirapur, Raipur, Chhattisgarh, 492099",
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
                      <span>
                        Order Placed on{" "}
                        <strong className="text-gray-900">
                          {bookingData?.orderDate || "Mon, 2 Nov 2026"}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span>
                        Order ID:{" "}
                        <strong className="text-gray-900 font-mono">
                          {bookingData?.orderId || "ENQ-0033"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SERVICE HERO CARD */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-xs">
              <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                <img
                  src={
                    bookingData?.serviceImage ||
                    "https://app.tasprocompany.in/storage/services/1786680357_6330.png"
                  }
                  alt="Service"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = "/tas.logo.png";
                  }}
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
                  <span className="font-bold">5.0</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">1 review</span>
                </div>

                {/* Verification Badges */}
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
                    <span>Approx. 30-60 Mins</span>
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
                      <tr
                        key={it.id || idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-2 font-bold text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={it.image || "/tas.logo.png"}
                                alt=""
                                className="w-8 h-8 object-contain"
                                onError={(e: any) => {
                                  e.target.src = "/tas.logo.png";
                                }}
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
                    <p className="text-[11px] text-gray-400 font-medium">
                      Booking Date
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      {bookingData?.bookingDate || "02 Nov 2026, 05:36 PM"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-orange-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Scheduled Service
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      {bookingData?.scheduledTime || "Mon, 2nd Nov 2026 (09:00 AM)"}
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
                      <p className="text-[11px] text-gray-400 font-medium">
                        Customer Name
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {displayAddress.full_name ||
                          displayAddress.name ||
                          bookingData?.customerName ||
                          "Amit Jaiswal"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Phone Number
                      </p>
                      <p className="font-bold text-gray-900">
                        {displayAddress.contact_number ||
                          displayAddress.phone ||
                          bookingData?.customerPhone ||
                          "+91 7812991993"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Service Address
                    </p>
                    <p className="font-medium text-gray-700 leading-relaxed text-xs">
                      {displayAddress.street ||
                        [
                          displayAddress.house_number || displayAddress.houseNo,
                          displayAddress.street || displayAddress.location,
                          displayAddress.city_name || displayAddress.city?.name || "Raipur",
                          displayAddress.state_name || displayAddress.state?.name || "Chhattisgarh",
                          displayAddress.postal_code || displayAddress.pincode || "492099",
                        ]
                          .filter(Boolean)
                          .join(", ") ||
                        bookingData?.customerAddress ||
                        "259, hirapur, Raipur, Chhattisgarh, 492099"}
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

              {/* Graphic OTP card */}
              <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-orange-200 shadow-2xs shrink-0">
                <div className="text-center border-r border-gray-100 pr-3">
                  <span className="block text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                    OTP
                  </span>
                  <span className="font-mono font-extrabold text-sm text-[#ff5500] tracking-widest">
                    {bookingData?.otp || "4826"}
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
            {/* Top Action Buttons */}
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

                {bookingData?.convenienceFee > 0 && (
                  <div className="flex justify-between text-gray-600 pt-1">
                    <span>Convenience Fee</span>
                    <span className="font-semibold text-gray-800">
                      ₹{bookingData?.convenienceFee}
                    </span>
                  </div>
                )}

                {bookingData?.itemDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Item Discount</span>
                    <span>- ₹{bookingData?.itemDiscount}</span>
                  </div>
                )}

                {bookingData?.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>- ₹{bookingData?.couponDiscount}</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-extrabold text-gray-900">
                  <span>
                    Total Amount{" "}
                    <span className="text-[11px] font-normal text-gray-400 block">
                      (Inclusive of all taxes)
                    </span>
                  </span>
                  <span className="text-base text-gray-900 font-extrabold">
                    ₹{bookingData?.totalAmount?.toLocaleString("en-IN") || "200"}
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

            {/* CARD 2: Important Information */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#ff5500]">
                <Info className="w-4 h-4" />
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Important Information
                </h4>
              </div>

              <div className="space-y-3 pt-1 text-xs text-gray-600 leading-snug">
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-orange-600 text-xs mt-0.5">
                    ₹
                  </span>
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
                        <p><strong>Email:</strong> support@tascompany.in</p>
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
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                You might be also interested in
              </h2>
              {cityName && (
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Available in <span className="text-[#ff5500] font-bold">{cityName}</span>
                </p>
              )}
            </div>
            {recommendedServices.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-2xs"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-2xs"
                  aria-label="Next"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Carousel / Grid */}
          {recommendedServices.length > 0 ? (
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth no-scrollbar"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {recommendedServices.map((service) => (
                <div
                  key={service.id}
                  className="min-w-[270px] sm:min-w-[285px] max-w-[295px] bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between shrink-0 group"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e: any) => {
                        e.target.src = "/tas.logo.png";
                      }}
                    />
                  </div>

                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Only Service/Issue Name (no category/subcategory) */}
                      <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {service.name}
                      </h3>

                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-gray-800">
                          {service.rating}
                        </span>
                        <span>({service.reviews} Reviews)</span>
                      </div>
                    </div>

                    {/* Same Row: Amount and Book Now Button */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-100 mt-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-extrabold text-gray-900">
                          ₹{service.price}
                        </span>
                        {service.strikePrice > service.price && (
                          <span className="text-[11px] text-gray-400 line-through font-medium">
                            ₹{service.strikePrice}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 font-medium ml-0.5">
                          {service.duration}
                        </span>
                      </div>

                      <Link
                        href={
                          service.slug.startsWith("/")
                            ? service.slug
                            : `/service/${service.slug}`
                        }
                        className="px-3.5 py-1.5 bg-[#ff5500] hover:bg-[#e64d00] active:scale-[0.97] text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-sm font-semibold text-gray-700">
                No services currently available in {cityName}.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                We are actively adding new services for your location!
              </p>
            </div>
          )}
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
            const cleanPhone = (val: string) =>
              `+91 ${val.replace(/\D/g, "").slice(-10)}`;
            await axios.post(
              `${API_BASE_URL}/customers/customer-addresses`,
              {
                full_name: newAddress.fullName || newAddress.name,
                contact_number: cleanPhone(
                  newAddress.contactNumber || newAddress.phone,
                ),
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

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
