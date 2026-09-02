"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBooking } from "@/context/BookingContext";
import { OTPVerificationModal } from "@/components/OTPVerificationModal";
import { CreditCard, Smartphone, Banknote, Lock, Wallet, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import Swal from "sweetalert2";

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useBooking();
  const [selectedPayment, setSelectedPayment] = useState<string | null>("ONLINE");
  const [showSimulatedGateway, setShowSimulatedGateway] = useState(false);
  const [simulatedGatewayMethod, setSimulatedGatewayMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string>("");

  const paymentMethods = [
    {
      id: 1,
      payment_type: "ONLINE",
    },
    {
      id: 2,
      payment_type: "COD",
    },
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
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

  const createBooking = async (paymentMethod: string, razorpayPaymentId: string = "") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        await Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login to complete your booking.",
          confirmButtonColor: "#f97316",
        });
        router.push("/login");
        return;
      }

      const bookingDateTime = JSON.parse(
        localStorage.getItem("bookingDateTime") || "{}"
      );
      const selectedAddress = JSON.parse(
        localStorage.getItem("selectedAddress") || "{}"
      );

      // Format date as YYYY-MM-DD for Laravel validation rule
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
        customer_notes: bookingDateTime.notes?.trim() || "Need urgent service",
        address_id: Number(selectedAddress?.id || 1),
        payment_type: paymentMethod,
        gst_no: "22AAAAA0000A1Z5",
        pan_no: "ABCDE1234F",
        service_category_id: Number(
          cartItems[0]?.service_category_id ||
          cartItems[0]?.serviceCategoryId ||
          1
        ),
        service_id: Number(
          cartItems[0]?.service_id || cartItems[0]?.serviceId || 1
        ),
        razorpay_payment_id: razorpayPaymentId,
        state_name: "Chhattisgarh",
        city_name: "Raipur",
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
        }
      );

      if (res.data?.status) {
        // Check if backend returned Razorpay Order details for initial ONLINE request
        if (paymentMethod === "ONLINE" && !razorpayPaymentId && res.data?.data?.razorpay_order_id) {
          const orderInfo = res.data.data;
          setPendingOrderId(orderInfo.razorpay_order_id);

          const razorKey =
            (orderInfo.key && !orderInfo.key.includes("mock") ? orderInfo.key : "") ||
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
            "rzp_test_Sg3z5bMD2SVDOG";

          const isRealRazorpayKey =
            razorKey &&
            !razorKey.includes("mock") &&
            razorKey.startsWith("rzp_") &&
            razorKey.length >= 20;

          const isLoaded = await loadRazorpayScript();

          if (isLoaded && (window as any).Razorpay) {
            try {
              const options: any = {
                key: razorKey,
                amount: orderInfo.amount,
                currency: orderInfo.currency || "INR",
                name: "TASPro Company",
                description: "Home Service Booking Payment",
                image: "https://files.catbox.moe/l742u1.png",
                handler: async function (response: any) {
                  console.log("RAZORPAY SUCCESS RESPONSE:", response);
                  await createBooking("ONLINE", response.razorpay_payment_id || `pay_${Date.now()}`);
                },
                modal: {
                  ondismiss: function () {
                    console.log("Razorpay payment modal closed by user.");
                  },
                },
                theme: {
                  color: "#FF6A00",
                },
              };

              // Only pass order_id if generated by Razorpay's API server
              if (
                orderInfo.razorpay_order_id &&
                orderInfo.razorpay_order_id.startsWith("order_rzp_")
              ) {
                options.order_id = orderInfo.razorpay_order_id;
              }

              const razorpayObj = new (window as any).Razorpay(options);
              razorpayObj.open();
              return;
            } catch (err) {
              console.log("Razorpay popup launch failed", err);
            }
          }
          return;
        }

        // Successful Booking Completion
        clearCart();
        localStorage.removeItem("bookingDateTime");
        localStorage.removeItem("selectedAddress");

        await Swal.fire({
          icon: "success",
          title: "Booking Confirmed!",
          text: "Your booking and online payment have been completed successfully.",
          confirmButtonColor: "#f97316",
          confirmButtonText: "View Order Details",
        });

        router.push("/order-confirmation");
      } else {
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          text: res.data?.message || "Unable to create booking.",
          confirmButtonColor: "#f97316",
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
          text: "Your login session has expired. Please login again to complete your booking.",
          confirmButtonColor: "#f97316",
        });
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const apiMsg =
        error?.response?.data?.message ||
        (error?.response?.data?.errors
          ? Object.values(error?.response?.data?.errors).flat().join(" ")
          : null) ||
        error?.message ||
        "Something went wrong during payment. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: apiMsg,
        confirmButtonColor: "#f97316",
      });
    }
  };

  const handlePayNow = (paymentMethod?: string) => {
    const method = paymentMethod || selectedPayment;

    if (!method) {
      Swal.fire({
        icon: "warning",
        title: "Payment Method Required",
        text: "Please select a payment method.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    createBooking(method);
  };

  const handleSimulatedPaymentSubmit = async () => {
    setIsProcessingPayment(true);
    const mockPaymentId = `pay_${simulatedGatewayMethod}_${Date.now()}`;
    await createBooking("ONLINE", mockPaymentId);
    setIsProcessingPayment(false);
  };

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

  const totalMRP = Math.round(rawTotalMRP);
  const totalAmount = Math.round(rawTotalAmount);

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

  const totalDiscount = Math.round(totalMRP - totalAmount);
  const couponDiscount = Math.round(appliedCoupon ? appliedCoupon.discount : 0);
  const finalAmount = Math.round(Math.max(totalAmount - couponDiscount, 0));

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2">
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">
              Checkout
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">
              Choose your preferred payment method to complete your booking. We ensure all transactions are safe and encrypted for your security.
            </p>

            {/* Payment Options Header */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900">
                Payment Options
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedPayment === method.payment_type;

                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPayment(method.payment_type)}
                      className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${isSelected
                          ? "border-[#FF6A00] bg-orange-50/40 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isSelected ? "bg-[#FF6A00] text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                          {method.payment_type === "ONLINE" && (
                            <CreditCard className="w-5 h-5" />
                          )}
                          {method.payment_type === "COD" && (
                            <Banknote className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            {method.payment_type === "ONLINE"
                              ? "Online Payment"
                              : "Cash on Delivery"}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {method.payment_type === "ONLINE"
                              ? "Pay securely via Razorpay, Cards, UPI or Wallets"
                              : "Pay cash after service completion"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                            ? "border-[#FF6A00] bg-[#FF6A00]"
                            : "border-gray-300"
                          }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-gray-900">
                Amount Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Item ({cartItems.length})</span>
                  <span>₹{totalMRP}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Total Discount</span>
                    <span>-₹{totalDiscount}</span>
                  </div>
                )}

                <div className={`flex justify-between ${couponDiscount > 0 ? "text-green-600 font-bold" : "text-gray-500"}`}>
                  <span>Coupon Discount {appliedCoupon ? `(${appliedCoupon.code})` : ""}</span>
                  <span>{couponDiscount > 0 ? `-₹${couponDiscount}` : "₹0"}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>

              <button
                disabled={!selectedPayment}
                onClick={() => handlePayNow(selectedPayment || "ONLINE")}
                className={`w-full py-3.5 rounded-xl text-white font-bold transition-all text-sm ${selectedPayment
                    ? "bg-[#FF6A00] hover:bg-orange-600 shadow-md"
                    : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                Pay ₹{finalAmount}
              </button>

              <div className="flex flex-col items-center justify-center gap-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Safe & secure checkout</span>
                </div>
                <img src="/grp.png" alt="Payment Methods" className="h-4 object-contain" />
              </div>
            </div>

            <div className="hidden sm:flex justify-center items-center mx-auto gap-3 w-full py-4 mt-2">
              <img src="/tick.png" alt="Verified Service" className="w-8 h-6" />
              <p className="text-xs font-semibold text-gray-500 leading-snug">
                Easy Cancellation/Returns, Background Verified Service Provider.
              </p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
