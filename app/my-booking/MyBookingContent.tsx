"use client";

import { useState, useEffect, useRef } from "react";
import { API_BASE_URL as BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Calendar,
  Package,
  User,
  ChevronRight,
  ChevronDown,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Star,
  IndianRupee,
  Filter,
  Search,
  X,
  ArrowLeft,
  UserRound,
  ClipboardList,
  Wrench,
  House,
  PlusCircle,
  Pencil,
  CalendarClock,
  Info,
  Clock3,
  XCircle,
  Download,
  CheckCircle2,
  Sparkles,
  Headphones,
  ShieldCheck,
  Award,
  FileText,
  CreditCard,
  RefreshCw,
  Lock,
  Receipt,
  Check,
  ListOrdered,
  AlertCircle,
  Eye,
  Banknote,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BookingDetailsModal from "@/components/BookingDetailsModal";
import RescheduleModal from "@/components/RescheduleModal";
import CancelBookingModal from "@/components/CancelBookingModal";
import BookingCancelledModal from "@/components/BookingCancelledModal";
import BookingSuccessModal from "@/components/BookingSuccessModal";
import InvoiceModal from "@/components/InvoiceModal";
import BookingCard from "@/components/BookingCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SplitACModal from "@/components/SplitACModal";
import ChatBotPanel from "@/components/ChatBotPanel";
import { SelectAddressModal } from "@/components/booking-flow/SelectAddressModal";
import AddNewAddressModal from "@/components/AddNewAddressModal";
import { SelectDateTimeModal } from "@/components/booking-flow/SelectDateTimeModal";
import Link from "next/link";
import Breadcrumb from "@/components/account/Breadcrumb";
import { usePathname, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  AssignmentTurnedIn,
  SupportAgent,
  PersonAdd,
  Verified,
} from "@mui/icons-material";




const iconMap: Record<string, JSX.Element> = {
  "assignment-turned-in": <AssignmentTurnedIn fontSize="small" />,
  "support-agent": <SupportAgent fontSize="small" />,
  "person-add": <PersonAdd fontSize="small" />,
  verified: <Verified fontSize="small" />,
  "event-repeat": <CalendarClock fontSize="small" />,
};

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
// import { AddNewAddressModal } from "@/components/booking-flow/AddNewAddressModal";


const DEFAULT_MOCK_BOOKINGS = [
  {
    id: 42,
    order: 1,
    booking_id: "TAS-230614-00821",
    title: "AC Repair",
    service: "AC Repair",
    category_name: "Repair & Gas Refill",
    date: "14 Jun 2023",
    time: "10:00 AM",
    status: "Pending",
    timeline_status: "Order Confirmed",
    payment_status: "Payment Pending",
    total_amount: 1250,
    price: 1250,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=240&auto=format&fit=crop",
    is_highlighted: true,
  },
  {
    id: 43,
    order: 2,
    booking_id: "TAS-230610-00756",
    title: "Washing Machine Repair",
    service: "Washing Machine Repair",
    category_name: "Motor & Drum Inspection",
    date: "10 Jun 2023",
    time: "02:00 PM",
    status: "Completed",
    timeline_status: "Completed",
    payment_status: "Paid",
    total_amount: 850,
    price: 850,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: 44,
    order: 3,
    booking_id: "TAS-230605-00678",
    title: "Kitchen Chimney Cleaning",
    service: "Kitchen Chimney Cleaning",
    category_name: "Deep Degreasing & Filter Wash",
    date: "05 Jun 2023",
    time: "11:00 AM",
    status: "Completed",
    timeline_status: "Completed",
    payment_status: "Paid",
    total_amount: 950,
    price: 950,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: 45,
    order: 4,
    booking_id: "TAS-230528-00543",
    title: "Geyser Repair",
    service: "Geyser Repair",
    category_name: "Thermostat & Heating Element",
    date: "28 May 2023",
    time: "04:00 PM",
    status: "Cancelled",
    timeline_status: "Cancelled",
    payment_status: "Payment Pending",
    total_amount: 0,
    price: 0,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: 46,
    order: 5,
    booking_id: "TAS-230520-00432",
    title: "Refrigerator Repair",
    service: "Refrigerator Repair",
    category_name: "Gas Refill & Cooling Check",
    date: "20 May 2023",
    time: "12:00 PM",
    status: "Completed",
    timeline_status: "Completed",
    payment_status: "Paid",
    total_amount: 1100,
    price: 1100,
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: 47,
    order: 6,
    booking_id: "TAS-230515-00318",
    title: "Water Purifier Service",
    service: "Water Purifier Service",
    category_name: "Filter Replacement & TDS Check",
    date: "15 May 2023",
    time: "11:30 AM",
    status: "Pending",
    timeline_status: "Order Confirmed",
    payment_status: "Payment Pending",
    total_amount: 650,
    price: 650,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=240&auto=format&fit=crop",
  },
];

const MyBookingContent = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
const [showMenu, setShowMenu] = useState(false);

  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "price_high" | "price_low">("latest");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "rejected" | "completed">("all");
  const [profile, setProfile] = useState<any>(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [showTracking, setShowTracking] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [selectedChatBooking, setSelectedChatBooking] = useState<any>(null);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelledSuccess, setShowCancelledSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetailsPage, setShowBookingDetailsPage] = useState(false);
  const [showSelectAddressModal, setShowSelectAddressModal] = useState(false);
  const [showAddNewAddressModal, setShowAddNewAddressModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const [alternateNumber, setAlternateNumber] = useState("");
  const [showAlternateModal, setShowAlternateModal] = useState(false);
  const [savingAlternate, setSavingAlternate] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const [showOffers, setShowOffers] = useState(false);
  const [couponInput, setCouponInput] = useState("ABCD2788EF");
  const [showPaymentHistory, setShowPaymentHistory] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"cash" | "online">("cash");
  const [isSubmittingCash, setIsSubmittingCash] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [documentType, setDocumentType] = useState<"estimate" | "invoice">("estimate");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleOpenDocument = (type: "estimate" | "invoice") => {
    setDocumentType(type);
    setShowInvoiceModal(true);
  };

  const handleOpenReviewModal = () => {
    const existingRating = Number(bookingDetails?.review_details?.rating) || 5;
    const existingText = bookingDetails?.review_details?.review_text || "";
    setReviewRating(existingRating);
    setReviewComment(existingText);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || reviewRating < 1) {
      toast.error("Please select a star rating (1 to 5).");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please enter a short review message.");
      return;
    }

    if (!numericBookingId) {
      toast.error("Booking identifier not found.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to submit your review.");
        setIsSubmittingReview(false);
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/customers/bookings-store-feedback`,
        {
          booking_id: numericBookingId,
          rating: reviewRating,
          review: reviewComment.trim(),
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.status) {
        setShowReviewModal(false);
        Swal.fire({
          icon: "success",
          title: "Review Submitted!",
          text: "Thank you for sharing your feedback with TASpro.",
          confirmButtonColor: "#FF6A00",
        });
        await fetchBookingDetails(numericBookingId);
        await fetchBookings();
      } else {
        toast.error(res.data?.message || "Failed to submit review.");
      }
    } catch (err: any) {
      console.error("Submit review error:", err);
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };



  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const trackingInfo = bookingDetails?.tracking_info;

  const [customerAddress, setCustomerAddress] = useState<any>(null);
  const trackingSteps = bookingDetails?.tracking_info?.tracking_steps || [];
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStep =
    trackingInfo?.tracking_steps?.find(
      (step: any) => step.id === trackingInfo.current_status_id,
    ) || trackingInfo?.tracking_steps?.[0];

  // Progress badge
  const badgeText =
    currentStep?.status === "completed"
      ? "COMPLETED"
      : currentStep?.status === "in_progress"
        ? "IN PROGRESS"
        : currentStep?.status?.toUpperCase() || "PENDING";

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        setBookings([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/customers/customer-bookings?page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      console.log("Bookings API Response:", response.data);

      if (response.data?.status) {
        const rawList = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data?.data || [];
        setBookings(rawList);
      }
    } catch (error: any) {
      console.error("Booking fetch error:", error);
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") return;

      const res = await axios.get(`${BASE_URL}/customers/profile`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.status) {
        setProfile(res.data.data);
      }
    } catch (error: any) {
      console.log("Profile fetch error:", error);
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  };

  useEffect(() => {
    loadRazorpayScript();
    fetchBookings();
    fetchCustomerAddress();
    fetchProfile();
  }, []);

   const fetchCustomerAddress = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") return;
  try {
    const res = await axios.get(`${BASE_URL}/customers/customer-addresses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data?.status && Array.isArray(res.data?.data) && res.data.data.length > 0) {
      setCustomerAddress(res.data.data[0]);

      setAlternateNumber(
        res.data.data[0].alt_contact_number || ""
      );
    }
  } catch (error: any) {
    console.log(error);
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
};


const handleSaveAlternateNumber = async () => {
  if (alternateNumber.length !== 10) {
    toast.error("Enter a valid mobile number");
    return;
  }

  if (!customerAddress) {
    toast.error("Customer address not found");
    return;
  }

  try {
    setSavingAlternate(true);
const token = localStorage.getItem("token");

 const payload = {
   full_name: customerAddress.full_name,
   contact_number: customerAddress.contact_number,
   alt_contact_number: alternateNumber,
   postal_code: customerAddress.postal_code,
   latitude: customerAddress.latitude,
   longitude: customerAddress.longitude,
   state_name: customerAddress.state.name,
   city_name: customerAddress.city.name.replace("Unknown Type: ", ""),
   house_number: customerAddress.house_number,
   street: customerAddress.street,
   type: customerAddress.type,
   is_active: customerAddress.is_active,
 };

 console.log("Payload:", payload);

 const response = await axios.put(
   `${BASE_URL}/customers/customer-addresses/${customerAddress.id}`,
   payload,
   {
     headers: {
       Authorization: `Bearer ${token}`,
       Accept: "application/json",
       "Content-Type": "application/json",
     },
   },
 );

 await fetchCustomerAddress();

console.log("Updated Address:", customerAddress);

 console.log("Response:", response.data);
    // Update local state
    setCustomerAddress((prev: any) => ({
      ...prev,
      alt_contact_number: alternateNumber,
    }));

    // Update booking UI
    setBookingDetails((prev: any) => ({
      ...prev,
      customer_details: {
        ...prev.customer_details,
        alt_mobile: alternateNumber,
      },
    }));

    toast.success("Alternate number updated");

    setShowAlternateModal(false);
  } catch (error: any) {
    console.log(error.response?.data);
    toast.error(error.response?.data?.message || "Unable to update");
  } finally {
    setSavingAlternate(false);
  }
};
  const cancelBooking = async (bookingId: number, data: any) => {
    const token = localStorage.getItem("token");

    const payload = {
      cancel_reason_id: Number(data.cancel_reason_id),
      cancel_reason: data.cancel_reason,
    };

    console.log("Sending payload:", payload);

    const res = await axios.put(
      `${BASE_URL}/customers/cancel-booking/${bookingId}`,
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

  // import axios from "axios";

  const rescheduleBooking = async ({
    booking_id,
    slot_id,
    date,
    customer_notes,
  }: {
    booking_id: number;
    slot_id: number;
    date: string;
    customer_notes: string;
  }) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${BASE_URL}/customers/bookings-reschedule`,
      {
        booking_id,
        slot_id,
        date,
        customer_notes,
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  };

const handleReschedule = async (data: {
  slot_id: number;
  date: string;
  customer_notes: string;
}) => {
  const targetBookingId =
    selectedBooking?.booking_id ||
    selectedBooking?.id ||
    bookingDetails?.booking?.booking_id ||
    bookingDetails?.id;

  if (!targetBookingId) return;

  try {
    const result = await rescheduleBooking({
      booking_id: Number(targetBookingId),
      slot_id: data.slot_id,
      date: data.date,
      customer_notes: data.customer_notes,
    });

    if (result.status) {
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: result.message || "Booking rescheduled successfully.",
        confirmButtonColor: "#f97316",
      });

      setShowRescheduleModal(false);

      await fetchBookings();

      if (targetBookingId) {
        await fetchBookingDetails(Number(targetBookingId));
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: result.message || "Unable to reschedule booking.",
        confirmButtonColor: "#f97316",
      });
    }
  } catch (error: any) {
    console.log("API ERROR", error?.response?.data);

    if (
      error?.response?.status === 401 ||
      error?.response?.data?.message === "Unauthenticated."
    ) {
      localStorage.removeItem("token");

      await Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please login again.",
        confirmButtonColor: "#f97316",
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("redirectAfterLogin", "/my-booking");
      }
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }

    Swal.fire({
      icon: "error",
      title: "Oops!",
      text:
        error?.response?.data?.message ||
        "Something went wrong while rescheduling your booking.",
      confirmButtonColor: "#f97316",
    });
  }
};

  // import axios from "axios";
const handleTrackDetails = async (bookingId: number) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${BASE_URL}/customers/customer-bookings/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    console.log("Track Details:", res.data);

    // Save complete booking details
    setBookingDetails(res.data.data);

    // Or if you only want tracking steps
    setTrackingData(res.data.data?.tracking_info?.tracking_steps || []);

    setShowTracking(true);
  } catch (err: any) {
    console.log(err.response?.data || err.message);
  }
};

// const trackingSteps = bookingDetails?.tracking_info?.tracking_steps || [];

const currentIndex = trackingSteps.findIndex(
  (step: any) => step.status === "in_progress",
);

const timeline = trackingSteps.map((step: any, index: number) => ({
  ...step,
  completed: step.status === "completed",
  current: step.status === "in_progress",
  pending: step.status === "pending",
}));

  const successBookingCancel = () => {
    setShowCancelledSuccess(true);
  };

  const fetchBookingDetails = async (bookingId: string | number) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/customers/customer-bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (res.data?.status && res.data?.data) {
        setBookingDetails(res.data.data);
        setSelectedBooking((prev: any) => ({
          ...(prev || {}),
          ...res.data.data,
          id: res.data.data.booking?.booking_id || prev?.id || bookingId,
          booking_id: res.data.data.booking?.booking_no || prev?.booking_id,
          status: res.data.data.delivery_status?.status || prev?.status,
        }));
        setShowBookingDetailsPage(true);
      }
    } catch (error) {
      console.error("Booking Details Error", error);
    }
  };

  useEffect(() => {
    const chatParam = searchParams.get("chat");
    const bookingIdParam = searchParams.get("bookingId") || searchParams.get("id");
    if (chatParam) {
      setShowChatBot(true);
      setShowBookingDetailsPage(false);
      if (bookingIdParam) {
        fetchBookingDetails(bookingIdParam);
      }
    } else if (bookingIdParam) {
      setShowChatBot(false);
      setShowBookingDetailsPage(true);
      const target = bookings.find(
        (b) => String(b.id) === String(bookingIdParam) || b.booking_id === bookingIdParam
      );
      if (target) {
        setSelectedBooking(target);
      }
      fetchBookingDetails(bookingIdParam);
    } else {
      setShowBookingDetailsPage(false);
      setShowChatBot(false);
      setSelectedBooking(null);
      setBookingDetails(null);
    }
  }, [searchParams, bookings.length]);

  useEffect(() => {
    if (bookingDetails?.payment_method) {
      const method = String(bookingDetails.payment_method).toUpperCase();
      if (method.includes("ONLINE") || method.includes("RAZORPAY")) {
        setSelectedPaymentMode("online");
      } else {
        setSelectedPaymentMode("cash");
      }
    }
  }, [bookingDetails?.payment_method]);

  const handleRescheduleContinue = async (
    date: string,
    time: string,
    notes: string,
  ) => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem("token");

      const slotMap: Record<string, number> = {
        "09:00 AM - 11:00 AM": 1,
        "11:00 AM - 01:00 PM": 2,
        "01:00 PM - 03:00 PM": 3,
        "03:00 PM - 05:00 PM": 4,
        "05:00 PM - 07:00 PM": 5,
      };

      const payload = {
        booking_id: selectedBooking.booking_id || selectedBooking.id,
        booking_detail_id:
          selectedBooking.booking_detail_id || selectedBooking.bookingDetailId,
        slot_id: slotMap[time] || 5,
        date,
        customer_notes: notes || "Need to reschedule due to personal reasons.",
      };

      const response = await axios.post(
        `${BASE_URL}/customer/bookings-reschedule`,
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Reschedule success:", response.data);

      setSelectedBooking((prev: any) => ({
        ...prev,
        date,
        time,
        notes,
      }));

      setShowRescheduleModal(false);
      fetchBookings();
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(
        "Reschedule booking failed:",
        error.response?.data || error.message,
      );
    }
  };

  const handleOpenChat = (booking: any) => {
    setSelectedChatBooking(booking);
    setShowChatBot(true);
    setShowBookingDetailsPage(false);
  };

  // Mock booking data
  // const bookings = {
  //   pending: [
  //     {
  //       id: "BK-001",
  //       service: "AC Repair Service",
  //       serviceImage: "/service-ac.jpg",
  //       date: "15 Feb 2024",
  //       time: "10:00 AM - 12:00 PM",
  //       status: "Pending",
  //       amount: 1299,
  //       address: "123 Main Street, Raipur",
  //       technician: "Raj Kumar",
  //       technicianRating: 4.8,
  //     } as PendingBooking,
  //     {
  //       id: "BK-002",
  //       service: "Plumbing Service",
  //       serviceImage: "/service-plumbing.jpg",
  //       date: "18 Feb 2024",
  //       time: "2:00 PM - 4:00 PM",
  //       status: "Pending",
  //       amount: 899,
  //       address: "456 Park Avenue, Raipur",
  //       technician: "Amit Sharma",
  //       technicianRating: 4.9,
  //     } as PendingBooking,
  //   ],
  //   rejected: [
  //     {
  //       id: "BK-003",
  //       service: "Electrician Service",
  //       serviceImage: "/service-electrician.jpg",
  //       date: "10 Feb 2024",
  //       time: "11:00 AM - 1:00 PM",
  //       status: "Rejected",
  //       amount: 1599,
  //       address: "789 Oak Street, Raipur",
  //       reason: "Technician unavailable for selected slot",
  //     } as RejectedBooking,
  //   ],
  //   completed: [
  //     {
  //       id: "BK-004",
  //       service: "Home Cleaning",
  //       serviceImage: "/service-cleaning.jpg",
  //       date: "01 Feb 2024",
  //       time: "9:00 AM - 11:00 AM",
  //       status: "Completed",
  //       amount: 2499,
  //       address: "321 Elm Road, Raipur",
  //       rating: 5,
  //       review: "Excellent service! Technician was professional and thorough.",
  //     } as CompletedBooking,
  //     {
  //       id: "BK-005",
  //       service: "Appliance Repair",
  //       serviceImage: "/service-appliance.jpg",
  //       date: "25 Jan 2024",
  //       time: "3:00 PM - 5:00 PM",
  //       status: "Completed",
  //       amount: 1899,
  //       address: "654 Pine Street, Raipur",
  //       rating: 4,
  //       review: "Good service, completed on time.",
  //     } as CompletedBooking,
  //   ],
  // };
  // const filteredBookings =
  //   bookings?.filter((booking) => {
  //     if (activeTab === "pending")
  //       return booking.status?.toLowerCase() === "pending";

  //     if (activeTab === "completed")
  //       return booking.status?.toLowerCase() === "completed";

  //     if (activeTab === "rejected")
  //       return booking.status?.toLowerCase() === "rejected";

  //     return true;
  //   }) || [];




  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const activeUser = user || {
    id: 1,
    phone: "9644430161",
    firstName: "Amit",
    lastName: "",
    email: "amitjaiswal1990@gmail.com",
    profileCompleted: true,
    contactVerified: true,
  };

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.name ||
    activeUser?.firstName ||
    (activeUser as any)?.name ||
    "Amit";

  const displayEmail = profile?.email || activeUser?.email || "amitjaiswal1990@gmail.com";
  const displayPhone = profile?.mobile || (activeUser as any)?.phone || "9644430161";
  const avatarUrl =
    profile?.profile_url ||
    (user as any)?.profileImage ||
    "/img/profileimg.png";

  const displayList = (bookings && bookings.length > 0) ? bookings : (loading ? [] : DEFAULT_MOCK_BOOKINGS);

  const allCount = displayList.length;
  const pendingCount = displayList.filter((b: any) => {
    const s = (b.status || "").toLowerCase();
    return s !== "completed" && s !== "rejected" && s !== "cancelled";
  }).length;

  const completedCount = displayList.filter((b: any) => {
    const s = (b.status || "").toLowerCase();
    return s === "completed";
  }).length;

  const cancelledCount = displayList.filter((b: any) => {
    const s = (b.status || "").toLowerCase();
    return s === "rejected" || s === "cancelled";
  }).length;

  const filteredBookings = displayList.filter((booking: any) => {
    const status = (booking.status || "").toLowerCase();
    if (activeTab === "pending") {
      return (
        status !== "completed" &&
        status !== "rejected" &&
        status !== "cancelled"
      );
    }
    if (activeTab === "completed") {
      return status === "completed";
    }
    if (activeTab === "rejected") {
      return status === "rejected" || status === "cancelled";
    }
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a: any, b: any) => {
    if (sortBy === "oldest") {
      return (Number(a.order || a.id) || 0) - (Number(b.order || b.id) || 0);
    }
    if (sortBy === "price_high") {
      return Number(b.total_amount ?? b.price ?? 0) - Number(a.total_amount ?? a.price ?? 0);
    }
    if (sortBy === "price_low") {
      return Number(a.total_amount ?? a.price ?? 0) - Number(b.total_amount ?? b.price ?? 0);
    }
    return (Number(b.order || b.id) || 0) - (Number(a.order || a.id) || 0);
  });

  const getBookingStatusBadge = (status?: string) => {
    const norm = (status || "").toLowerCase();
    if (norm === "completed") {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500",
        label: "Completed",
      };
    }
    if (norm.includes("cancel") || norm.includes("reject")) {
      return {
        bg: "bg-red-50 text-red-700 border-red-200/80",
        dot: "bg-red-500",
        label: "Cancelled",
      };
    }
    if (norm === "in progress" || norm === "assigned") {
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-200/80",
        dot: "bg-blue-500",
        label: "In Progress",
      };
    }
    if (norm === "rescheduled") {
      return {
        bg: "bg-purple-50 text-purple-700 border-purple-200/80",
        dot: "bg-purple-500",
        label: "Rescheduled",
      };
    }
    return {
      bg: "bg-amber-50 text-amber-800 border-amber-200/80",
      dot: "bg-amber-500",
      label: "Pending",
    };
  };

  const getTimelineStatusBadge = (status?: string) => {
    const norm = (status || "").toLowerCase();
    if (norm === "completed" || norm === "delivered") {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500",
        label: "Completed",
      };
    }
    if (norm.includes("cancel") || norm.includes("reject")) {
      return {
        bg: "bg-rose-50 text-rose-700 border-rose-200/80",
        dot: "bg-rose-500",
        label: "Cancelled",
      };
    }
    if (norm === "rescheduled") {
      return {
        bg: "bg-purple-50 text-purple-700 border-purple-200/80",
        dot: "bg-purple-500",
        label: "Rescheduled",
      };
    }
    if (norm.includes("provider assigned") || norm.includes("vendor assigned") || norm === "assigned") {
      return {
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
        dot: "bg-indigo-500",
        label: "Provider Assigned",
      };
    }
    if (norm.includes("visit") || norm.includes("progress")) {
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-200/80",
        dot: "bg-blue-500",
        label: "Service Visit",
      };
    }
    return {
      bg: "bg-amber-50 text-amber-800 border-amber-200/80",
      dot: "bg-amber-500",
      label: status || "Order Confirmed",
    };
  };

  const getPaymentStatusBadge = (payStatus?: string, payMethod?: string) => {
    const norm = (payStatus || "").toLowerCase();
    if (norm === "paid" || norm === "success" || norm === "completed") {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        icon: "paid",
        label: "Paid",
      };
    }
    if (norm === "partial" || norm === "partially paid") {
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-200/80",
        icon: "partial",
        label: "Partially Paid",
      };
    }
    const methodStr = (payMethod || "").toUpperCase();
    return {
      bg: "bg-orange-50 text-[#FF6A00] border-orange-200/80",
      icon: "pending",
      label: methodStr.includes("COD") || methodStr.includes("CASH") ? "Pending (COD)" : "Payment Pending",
    };
  };

  // Derived dynamic booking values for details page
  const bData = bookingDetails || selectedBooking;
  const bBooking = bookingDetails?.booking || selectedBooking;
  const bService = bookingDetails?.service_details;
  const bCustomer = bookingDetails?.customer_details;
  const bPayment = bookingDetails?.payment_summary;
  const bAdvance = bookingDetails?.advance_payment_summary;
  const bWarranty = bookingDetails?.warranty;
  const bTracking: any[] = (
    bookingDetails?.tracking_info?.tracking_steps &&
    bookingDetails.tracking_info.tracking_steps.length > 0
      ? bookingDetails.tracking_info.tracking_steps
      : trackingSteps.length > 0
      ? trackingSteps
      : [
          {
            id: 1,
            title: "Booked",
            status: "completed",
            time: bBooking?.enquiry_date_time
              ? new Date(bBooking.enquiry_date_time).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Today",
            desc: "Order confirmed",
          },
          {
            id: 2,
            title: "Provider Assigned",
            status: "pending",
            desc: "We will notify you once assigned",
          },
          {
            id: 3,
            title: "Service Visit",
            status: "pending",
            desc: "Technician will visit at scheduled time",
          },
          {
            id: 4,
            title: "Completed",
            status: "pending",
            desc: "Service completion & review",
          },
        ]
  ).filter((step: any) => !step.title?.toLowerCase().includes("follow"));

  const isVisitedOrCompleted = (() => {
    // 1. Direct flags from API if present
    if (bookingDetails?.booking?.is_visited_or_completed === true) {
      return true;
    }
    if (
      bookingDetails?.booking?.can_cancel === false ||
      bookingDetails?.booking?.can_reschedule === false
    ) {
      return true;
    }

    // 2. Status strings from details or selected item
    const mainStatus = String(
      bookingDetails?.delivery_status?.status ||
      selectedBooking?.status ||
      bookingDetails?.booking?.status ||
      ""
    ).toLowerCase().trim();

    const workStatus = String(
      selectedBooking?.work_status ||
      bookingDetails?.booking?.work_status ||
      ""
    ).toLowerCase().trim();

    const timelineText = String(
      selectedBooking?.timeline_status || ""
    ).toLowerCase().trim();

    if (
      mainStatus.includes("complete") ||
      mainStatus.includes("delivered") ||
      mainStatus.includes("cancel") ||
      mainStatus.includes("reject") ||
      workStatus.includes("complete") ||
      workStatus.includes("delivered") ||
      workStatus.includes("visit") ||
      workStatus.includes("visited") ||
      workStatus.includes("cancel") ||
      timelineText.includes("complete") ||
      timelineText.includes("visit") ||
      timelineText.includes("visited") ||
      timelineText.includes("delivered") ||
      timelineText.includes("cancel")
    ) {
      return true;
    }

    // 3. Tracking steps status (Service Visit or Delivered/Completed)
    const hasVisitedOrCompletedStep = bTracking.some((step: any) => {
      const title = String(step.title || step.raw_status || step.key || "").toLowerCase();
      const isDoneOrActive = step.status === "completed" || step.status === "in_progress";
      const isVisitOrCompleteStep =
        title.includes("visit") ||
        title.includes("complete") ||
        title.includes("deliver");

      return isVisitOrCompleteStep && isDoneOrActive;
    });

    return hasVisitedOrCompletedStep;
  })();

  const currentBookingId =
    bBooking?.booking_no ||
    bBooking?.booking_id ||
    selectedBooking?.booking_id ||
    (selectedBooking?.id ? `TAS-${selectedBooking.id}` : "TAS-33");

  const currentServiceTitle =
    bService?.title ||
    selectedBooking?.title ||
    selectedBooking?.service ||
    "AC Repair";

  const currentServiceSubtitle =
    bService?.items?.map((it: any) => it.subtitle).filter(Boolean).join(", ") ||
    selectedBooking?.subtitle ||
    selectedBooking?.category_name ||
    "Repair & Service";

  const currentRating =
    bService?.rating ||
    selectedBooking?.rating ||
    "5.0";

  const currentReviews =
    bService?.reviews ||
    selectedBooking?.reviews ||
    "1";

  const currentImage =
    bService?.image ||
    bService?.items?.[0]?.image ||
    selectedBooking?.image ||
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300&auto=format&fit=crop";

  const currentStatus =
    bookingDetails?.delivery_status?.status ||
    selectedBooking?.status ||
    "Pending";

  const currentScheduledAt =
    bBooking?.scheduled_at ||
    (selectedBooking?.date && selectedBooking?.time
      ? `${selectedBooking.date} (${selectedBooking.time})`
      : "Mon, 2nd Nov 2026 (09:00 AM)");

  const currentBookingDate =
    bBooking?.enquiry_date_time
      ? new Date(bBooking.enquiry_date_time).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : selectedBooking?.date || "02 Nov 2026";

  const serviceItems: any[] = bService?.items?.length
    ? bService.items
    : selectedBooking
    ? [
        {
          detail_id: selectedBooking.id || 1,
          subtitle: selectedBooking.subtitle || selectedBooking.title || "AC Repair",
          image: selectedBooking.image || "/ac.png",
          qty: 1,
          price: selectedBooking.total_amount ?? selectedBooking.price ?? 200,
          warranty_days: selectedBooking.warranty_days || 30,
        },
      ]
    : [];

  const spareItems: any[] = bookingDetails?.spare_details?.items || [];
  const totalServiceCount = serviceItems.length + spareItems.length;

  const totalAmount = Number(
    bPayment?.total ??
    bAdvance?.total_balance ??
    selectedBooking?.total_amount ??
    selectedBooking?.price ??
    0
  );

  const totalPaid = Number(
    bAdvance?.advance_payment ??
    0
  );

  const paymentStatusRaw = String(
    bookingDetails?.booking?.payment_status ||
    bookingDetails?.payment_status ||
    selectedBooking?.payment_status ||
    ""
  ).toLowerCase();

  const isPaidInFull =
    paymentStatusRaw === "paid" ||
    (totalAmount > 0 && totalPaid >= totalAmount);

  const balanceDue = isPaidInFull
    ? 0
    : Number(
        bAdvance?.balance_due ??
        (bAdvance?.total_balance !== undefined && bAdvance?.total_balance <= totalAmount - totalPaid
          ? bAdvance.total_balance
          : Math.max(0, totalAmount - totalPaid))
      );

  const numericBookingId =
    Number(bookingDetails?.booking?.booking_id) ||
    Number(selectedBooking?.id) ||
    Number(String(searchParams.get("bookingId") || "").replace(/\D/g, "")) ||
    Number(String(searchParams.get("id") || "").replace(/\D/g, "")) ||
    0;

  const handleMakePayment = async () => {
    if (isPaidInFull || balanceDue <= 0) {
      toast.success("Payment is already completed for this booking.");
      return;
    }

    if (!numericBookingId) {
      toast.error("Booking identifier not found.");
      return;
    }

    try {
      setIsPaying(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to proceed with payment.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("open-auth-modal"));
        }
        setIsPaying(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        Swal.fire({
          icon: "error",
          title: "Payment Gateway Error",
          text: "Razorpay SDK could not be loaded. Please check your internet connection.",
          confirmButtonColor: "#FF6A00",
        });
        setIsPaying(false);
        return;
      }

      // Step 1: Request Razorpay Order from backend
      // Helper to check if an order_id is an authentic Razorpay order ID (must start with order_ and contain letters, not PHP numeric fallback)
      const isRealRazorpayOrderId = (id?: string) =>
        Boolean(
          id &&
          typeof id === "string" &&
          /^order_[a-zA-Z0-9]{14,}$/.test(id) &&
          /[a-zA-Z]/.test(id.replace("order_", ""))
        );

      let razorpayOrderId = "";
      let razorKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_TvL5gF2aAKznOU";

      // 1. Create verified order via Next.js API
      try {
        const createRes = await axios.post("/api/razorpay/create-order", {
          amount: Math.round(balanceDue * 100),
          currency: "INR",
          receipt: `rcpt_bk_${numericBookingId}_${Date.now()}`,
          notes: {
            booking_id: String(numericBookingId),
            customer_name: bCustomer?.name || displayName || "Customer",
          },
        });

        if (createRes.data?.status && isRealRazorpayOrderId(createRes.data?.order_id)) {
          razorpayOrderId = createRes.data.order_id;
          if (createRes.data.key) {
            razorKey = createRes.data.key;
          }
        }
      } catch (e) {
        console.warn("Direct order creation notice:", e);
      }

      // 2. Only if direct verified order wasn't obtained, check backend order attempt
      if (!razorpayOrderId) {
        try {
          const orderRes = await axios.post(
            `${BASE_URL}/customers/booking-payment`,
            {
              booking_id: numericBookingId,
              amount: balanceDue,
              payment_type: "ONLINE",
            },
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const orderData = orderRes.data?.data;
          if (orderData?.razorpay_order_id && isRealRazorpayOrderId(orderData.razorpay_order_id)) {
            razorpayOrderId = orderData.razorpay_order_id;
          }
          if (orderData?.key) {
            razorKey = orderData.key;
          }
        } catch (e) {
          console.warn("Backend booking payment notice:", e);
        }
      }

      const cName = bCustomer?.name || customerAddress?.full_name || profile?.name || displayName || "Customer";
      const cMobile = bCustomer?.phone || customerAddress?.contact_number || profile?.mobile || "7812991993";
      const cEmail = profile?.email || "customer@tascompany.in";

      const options: any = {
        key: razorKey,
        amount: Math.round(balanceDue * 100),
        currency: "INR",
        name: "TASpro Company",
        description: `Payment for Booking #${selectedBooking?.booking_no || currentBookingId}`,
        prefill: {
          name: cName,
          contact: cMobile,
          email: cEmail,
        },
        theme: {
          color: "#ffffff",
          backdrop_color: "rgba(0, 0, 0, 0.65)",
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
        handler: async function (response: any) {
          if (!response?.razorpay_payment_id) {
            setIsPaying(false);
            Swal.fire({
              icon: "error",
              title: "Payment Unverified",
              text: "Payment could not be verified by Razorpay. Please try again.",
              confirmButtonColor: "#FF6A00",
            });
            return;
          }

          try {
            // Step 2: Confirm and store payment in Laravel backend
            const confirmRes = await axios.post(
              `${BASE_URL}/customers/booking-payment`,
              {
                booking_id: numericBookingId,
                amount: balanceDue,
                payment_type: "ONLINE",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || "",
                razorpay_signature: response.razorpay_signature || "",
              },
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (confirmRes.data?.status) {
              Swal.fire({
                icon: "success",
                title: "Payment Successful!",
                text: `Payment of ₹${balanceDue.toLocaleString("en-IN")} was received successfully.`,
                confirmButtonColor: "#FF6A00",
              });
              // Refresh details and bookings list
              await fetchBookingDetails(numericBookingId);
              await fetchBookings();
            } else {
              toast.error(confirmRes.data?.message || "Payment recording failed.");
            }
          } catch (confirmErr: any) {
            console.error("Error confirming payment:", confirmErr);
            toast.error(confirmErr?.response?.data?.message || "Error finalizing payment.");
          } finally {
            setIsPaying(false);
          }
        },
      };

      if (isRealRazorpayOrderId(razorpayOrderId)) {
        options.order_id = razorpayOrderId;
      }

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", function (failRes: any) {
        console.error("Razorpay Payment Failed:", failRes?.error);
        setIsPaying(false);
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: failRes?.error?.description || "Transaction failed. Please try again.",
          confirmButtonColor: "#FF6A00",
        });
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error("Make payment error:", err);
      setIsPaying(false);
      Swal.fire({
        icon: "error",
        title: "Payment Error",
        text: err?.response?.data?.message || err?.message || "Failed to initialize payment gateway.",
        confirmButtonColor: "#FF6A00",
      });
    }
  };

  const handleCashPayment = async () => {
    if (balanceDue <= 0 || isPaidInFull) {
      toast.error("No pending balance to pay.");
      return;
    }

    if (!numericBookingId) {
      toast.error("Booking identifier not found.");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Cash Payment",
      text: `Do you want to confirm paying ₹${balanceDue.toLocaleString("en-IN")} in cash directly to our service professional?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Yes, Confirm Cash",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setIsSubmittingCash(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to proceed.");
        setIsSubmittingCash(false);
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/customers/booking-payment`,
        {
          booking_id: numericBookingId,
          amount: balanceDue,
          payment_type: "CASH",
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.status) {
        Swal.fire({
          icon: "success",
          title: "Cash Payment Recorded!",
          text: `Payment of ₹${balanceDue.toLocaleString("en-IN")} in Cash has been recorded. Please hand over the amount to the technician after service completion.`,
          confirmButtonColor: "#10b981",
        });
        await fetchBookingDetails(numericBookingId);
        await fetchBookings();
      } else {
        toast.error(res.data?.message || "Failed to confirm cash payment.");
      }
    } catch (err: any) {
      console.error("Cash payment error:", err);
      toast.error(err?.response?.data?.message || "Error finalizing cash payment.");
    } finally {
      setIsSubmittingCash(false);
    }
  };

  const customerName =
    bCustomer?.name ||
    customerAddress?.full_name ||
    profile?.name ||
    displayName ||
    "Amit";

  const customerPhone =
    bCustomer?.phone ||
    customerAddress?.contact_number ||
    displayPhone ||
    "7812991993";

  const customerAddressText =
    bCustomer?.address ||
    (customerAddress
      ? `${customerAddress.house_number ? customerAddress.house_number + ", " : ""}${customerAddress.street || ""}, ${customerAddress.city?.name ? customerAddress.city.name.replace("Unknown Type: ", "") : ""}, ${customerAddress.state?.name || ""} - ${customerAddress.postal_code || ""}`
      : "Raipur, Chhattisgarh");

  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-24 w-full max-w-full overflow-x-hidden">
      <div className="w-full 2xl:w-[85%] mx-auto px-4 sm:px-5 py-5 sm:py-7 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Content Area */}
        {showChatBot ? (
          <div className="flex justify-center items-start w-full max-w-full">
            <ChatBotPanel
              booking={selectedChatBooking || selectedBooking || bookingDetails}
              onClose={() => {
                setShowChatBot(false);
                setSelectedChatBooking(null);
                if (selectedBooking || bookingDetails) {
                  setShowBookingDetailsPage(true);
                }
              }}
            />
          </div>
        ) : showBookingDetailsPage && (selectedBooking || bookingDetails) ? (
          <div className="space-y-6 w-full max-w-full">
            {/* 1. Breadcrumbs & Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
                <Link href="/" className="hover:text-[#FF6A00] transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingDetailsPage(false);
                    setSelectedBooking(null);
                    router.push("/my-booking");
                  }}
                  className="hover:text-[#FF6A00] transition-colors cursor-pointer"
                >
                  My Bookings
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[#FF6A00] font-bold">Booking Details</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Booking Details
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    View your booking information, service status and payment details.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  {/* Timeline Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Timeline:</span>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${getTimelineStatusBadge(currentStep?.title || currentStep?.raw_status || currentStatus).bg} font-bold text-xs shadow-2xs`}>
                      <div className={`w-2 h-2 rounded-full ${getTimelineStatusBadge(currentStep?.title || currentStep?.raw_status || currentStatus).dot}`} />
                      <span>{currentStep?.title || currentStep?.raw_status || (currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1))}</span>
                    </div>
                  </div>

                  {/* Payment Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Payment:</span>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                      isPaidInFull || (balanceDue === 0 && totalAmount > 0)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : totalPaid > 0
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-orange-50 text-[#FF6A00] border-orange-200"
                    } font-bold text-xs shadow-2xs`}>
                      {isPaidInFull || (balanceDue === 0 && totalAmount > 0) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
                      )}
                      <span>
                        {isPaidInFull || (balanceDue === 0 && totalAmount > 0)
                          ? "Paid"
                          : totalPaid > 0
                          ? "Partially Paid"
                          : "Payment Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: 7 cols */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Service Provider Header Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={currentImage}
                        alt={currentServiceTitle}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-2xs"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop";
                        }}
                      />
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate">
                          {currentServiceTitle}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                          {currentServiceSubtitle}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-xs">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-gray-800">{currentRating}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-500">{currentReviews} {Number(currentReviews) === 1 ? "review" : "reviews"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                      <a
                        href={bookingDetails?.service_provider?.mobile ? `tel:${bookingDetails.service_provider.mobile}` : "tel:+917447000045"}
                        className="px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#e55f00] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Feature pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-100 text-gray-700 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">Trusted & Verified Professionals</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-100 text-gray-700 text-xs font-semibold">
                      <Award className="w-4 h-4 text-[#FF6A00] shrink-0" />
                      <span className="truncate">{bWarranty?.warranty_days || 30} Days Service Warranty</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-100 text-gray-700 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{bBooking?.slot_time ? `Slot: ${bBooking.slot_time}` : "Approx. 1-2 Hours"}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Services in this Booking Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center border border-orange-100">
                        <ListOrdered className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                        Services in this Booking
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF6A00] text-xs font-bold">
                      Total Services: {totalServiceCount}
                    </span>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-2">#</th>
                          <th className="py-2.5 px-2">Service</th>
                          <th className="py-2.5 px-2 text-center">Quantity</th>
                          <th className="py-2.5 px-2">Unit Price</th>
                          <th className="py-2.5 px-2">Amount</th>
                          <th className="py-2.5 px-2">Warranty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {serviceItems.map((item: any, idx: number) => {
                          const itemImg = item.image || currentImage;
                          const itemPrice = Number(item.price || 0);
                          const itemQty = Number(item.qty || 1);
                          return (
                            <tr key={item.detail_id || idx}>
                              <td className="py-3 px-2 font-mono font-bold text-gray-400">{idx + 1}</td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={itemImg}
                                    alt={item.subtitle || currentServiceTitle}
                                    className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src =
                                        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=150&auto=format&fit=crop";
                                    }}
                                  />
                                  <div>
                                    <div className="font-bold text-gray-900 text-xs sm:text-sm">
                                      {item.subtitle || currentServiceTitle}
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-medium">
                                      {currentServiceTitle}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold text-xs">
                                  {itemQty}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-bold text-gray-700">₹{itemPrice.toLocaleString("en-IN")}</td>
                              <td className="py-3 px-2 font-extrabold text-gray-900">₹{(itemPrice * itemQty).toLocaleString("en-IN")}</td>
                              <td className="py-3 px-2 text-gray-500 font-medium">
                                {item.warranty_days ? `${item.warranty_days} Days` : `${bWarranty?.warranty_days || 30} Days`}
                              </td>
                            </tr>
                          );
                        })}

                        {spareItems.map((spare: any, idx: number) => {
                          const sparePrice = Number(spare.price || 0);
                          const spareQty = Number(spare.qty || 1);
                          return (
                            <tr key={spare.booking_spare_id || idx}>
                              <td className="py-3 px-2 font-mono font-bold text-gray-400">
                                {serviceItems.length + idx + 1}
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6A00] shrink-0 font-bold">
                                    <Wrench className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 text-xs sm:text-sm">
                                      {spare.subtitle || "Spare Part"}
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-medium">
                                      Replacement Part
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold text-xs">
                                  {spareQty}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-bold text-gray-700">₹{sparePrice.toLocaleString("en-IN")}</td>
                              <td className="py-3 px-2 font-extrabold text-gray-900">
                                ₹{Number(spare.total || sparePrice * spareQty).toLocaleString("en-IN")}
                              </td>
                              <td className="py-3 px-2 text-gray-500 font-medium">Standard</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Meta Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Booking ID</div>
                      <div className="font-mono font-extrabold text-gray-900 text-xs sm:text-sm mt-0.5">
                        {currentBookingId}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Booking Date</div>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm mt-0.5">
                        {currentBookingDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Service</div>
                      <div className="font-bold text-[#FF6A00] text-xs sm:text-sm mt-0.5">
                        {currentScheduledAt}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Booking Timeline Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center border border-orange-100">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Booking Timeline
                    </h3>
                  </div>

                  <div className="relative">
                    <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-gray-100 -z-0" />
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                      {bTracking.map((step: any, sIdx: number) => {
                        const isDone = step.status === "completed";
                        const isInProgress = step.status === "in_progress";
                        const t = (step.title || "").toLowerCase();

                        const renderIcon = () => {
                          if (isDone) {
                            return <Check className="w-4 h-4 stroke-[3]" />;
                          }
                          if (isInProgress) {
                            return <Clock className="w-4 h-4 text-[#FF6A00] animate-pulse" />;
                          }
                          if (t.includes("provider") || t.includes("vendor") || sIdx === 1) {
                            return <Lock className="w-3.5 h-3.5" />;
                          }
                          if (t.includes("visit") || sIdx === 2) {
                            return <MapPin className="w-3.5 h-3.5" />;
                          }
                          return <Check className="w-3.5 h-3.5" />;
                        };

                        return (
                          <div
                            key={step.id || sIdx}
                            className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ring-4 transition-all ${
                                isDone
                                  ? "bg-[#FF6A00] text-white ring-orange-100"
                                  : isInProgress
                                  ? "bg-orange-100 text-[#FF6A00] ring-orange-50 border border-orange-300"
                                  : "bg-slate-100 text-slate-400 ring-transparent border border-slate-200"
                              }`}
                            >
                              {renderIcon()}
                            </div>
                            <div>
                              <div
                                className={`font-extrabold text-xs ${
                                  isDone || isInProgress ? "text-gray-900" : "text-gray-700"
                                }`}
                              >
                                {step.title}
                              </div>

                              {sIdx === 0 ? (
                                <div className="mt-0.5">
                                  <div className="text-[11px] text-gray-500 font-medium">
                                    {step.time ? step.time.split(",")[0] : currentBookingDate}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    {step.time && step.time.includes(",")
                                      ? step.time.split(",")[1].trim()
                                      : (bBooking?.slot_time || "09:00 AM")}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[11px] text-gray-400 font-medium max-w-[140px] leading-tight mt-0.5">
                                  {step.desc ||
                                    (sIdx === 1
                                      ? "We will notify you once assigned"
                                      : sIdx === 2
                                      ? "Technician will visit at scheduled time"
                                      : "Service completion & review")}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Service Warranty & Rework Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center border border-orange-100">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Service Warranty & Rework
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Award className="w-4 h-4" />
                        <span className="text-[11px] font-bold text-gray-500">Service Warranty</span>
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-gray-900">
                        {bWarranty?.warranty_days || 30} Days
                      </div>
                      <p className="text-[11px] text-gray-500">Covers the same service issue</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[11px] font-bold text-gray-500">Warranty Valid Until</span>
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-gray-900">
                        {bWarranty?.expiry_date || "30 Days from visit"}
                      </div>
                      <p className="text-[11px] text-gray-500">
                        {bWarranty?.warranty_text || "Starts after service completion"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-500">
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-[11px] font-bold text-gray-500">Request Rework</span>
                      </div>
                      {currentStatus.toLowerCase() === "completed" ? (
                        <button
                          type="button"
                          onClick={() => toast.success("Rework request initiated. Support will contact you shortly.")}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[#FF6A00] text-xs font-bold hover:bg-orange-100 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Claim Warranty Rework</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                          <Info className="w-3 h-3 text-slate-400" />
                          <span>Available after completion</span>
                        </span>
                      )}
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Rework requests are subject to warranty terms and verification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Customer & Service Address Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center border border-orange-100">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                        Customer & Service Address
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSelectAddressModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-orange-300 text-[#FF6A00] hover:bg-orange-50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>Customer Name</span>
                        </div>
                        <div className="font-extrabold text-gray-900 text-sm mt-0.5">
                          {customerName}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>Phone Number</span>
                        </div>
                        <div className="font-extrabold text-gray-900 text-sm mt-0.5">
                          {customerPhone}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>Service Address</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        {customerAddressText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. Cancellation Policy & Visit Charge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Cancellation Policy</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                        You can cancel your booking before the service starts. No cancellation charges if cancelled early.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">₹150 Visit Charge</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                        If the service is not available at the time of visit, ₹150 visit charge will be applicable.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7. Customer Review Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-extrabold text-sm text-gray-900">Customer Review</div>
                        {bookingDetails?.review_details?.rating ? (
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold text-amber-700">
                            <span>{Number(bookingDetails.review_details.rating).toFixed(1)}</span>
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          </div>
                        ) : null}
                      </div>

                      {bookingDetails?.review_details?.review_text ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-gray-800 italic leading-relaxed">
                            "{bookingDetails.review_details.review_text}"
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium">
                            Reviewed on {bookingDetails.review_details.review_date || "recently"}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">
                            You have not reviewed this service yet.
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Share your experience to help us improve our service quality.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenReviewModal}
                    className="px-4 py-2 rounded-xl border border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs self-start sm:self-center active:scale-95"
                  >
                    {bookingDetails?.review_details?.review_text ? (
                      <>
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Review</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5" />
                        <span>Write a review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: 5 cols */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Price Details Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center border border-orange-100">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Price Details
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {serviceItems.map((item: any, idx: number) => (
                      <div key={item.detail_id || idx} className="flex items-center justify-between text-gray-600">
                        <span className="truncate pr-2">
                          {item.subtitle || currentServiceTitle} ({item.qty || 1} × ₹{Number(item.price || 0).toLocaleString("en-IN")})
                        </span>
                        <span className="font-bold text-gray-900 shrink-0">
                          ₹{(Number(item.price || 0) * Number(item.qty || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}

                    {spareItems.map((spare: any, idx: number) => (
                      <div key={spare.booking_spare_id || idx} className="flex items-center justify-between text-gray-600">
                        <span className="truncate pr-2">
                          {spare.subtitle || "Spare Part"} ({spare.qty || 1} × ₹{Number(spare.price || 0).toLocaleString("en-IN")})
                        </span>
                        <span className="font-bold text-gray-900 shrink-0">
                          ₹{Number(spare.total || spare.price * spare.qty || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}

                    {Number(bPayment?.visit_charge || 0) > 0 && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Visit & Inspection Charge</span>
                        <span className="font-bold text-gray-900">₹{Number(bPayment.visit_charge).toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    {Number(bPayment?.taxes_and_fees || 0) > 0 && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Taxes & Service Fees (GST)</span>
                        <span className="font-bold text-gray-900">₹{Number(bPayment.taxes_and_fees).toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    {Number((bPayment?.item_discount || 0) + (Number(bPayment?.special_discount) || 0)) > 0 && (
                      <div className="flex items-center justify-between text-emerald-600 font-semibold">
                        <span>Discount</span>
                        <span>-₹{Number((bPayment?.item_discount || 0) + (Number(bPayment?.special_discount) || 0)).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-900">Total Amount</div>
                      <div className="text-[10px] text-gray-400 font-medium">(Inclusive of all taxes)</div>
                    </div>
                    <div className="text-xl font-black text-gray-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Paid & Balance due pills */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] font-bold text-emerald-800">Total Paid</span>
                      </div>
                      <span className="text-xs font-black text-emerald-700">₹{totalPaid.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-[11px] font-bold text-rose-800">Balance Due</span>
                      </div>
                      <span className="text-xs font-black text-rose-700">₹{balanceDue.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Payment Information Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center border border-orange-100">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Payment Information
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Payment Status</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          isPaidInFull || (balanceDue === 0 && totalAmount > 0)
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : totalPaid > 0
                            ? "bg-blue-50 border border-blue-200 text-blue-700"
                            : "bg-orange-50 border border-orange-200 text-[#FF6A00]"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {isPaidInFull || (balanceDue === 0 && totalAmount > 0)
                            ? "Payment Completed"
                            : totalPaid > 0
                            ? "Partially Paid"
                            : "Payment Pending"}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Payment Method</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-800 font-bold text-xs border border-gray-200/80">
                        <CreditCard className="w-3.5 h-3.5 text-gray-600" />
                        <span>{bookingDetails?.payment_method || "Pay after service / COD"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Payment Mode Selector: Cash or Online */}
                  {!isPaidInFull && balanceDue > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-700">
                          Select Payment Option
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {selectedPaymentMode === "online" ? "Gateway Popup" : "Pay to Technician"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Option 1: Cash / COD */}
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMode("cash")}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                            selectedPaymentMode === "cash"
                              ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                selectedPaymentMode === "cash"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Banknote className="w-4 h-4" />
                            </div>
                            {selectedPaymentMode === "cash" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">
                              Cash / COD
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                              Pay cash after service
                            </div>
                          </div>
                        </button>

                        {/* Option 2: Online Payment */}
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMode("online")}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                            selectedPaymentMode === "online"
                              ? "border-[#FF6A00] bg-orange-50/70 ring-2 ring-[#FF6A00]/20 shadow-xs"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                selectedPaymentMode === "online"
                                  ? "bg-[#FF6A00] text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <CreditCard className="w-4 h-4" />
                            </div>
                            {selectedPaymentMode === "online" ? (
                              <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">
                              Online Payment
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                              UPI, Cards, Netbanking
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                    <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span>
                      {selectedPaymentMode === "cash"
                        ? "You can pay in cash directly to our service technician once the job is completed."
                        : "Online payment opens the secure Razorpay payment gateway to pay via UPI, Cards, or Netbanking."}
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {selectedPaymentMode === "online" ? (
                      <button
                        type="button"
                        disabled={isPaidInFull || balanceDue <= 0 || isPaying}
                        onClick={handleMakePayment}
                        className={`w-full py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                          isPaidInFull || balanceDue <= 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                            : isPaying
                            ? "bg-[#FF6A00]/80 text-white cursor-wait"
                            : "bg-[#FF6A00] hover:bg-[#e55f00] text-white cursor-pointer active:scale-[0.99]"
                        }`}
                      >
                        {isPaying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Opening Payment Gateway...</span>
                          </>
                        ) : isPaidInFull || balanceDue <= 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Payment Complete</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Pay Online (₹{balanceDue.toLocaleString("en-IN")})</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPaidInFull || balanceDue <= 0 || isSubmittingCash}
                        onClick={handleCashPayment}
                        className={`w-full py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                          isPaidInFull || balanceDue <= 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                            : isSubmittingCash
                            ? "bg-emerald-600/80 text-white cursor-wait"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]"
                        }`}
                      >
                        {isSubmittingCash ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Recording Cash Payment...</span>
                          </>
                        ) : isPaidInFull || balanceDue <= 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Payment Complete</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="w-4 h-4" />
                            <span>Confirm Cash Payment (₹{balanceDue.toLocaleString("en-IN")})</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                      className="w-full py-2.5 rounded-xl border border-blue-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50/50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{showPaymentHistory ? "Hide Payment History" : "View Payment History"}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Payment History Card (Collapsible) */}
                {showPaymentHistory && (
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                        Payment History
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowPaymentHistory(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {bookingDetails?.payments && bookingDetails.payments.length > 0 ? (
                      <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                              <th className="py-2 px-1.5">#</th>
                              <th className="py-2 px-1.5">Amount</th>
                              <th className="py-2 px-1.5">Date & Time</th>
                              <th className="py-2 px-1.5">Status</th>
                              <th className="py-2 px-1.5">Payment Mode</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-[11px]">
                            {bookingDetails.payments.map((p: any, pIdx: number) => (
                              <tr key={p.id || pIdx}>
                                <td className="py-2.5 px-1.5 font-bold text-gray-400">{pIdx + 1}</td>
                                <td className="py-2.5 px-1.5 font-extrabold text-gray-900">₹{Number(p.amount || 0).toLocaleString("en-IN")}</td>
                                <td className="py-2.5 px-1.5 text-gray-500 whitespace-nowrap">{p.date_time || "-"}</td>
                                <td className="py-2.5 px-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                                      p.status?.toLowerCase() === "success"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}
                                  >
                                    {p.status || "Completed"}
                                  </span>
                                </td>
                                <td className="py-2.5 px-1.5 text-gray-600 whitespace-nowrap">{p.payment_mode || "Online"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-1">
                        <Receipt className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                        <div className="font-bold text-xs text-gray-700">No Payments Recorded Yet</div>
                        <p className="text-[11px] text-gray-400 leading-tight">
                          Payment will be recorded upon service completion or advance payment.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Documents Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center border border-orange-100">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Documents
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {/* Estimate is always available */}
                    <button
                      type="button"
                      onClick={() => handleOpenDocument("estimate")}
                      className="w-full py-2.5 rounded-xl border border-orange-300 text-[#FF6A00] hover:bg-orange-50/50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Estimate (PDF)</span>
                    </button>

                    {/* Tax Invoice ONLY shows after payment is completed */}
                    {isPaidInFull || (balanceDue === 0 && totalAmount > 0) || paymentStatusRaw === "paid" ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDocument("invoice")}
                        className="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Download Tax Invoice (PDF)</span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[11px] text-slate-500 font-medium">
                          Tax Invoice will be available once payment is completed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Need help? Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0 border border-orange-100">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-gray-900">Need help?</div>
                        <p className="text-[11px] text-gray-500 leading-tight">
                          Our support team is here to help you with your booking.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/contact-us")}
                      className="px-3 py-1.5 rounded-xl border border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 font-bold text-xs whitespace-nowrap transition-all cursor-pointer shadow-2xs shrink-0"
                    >
                      Contact Support
                    </button>
                  </div>

                  {!isVisitedOrCompleted && (
                    <div className="space-y-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="w-full py-3 rounded-xl bg-[#FF3B30] hover:bg-[#e0342a] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel Booking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRescheduleModal(true)}
                        className="w-full py-3 rounded-xl border border-[#FF3B30] text-[#FF3B30] hover:bg-red-50/50 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                      >
                        <CalendarClock className="w-4 h-4" />
                        <span>Reschedule Booking</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6 w-full max-w-full">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                My Bookings
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                View and manage all your service bookings
              </p>
            </div>

            {/* Filter Tabs Bar (Left) and Sort Dropdown (Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-gray-200/60 pb-3">
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    activeTab === "all"
                      ? "bg-orange-50 text-[#FF6A00] border-[#FF6A00]"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  All Bookings ({allCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("pending")}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    activeTab === "pending"
                      ? "bg-orange-50 text-[#FF6A00] border-[#FF6A00]"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Upcoming ({pendingCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("completed")}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    activeTab === "completed"
                      ? "bg-orange-50 text-[#FF6A00] border-[#FF6A00]"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Completed ({completedCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("rejected")}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    activeTab === "rejected"
                      ? "bg-orange-50 text-[#FF6A00] border-[#FF6A00]"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Cancelled ({cancelledCount})
                </button>
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-white border border-gray-200 text-gray-800 text-xs sm:text-sm font-semibold rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FF6A00] cursor-pointer shadow-2xs"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="price_low">Price: Low to High</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bookings Stacked List */}
            <div className="space-y-3.5 sm:space-y-4">
              {loading ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
                  <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Loading your bookings...</p>
                </div>
              ) : sortedBookings.length > 0 ? (
                sortedBookings.map((booking: any, index: number) => {
                  const isFirstHighlighted = booking.is_highlighted || (index === 0 && activeTab === "all");
                  const timelineText = booking.timeline_status || (
                    booking.status === "Completed" ? "Completed" :
                    booking.status === "Cancelled" || booking.status === "Rejected" ? "Cancelled" :
                    booking.status === "Rescheduled" ? "Rescheduled" :
                    booking.status === "Assigned" ? "Provider Assigned" :
                    "Order Confirmed"
                  );
                  const timelineBadge = getTimelineStatusBadge(timelineText);
                  const paymentBadge = getPaymentStatusBadge(booking.payment_status, booking.payment_method);

                  return (
                    <div
                      key={booking.booking_id || booking.id || index}
                      className={`bg-white rounded-2xl p-4 sm:p-5 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isFirstHighlighted
                          ? "border border-orange-300 ring-1 ring-orange-200/50"
                          : "border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                      }`}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 flex items-center justify-center p-2 shrink-0 border border-gray-100 overflow-hidden">
                          <img
                            src={booking.image || "/ac.png"}
                            alt={booking.title || "Service"}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/ac.png";
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight truncate">
                            {booking.title || booking.service || "Home Service"}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                            {booking.subtitle ? `${booking.subtitle} • ` : ""}{booking.date || ""} | {booking.time || ""}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5 font-mono">
                            Booking ID: {booking.booking_id || `TAS-${booking.id}`}
                          </p>
                        </div>
                      </div>

                      {/* Right: Timeline & Payment Status badges, Price, Action button */}
                      <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-3 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                        {/* Dual Status: Current Timeline & Payment */}
                        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                          {/* 1. Timeline Status Badge */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Timeline</span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold border ${timelineBadge.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${timelineBadge.dot}`} />
                              <span>{timelineBadge.label}</span>
                            </span>
                          </div>

                          {/* 2. Payment Status Badge */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Payment</span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${paymentBadge.bg}`}
                            >
                              {paymentBadge.icon === "paid" ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Clock className="w-3 h-3 text-[#FF6A00]" />
                              )}
                              <span>{paymentBadge.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-base sm:text-lg font-extrabold text-gray-900 min-w-[75px] text-right">
                          ₹{Number(booking.total_amount ?? booking.price ?? 0).toLocaleString("en-IN")}
                        </div>

                        {/* View Details Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowBookingDetailsPage(true);
                            router.push(`/my-booking?bookingId=${booking.id || booking.booking_id}`);
                          }}
                          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6A00] flex items-center justify-center mx-auto">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    {!user ? "Please Login to View Bookings" : "No Bookings Found"}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {!user
                      ? "Log in with your registered phone number to view all your upcoming and past bookings."
                      : activeTab === "pending"
                      ? "You don't have any upcoming or pending bookings right now."
                      : activeTab === "completed"
                      ? "You haven't completed any service bookings yet."
                      : activeTab === "rejected"
                      ? "No cancelled service bookings found."
                      : "You don't have any bookings yet. Book a service to get started!"}
                  </p>
                  {!user ? (
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.setItem("redirectAfterLogin", "/my-booking");
                        }
                        window.dispatchEvent(new Event("open-auth-modal"));
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      <span>Login / Sign In</span>
                    </button>
                  ) : (
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6A00] text-white font-bold text-xs hover:bg-[#e55f00] transition-all shadow-xs"
                    >
                      <span>Browse Services</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

            <SelectDateTimeModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        showLocation={true}
        location={
          selectedBooking?.address ||
          bookingDetails?.customer_details?.address ||
          ""
        }
        serviceId={
          selectedBooking?.service_id ||
          selectedBooking?.booking_detail?.service_id ||
          bookingDetails?.service_details?.service_id ||
          1
        }
        onContinue={(date, time, customer_notes, slot_id) =>
          handleReschedule({
            slot_id: slot_id || 0,
            date,
            customer_notes,
          })
        }
      />
      {showSelectAddressModal && (
        <SelectAddressModal
          isOpen={showSelectAddressModal}
          onClose={() => setShowSelectAddressModal(false)}
          onContinue={(address) => {
            // setSelectedAddress(address);
            setShowSelectAddressModal(false);
            // setShowTCModal(true);
          }}
          onAddNew={() => {
            setShowSelectAddressModal(false); // close current
            setShowAddNewAddressModal(true); // open new one
          }}
          addresses={[]}
        />
      )}
      <AddNewAddressModal
        isOpen={showAddNewAddressModal}
        onClose={() => setShowAddNewAddressModal(false)}
        onSave={(newAddress) => {
          console.log(newAddress);

          // optional: save selected address
          // setShoSelectedAddress(newAddress);

          // close add address modal
          setShowAddNewAddressModal(false);

          // ✅ directly open Terms & Conditions
          // setShowTCModal(true);
        }}
      />
      {showCancelModal && selectedBooking && (
        <CancelBookingModal
          booking={selectedBooking}
          onClose={() => setShowCancelModal(false)}
          onConfirm={async (data) => {
            try {
              if (!data) return;

              const payload = {
                cancel_reason_id: data.cancel_reason_id,
                cancel_reason: data.cancel_reason,
              };

              const result = await cancelBooking(selectedBooking.id, payload);

              setBookings((prev) =>
                prev.map((item) =>
                  item.id === selectedBooking.id
                    ? { ...item, status: "Cancelled" }
                    : item,
                ),
              );

              setShowCancelModal(false);
              setShowCancelledSuccess(true);
            } catch (error: any) {
              console.error(
                "Cancel booking failed:",
                error.response?.data || error.message,
              );
            }
          }}
        />
      )}
      {showCancelledSuccess && (
        <BookingCancelledModal
          onClose={() => {
            setShowCancelledSuccess(false);
            setShowBookingDetailsPage(false);
          }}
        />
      )}
      <SplitACModal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
      />
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        documentType={documentType}
        booking={selectedBooking}
        bookingDetails={bookingDetails}
        customerAddress={customerAddress}
        profile={profile}
      />

      {/* Interactive Write / Edit Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                {bookingDetails?.review_details?.review_text ? "Edit Your Review" : "Write a Customer Review"}
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Share your experience with our certified service partner.
            </p>

            {/* 5 Interactive Stars */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (reviewHover || reviewRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    className="p-1 focus:outline-hidden transition-transform active:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700 block">
                Your Comments &amp; Feedback
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                placeholder="How was the service technician and work quality?..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] text-xs outline-hidden resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmittingReview}
                onClick={handleSubmitReview}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#e55f00] text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingReview ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingContent;
