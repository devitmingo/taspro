"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { TermsConditionsModal } from "@/components/TermsConditionsModal";
import { Trash2, ChevronDown, ArrowLeft } from "lucide-react";
import { SelectDateTimeModal } from "@/components/booking-flow/SelectDateTimeModal";
import { SelectAddressModal } from "@/components/booking-flow/SelectAddressModal";
import AddNewAddressModal from "@/components/AddNewAddressModal";
import YouMayLikeServices from "@/components/YouMayLikeServices";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";
import Image from "next/image";
import Swal from "sweetalert2";

const frequentlyAdded = [
  {
    id: 1,
    title: "AC Repair (Split)",
    price: 299,
    originalPrice: 499,
    image: "/tas.logo.png",
  },
  {
    id: 2,
    title: "Drain Clean AC",
    price: 499,
    originalPrice: 799,
    image: "/tas.logo.png",
  },
  {
    id: 3,
    title: "AC Gas Refill",
    price: 1499,
    originalPrice: 1999,
    image: "/tas.logo.png",
  },
  {
    id: 4,
    title: "AC Installation",
    price: 999,
    originalPrice: 1299,
    image: "/tas.logo.png",
  },
];

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isLogged = Boolean(user || token);

  const {
    cartItems,
    
    addToCart,
    removeFromCart,
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

  useEffect(() => {
    const handleLocChange = (e: any) => {
      if (e.detail) {
        setSelectedLoc({
          state: e.detail.state || "Chhattisgarh",
          city: e.detail.city || "Durg",
        });
        // User changed location from navbar -> redirect to Home page
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
          });
          setLocationPrices(priceMap);
        }
      } catch (err) {
        console.log("Cart location price fetch error:", err);
      }
    };

    fetchLocationPrices();
  }, [cartItems, selectedLoc]);

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
  const totalDiscount = Math.round(totalMRP - totalAmount);
  const couponDiscount = Math.round(appliedCoupon ? appliedCoupon.discount : 0);
  const finalAmount = Math.round(Math.max(totalAmount - couponDiscount, 0));

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
  }, []);

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

    const altRaw = formData.alternateNumber || formData.altPhone || "";
    const altDigits = altRaw
      .replace(/\D/g, "")
      .replace(/^91/, "")
      .replace(/^0/, "");

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

      house_number: formData.houseNo || "",

      street: formData.roadLandmark || formData.location || "",

      type: "Home",
      is_active: 1,
    };

    payload.alt_contact_number =
      altDigits.length === 10 ? `+91 ${altDigits}` : payload.contact_number;

      
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

const createCustomerCart = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    await Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please login to continue booking.",
      confirmButtonColor: "#f97316",
    });

    router.push("/login");
    return;
  }

  if (!cartItems.length) {
    await Swal.fire({
      icon: "warning",
      title: "Cart Empty",
      text: "Please add at least one service to continue.",
      confirmButtonColor: "#f97316",
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

    // Proceed to slot selection & payment flow
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
        confirmButtonColor: "#f97316",
      });

      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    await Swal.fire({
      icon: "error",
      title: "Failed",
      text:
        error?.response?.data?.message ||
        "Unable to create cart. Please try again.",
      confirmButtonColor: "#f97316",
    });
  } finally {
    setCartLoading(false);
  }
};
const handleAddItem = (item: any) => {
  addToCart(item);
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
      <div className="min-h-screen dark:bg-gray-900">
        <main className="max-w-7xl mx-auto  md:px-5 lg:px-8">
          <h1 className="hidden md:block text-2xl font-bold text-gray-900 dark:text-white mb-5">
            Cart Summary
          </h1>

          <div className="relative w-full flex items-center justify-center md:hidden pt-2">
            <button
              onClick={() => router.back()}
              className="absolute left-0 text-black dark:text-white hover:text-orange-500 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <h1 className="text-sm font-semibold text-black dark:text-white">
              Cart View
            </h1>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="hidden md:block rounded-xl border border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Details
                </h2>

                <div className="flex items-start justify-between flex-wrap gap-5">
                  {isLogged && displayAddress ? (
                    <div>
                      <p className="font-medium text-gray-800">
                        {displayAddress.full_name || (user as any)?.name || "Customer Name"}
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {displayAddress.type || "Home"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-500 mt-1 max-w-md">
                        {displayAddress.house_number}, {displayAddress.street}
                        , {displayAddress.city?.name || displayAddress.city_name || "Raipur"}{" "}
                        {displayAddress.postal_code}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {displayAddress.contact_number || user?.phone}
                      </p>
                    </div>
                  ) : isLogged ? (
                    <div>
                      <p className="text-sm text-gray-500">
                        No saved address found. Add a new address to continue booking.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Please login to view saved address
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Log in to auto-populate your saved service address.
                      </p>
                    </div>
                  )}

                  {isLogged ? (
                    <button
                      onClick={() => {
                        setIsBookingFlow(false);
                        setShowAddressModal(true);
                      }}
                      className="border border-orange-500 text-orange-500 px-4 py-1.5 rounded-lg text-sm hover:bg-orange-50 transition-colors"
                    >
                      {displayAddress ? "Change Address" : "Add Address"}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/login")}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-4 py-1.5 rounded-lg text-sm transition-colors shadow-xs"
                    >
                      Login / Sign In
                    </button>
                  )}
                </div>
              </div>

              <div className="sm:p-5 shadow-sm">
                <h2 className="sm:block hidden text-lg font-semibold text-gray-900 mb-5">
                  Order Summary
                </h2>

                <div className="space-y-6">
                  {cartItems?.length > 0 ? (
                    cartItems.map((item: any) => {
                      const qty = item.quantity || 1;
                      const { price, originalPrice } = getItemActivePrices(item);

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 sm:gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-gray-200 transition-all"
                        >
                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 truncate">
                              {item.name || item.title || item.subService}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                              ({item.subCategoryName || item.serviceName || item.service_name || "Service"})
                            </p>
                          </div>

                          {/* Quantity Counter */}
                          <div className="flex items-center border border-orange-500 rounded-full px-3 py-1 bg-orange-50/50 gap-2.5 shrink-0">
                            <button
                              onClick={() => updateQuantity(item, "decrease")}
                              className="text-orange-600 font-black text-sm hover:scale-110 transition-transform px-1"
                            >
                              −
                            </button>
                            <span className="text-xs font-black text-gray-900 min-w-[14px] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item, "increase")}
                              className="text-orange-600 font-black text-sm hover:scale-110 transition-transform px-1"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right min-w-[65px] shrink-0">
                            <p className="text-xs sm:text-sm font-black text-gray-900">
                              ₹{price * qty}
                            </p>
                            {originalPrice > price ? (
                              <p className="text-[10px] text-gray-400 line-through font-semibold">
                                ₹{originalPrice * qty}
                              </p>
                            ) : null}
                          </div>

                          {/* Remove Icon */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No items in cart</p>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 gap-5 flex flex-col sticky top-6">
              <div className="border border-orange-500 rounded-xl px-4 py-3 bg-orange-50/20">
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="w-full flex items-center justify-between"
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
                    {/* Applied Badge */}
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
                          className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      /* Input Box */
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="Enter Coupon Code (e.g. TASPRO50)"
                            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#FF6A00] uppercase font-bold"
                          />
                          <button
                            onClick={() => handleApplyCoupon()}
                            className="px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] text-red-500 mt-1 font-medium">{couponError}</p>
                        )}
                      </div>
                    )}

                    {/* Coupons List */}
                    <div className="space-y-2.5 pt-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                            className="text-xs font-bold text-[#FF6A00] border border-[#FF6A00] px-3 py-1 rounded-lg hover:bg-orange-50 disabled:opacity-40"
                          >
                            {appliedCoupon?.code === c.code ? "Applied" : "Apply"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* MOBILE PAYMENT SUMMARY */}
              <div className="sm:hidden rounded-[20px] shadow-sm">
                <h2 className="text-[14px] font-semibold text-[#111] mb-2">
                  Payment Summary
                </h2>

                <div className="space-y-3 border border-[#E5E5E5] p-3 py-5 rounded-xl">
                  <div className="flex justify-between text-[#7A7A7A] text-[16px]">
                    <span className="text-sm">Item Total</span>
                    <span className="font-medium text-black text-sm">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-[16px]">
                      <span className="text-sm font-semibold">Coupon Discount ({appliedCoupon?.code})</span>
                      <span className="font-bold text-sm">
                        -₹{couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <hr className="my-4" />

                  <div className="flex justify-between font-semibold text-[20px] text-black">
                    <span className="text-sm">Total</span>
                    <span className="text-sm">₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t shadow-xl border-gray-200 px-4 py-3 z-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="border border-gray-300 rounded-lg px-3 py-1 text-sm font-medium">
                      {cartItems.length} Item
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#222]">
                          ₹{finalAmount}
                        </span>

                        {totalMRP > finalAmount && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{totalMRP}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={createCustomerCart}
                    disabled={cartLoading}
                    className="py-2 px-5 rounded-full bg-orange-500 text-white font-semibold text-sm"
                  >
                    {cartLoading ? "Loading..." : "Continue"}
                  </button>
                </div>
              </div>
              {/* DESKTOP PAYMENT SUMMARY */}
              <div className="hidden sm:block rounded-2xl p-5 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Summary
                </h2>

                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Item ({cartItems.length})</span>
                    <span>₹{totalMRP.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>Total Discount</span>
                    <span>-₹{totalDiscount.toFixed(0)}</span>
                  </div>

                  <div className={`flex justify-between ${couponDiscount > 0 ? "text-green-600 font-bold" : "text-gray-500"}`}>
                    <span>Coupon Discount {appliedCoupon ? `(${appliedCoupon.code})` : ""}</span>
                    <span>{couponDiscount > 0 ? `-₹${couponDiscount}` : "₹0"}</span>
                  </div>
                </div>

                <div className="flex justify-between font-semibold text-lg mb-4">
                  <span>Total Amount</span>
                  <span>₹{finalAmount}</span>
                </div>

                <button
                  className="w-full py-3 rounded-full text-white font-semibold bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-60"
                  onClick={createCustomerCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? "Creating Cart..." : "Continue"}
                </button>

                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-500 text-center mt-3">
                    🔒 Safe & secure checkout
                  </p>

                  <img
                    src="/grp.png"
                    alt="Payment Methods"
                    className="w-40 mt-4"
                  />
                </div>
              </div>
              <div className="hidden sm:flex justify-center items-center mx-auto gap-3 w-full">
                <img src="/tick.png" alt="tick" className="w-8 h-6" />
                <p className="text-sm font-bold text-[#666666] w-3/4">
                  Easy Cancellation/Returns, BackgroundVerified Service Provide.
                </p>
              </div>
            </div>
          </div>
        </main>

        <YouMayLikeServices
          title="Frequently Added Together"
          categoryId={cartItems[0]?.service_category_id || cartItems[0]?.serviceCategoryId || 1}
          serviceId={cartItems[0]?.service_id || cartItems[0]?.serviceId}
        />
        <SelectAddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          addresses={addresses}
          onContinue={(address) => {
            setSelectedAddress(address);

            localStorage.setItem("selectedAddress", JSON.stringify(address));

            setShowAddressModal(false);

            if (isBookingFlow) {
              setShowTCModal(true); // only after slot selection
            }
          }}
          onAddNew={() => {
            setEditingAddress(null);
            setShowAddressModal(false);
            setShowAddNewAddressModal(true);
          }}
        />

        <SelectDateTimeModal
          isOpen={showDateTimeModal}
          onClose={() => setShowDateTimeModal(false)}
          onContinue={handleDateTimeContinue}
          serviceId={
            cartItems?.[0]?.service_id || cartItems?.[0]?.serviceId || 1
          }
        />

        <AddNewAddressModal
          isOpen={showAddNewAddressModal}
          onClose={() => {
            setShowAddNewAddressModal(false);
            setEditingAddress(null);
          }}
          onSave={async (newAddress) => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
              await addCustomerAddress(token, newAddress);
              await fetchAddresses();

              setShowAddNewAddressModal(false);
              setEditingAddress(null);
              setShowAddressModal(true);
            } catch (error: any) {
              console.log("VALIDATION ERROR:", error.response?.data || error);
            }
          }}
        />

        <TermsConditionsModal
          isOpen={showTCModal}
          onClose={() => setShowTCModal(false)}
          onConfirm={() => router.push("/booking-payment")}
        />
      </div>
    </>
  );
}
