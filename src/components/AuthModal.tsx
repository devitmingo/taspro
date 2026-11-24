"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  ArrowRight,
  X,
  ShieldCheck,
  ArrowLeft,
  RotateCw,
  ChevronDown,
  User,
  Mail,
  MapPin,
  Compass,
  Pencil,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL, GOOGLE_MAPS_API_KEY } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import AuthSideBanner from "./auth/AuthSideBanner";
import MapPickerModal from "./MapPickerModal";

// Google & Apple SVG Icons
const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.07 1.72-.94 2.74 1 .08 2.03-.5 2.65-1.25z" />
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const router = useRouter();
  const { login } = useAuth();

  // Mode: "login" or "signup"
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // Login View States
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Signup / Create Account States
  const [fullName, setFullName] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [serviceAddress, setServiceAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Raipur, Chhattisgarh, India");
  const [latitude, setLatitude] = useState<number>(21.2514);
  const [longitude, setLongitude] = useState<number>(81.6296);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupLoading, setSignupLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Map Picker Modal for Full Screen Location Pinning
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Refs
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<any>(null);
  const miniMapMarkerRef = useRef<any>(null);

  // Sync mode with initialMode
  useEffect(() => {
    setMode(initialMode);
    setStep("phone");
    setOtpDigits(["", "", "", ""]);
    setPhoneError(null);
    setOtpError(null);
  }, [initialMode, isOpen]);

  // Load Google Maps dynamically
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== "undefined" && (window as any).google?.maps) {
      setLeafletLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-maps-script") as HTMLScriptElement;
    if (existingScript) {
      if ((window as any).google?.maps) {
        setLeafletLoaded(true);
        return;
      }
      existingScript.addEventListener("load", () => setLeafletLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, [isOpen]);

  // Initialize or update Mini Live Google Map inside Create Account Form
  useEffect(() => {
    if (mode !== "signup" || !leafletLoaded || !miniMapContainerRef.current) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    const currentLat = latitude || 21.2514;
    const currentLng = longitude || 81.6296;

    const customPinIcon = {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 2C9.2 2 2 9.2 2 18C2 29 16.5 40.5 17.2 41.1C17.7 41.5 18.3 41.5 18.8 41.1C19.5 40.5 34 29 34 18C34 9.2 26.8 2 18 2Z" fill="#E11D48" stroke="#FFFFFF" stroke-width="2.5"/>
          <circle cx="18" cy="18" r="6" fill="#FFFFFF"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(32, 40),
      anchor: new google.maps.Point(16, 40),
    };

    if (!miniMapInstanceRef.current) {
      try {
        const map = new google.maps.Map(miniMapContainerRef.current, {
          center: { lat: currentLat, lng: currentLng },
          zoom: 15,
          disableDefaultUI: true,
          gestureHandling: "none",
          keyboardShortcuts: false,
          clickableIcons: false,
        });

        const marker = new google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map: map,
          icon: customPinIcon,
        });

        miniMapInstanceRef.current = map;
        miniMapMarkerRef.current = marker;
      } catch (err) {
        console.log("Mini map init error:", err);
      }
    } else {
      try {
        miniMapInstanceRef.current.setCenter({ lat: currentLat, lng: currentLng });
        if (miniMapMarkerRef.current) {
          miniMapMarkerRef.current.setPosition({ lat: currentLat, lng: currentLng });
        }
      } catch (e) {}
    }
  }, [mode, leafletLoaded, latitude, longitude]);

  // Timer for OTP
  useEffect(() => {
    let interval: any;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Countries fetch
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/countries`);
        if (res.data.status) {
          setCountries(res.data.data);
          const india = res.data.data.find((c: any) => c.code === "91");
          setSelectedCountry(india || res.data.data[0]);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (isOpen) {
      fetchCountries();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Send OTP (Login)
  const handleSendOTP = async (isResend = false) => {
    if (isResend) {
      setOtpError(null);
    } else {
      setPhoneError(null);
    }

    if (phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/customers/send-otp`, {
        country_id: selectedCountry?.id || 1,
        mobile: phone,
      });

      if (res.data.status) {
        setStep("otp");
        setTimer(30);
        setCanResend(false);
        setOtpDigits(["", "", "", ""]);
        setOtpError(null);

        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      } else {
        const msg = res.data.message || "Unable to send OTP. Please try again.";
        if (isResend || step === "otp") {
          setOtpError(msg);
        } else {
          setPhoneError(msg);
        }
      }
    } catch (error: any) {
      console.error(error?.response?.data || error);
      const msg =
        error?.response?.data?.message ||
        "Something went wrong. Please check your number and try again.";
      if (isResend || step === "otp") {
        setOtpError(msg);
      } else {
        setPhoneError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP (Login)
  const handleVerifyOTP = async (otpValue?: string) => {
    const finalOtp = otpValue || otpDigits.join("");
    setOtpError(null);

    if (finalOtp.length !== 4) {
      setOtpError("Please enter a complete 4-digit code.");
      return;
    }

    try {
      setVerifyLoading(true);
      const res = await axios.post(`${API_BASE_URL}/customers/verify-otp`, {
        country_id: selectedCountry?.id || 1,
        mobile: phone,
        otp: Number(finalOtp),
      });

      if (res.data.status) {
        const token = res.data.token;
        const u = res.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("customer_id", String(u.id));

        login({
          id: u.id,
          phone: u.mobile,
          firstName: u.first_name || "",
          lastName: u.last_name || "",
          name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || "",
          email: u.email || "",
          mobile: u.mobile,
          alt_mobile: u.alt_mobile || "",
          alternateNumber: u.alt_mobile || "",
          gender: u.gender || "Male",
          profileImage: u.profile_url || u.profile || null,
          profileCompleted: Boolean(u.first_name && u.first_name.trim() !== ""),
          contactVerified: true,
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("user-logged-in", { detail: u }));
          window.dispatchEvent(new Event("wishlistUpdated"));
        }

        // If new user without first name, switch seamlessly to Create Account modal view!
        if (!u.first_name || u.first_name.trim() === "") {
          setSignupMobile(u.mobile);
          setMode("signup");
        } else {
          onClose();
        }
      } else {
        setOtpError(res.data.message || "Invalid OTP code. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      setOtpError(
        error?.response?.data?.message || "Invalid OTP code. Please try again."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (otpError) setOtpError(null);

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    const fullOtp = newDigits.join("");
    if (fullOtp.length === 4) {
      handleVerifyOTP(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (otpError) setOtpError(null);
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData) {
      const digits = pastedData.split("");
      const newOtp = ["", "", "", ""];
      digits.forEach((d, idx) => {
        if (idx < 4) newOtp[idx] = d;
      });
      setOtpDigits(newOtp);
      if (newOtp.join("").length === 4) {
        handleVerifyOTP(newOtp.join(""));
      }
    }
  };

  // 3. Geolocation: Use My Location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "warning",
        title: "Geolocation Not Supported",
        text: "Your browser does not support GPS location.",
      });
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          if (data && data.results && data.results[0]) {
            const result = data.results[0];
            const fullAddr = result.formatted_address;
            let city = "";
            let state = "";
            let country = "";

            if (result.address_components) {
              for (const comp of result.address_components) {
                if (comp.types.includes("locality")) city = comp.long_name;
                else if (!city && comp.types.includes("administrative_area_level_2")) city = comp.long_name.replace(/\s+District$/i, "");
                if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
                if (comp.types.includes("country")) country = comp.long_name;
              }
            }

            const finalCity = city || "Raipur";
            const finalState = state || "Chhattisgarh";
            const finalCountry = country || "India";
            setSelectedLocation(`${finalCity}, ${finalState}, ${finalCountry}`);
            setServiceAddress(fullAddr);
            if (signupErrors.serviceAddress) {
              setSignupErrors((prev) => ({ ...prev, serviceAddress: "" }));
            }
          } else {
            setSelectedLocation("Raipur, Chhattisgarh, India");
          }
        } catch (e) {
          setSelectedLocation("Raipur, Chhattisgarh, India");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        console.log("GPS Location error:", err);
        setGeoLoading(false);
        // Fallback default
        setSelectedLocation("Raipur, Chhattisgarh, India");
        if (!serviceAddress.trim()) {
          setServiceAddress("Office No. 201, Atlantis Corporate Park, Ring Road No.1, Raipur");
        }
        Swal.fire({
          icon: "info",
          title: "Location Access",
          text: "Location permission was denied or timed out. Defaulted to Raipur, Chhattisgarh. You can also tap 'Edit on Map' to choose your exact spot.",
          timer: 3000,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 4. Create Account Form Validation & Submit
  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = "Please enter your full name.";
    }

    const cleanMobile = (signupMobile || phone).replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      errs.mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!serviceAddress.trim()) {
      errs.serviceAddress = "Please enter your service address.";
    }

    setSignupErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSignupLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const parts = fullName.trim().split(" ");
      const firstName = parts[0] || fullName.trim();
      const lastName = parts.slice(1).join(" ") || "";

      // If user already authenticated
      if (token && token !== "null" && token !== "undefined") {
        await axios.post(
          `${API_BASE_URL}/customers/update-profile`,
          {
            first_name: firstName,
            last_name: lastName,
            email: email.trim(),
            gender: gender,
            mobile: cleanMobile,
            address: serviceAddress.trim(),
            latitude: latitude,
            longitude: longitude,
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        try {
          await axios.post(
            `${API_BASE_URL}/customers/customer-addresses`,
            {
              full_name: fullName.trim(),
              contact_number: `+91 ${cleanMobile}`,
              house_number: serviceAddress.trim().split(",")[0] || "Home",
              street: serviceAddress.trim(),
              postal_code: "492001",
              type: "Home",
              latitude: latitude,
              longitude: longitude,
              is_default: 1,
            },
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (e) {}

        login({
          id: 1,
          phone: cleanMobile,
          firstName: firstName,
          lastName: lastName,
          name: fullName.trim(),
          email: email.trim(),
          gender: gender,
          profileCompleted: true,
          contactVerified: true,
        });

        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: `Welcome to TASPro, ${fullName.trim()}!`,
          timer: 1800,
          showConfirmButton: false,
        });

        onClose();
      } else {
        // Send OTP first to authenticate
        await axios.post(`${API_BASE_URL}/customers/send-otp`, {
          country_id: 1,
          mobile: cleanMobile,
        });

        // Prompt for OTP
        const { value: enteredOtp } = await Swal.fire({
          title: "Verify Mobile Number",
          html: `<p class="text-sm text-gray-500 mb-2">We sent a 4-digit code to <strong>+91 ${cleanMobile}</strong></p>`,
          input: "text",
          inputAttributes: {
            maxlength: "4",
            style: "text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 8px;",
          },
          inputPlaceholder: "••••",
          showCancelButton: true,
          confirmButtonText: "Verify & Complete Account",
          confirmButtonColor: "#FF6A00",
          cancelButtonColor: "#6B7280",
          inputValidator: (val) => {
            if (!val || val.length !== 4) return "Please enter 4-digit OTP.";
          },
        });

        if (enteredOtp) {
          const verifyRes = await axios.post(`${API_BASE_URL}/customers/verify-otp`, {
            country_id: 1,
            mobile: cleanMobile,
            otp: Number(enteredOtp),
          });

          if (verifyRes.data.status) {
            const newToken = verifyRes.data.token;
            localStorage.setItem("token", newToken);
            localStorage.setItem("customer_id", String(verifyRes.data.data.id));

            await axios.post(
              `${API_BASE_URL}/customers/update-profile`,
              {
                first_name: firstName,
                last_name: lastName,
                email: email.trim(),
                gender: gender,
                mobile: cleanMobile,
                address: serviceAddress.trim(),
                latitude: latitude,
                longitude: longitude,
              },
              {
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );

            login({
              id: verifyRes.data.data.id,
              phone: cleanMobile,
              firstName: firstName,
              lastName: lastName,
              name: fullName.trim(),
              email: email.trim(),
              gender: gender,
              profileCompleted: true,
              contactVerified: true,
            });

            Swal.fire({
              icon: "success",
              title: "Account Created!",
              text: `Welcome to TASPro, ${fullName.trim()}!`,
              timer: 1800,
              showConfirmButton: false,
            });

            onClose();
          } else {
            Swal.fire({
              icon: "error",
              title: "Verification Failed",
              text: verifyRes.data.message || "Invalid OTP code.",
            });
          }
        }
      }
    } catch (err: any) {
      console.error("Create account error:", err);
      Swal.fire({
        icon: "error",
        title: "Registration Error",
        text: err?.response?.data?.message || "Failed to create account. Please try again.",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      
      {/* Main Modal Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[880px] max-h-[92vh] overflow-y-auto md:overflow-hidden relative flex flex-col md:flex-row border border-gray-100 animate-scaleUp">
        
        {/* Circular Close Button on Top Right matching mockups */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center transition shadow-md border border-gray-100 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* ================= LEFT SIDE: FORMS ================= */}
        <div className="w-full md:w-[52%] lg:w-[51%] p-5 sm:p-7 flex flex-col justify-between bg-white md:overflow-y-auto md:max-h-[640px]">
          
          {mode === "login" ? (
            /* ================= VIEW 1: LOGIN MODAL (IMAGE 2) ================= */
            <div>
              {step === "phone" ? (
                <>
                  {/* Orange decorative accent bar on top */}
                  <div className="w-10 h-1 bg-[#FF6A00] rounded-full mb-3.5"></div>

                  {/* Title & Subtitle */}
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    Welcome Back!
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 mb-5">
                    Login to book, track and manage your services.
                  </p>

                  {/* Mobile Number Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">
                        Mobile Number
                      </label>
                      <div
                        className={`flex rounded-xl border overflow-hidden transition-all bg-white ${
                          phoneError
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-gray-200 focus-within:border-[#FF6A00] focus-within:ring-2 focus-within:ring-orange-100"
                        }`}
                      >
                        {/* Country code prefix */}
                        <div className="relative bg-gray-50/70 border-r border-gray-200 flex items-center px-3 shrink-0 cursor-pointer">
                          <select
                            value={selectedCountry?.id || ""}
                            onChange={(e) => {
                              const c = countries.find((item) => item.id === Number(e.target.value));
                              if (c) setSelectedCountry(c);
                            }}
                            className="appearance-none bg-transparent pr-4 text-xs font-bold text-gray-800 outline-none cursor-pointer"
                          >
                            {countries.length > 0 ? (
                              countries.map((c) => (
                                <option key={c.id} value={c.id}>
                                  +{c.code}
                                </option>
                              ))
                            ) : (
                              <option value="">+91</option>
                            )}
                          </select>
                          <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 pointer-events-none" />
                        </div>

                        {/* Input */}
                        <div className="relative flex-1 flex items-center px-3">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                              if (phoneError) setPhoneError(null);
                            }}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full py-3 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none font-sans bg-transparent"
                          />
                        </div>
                      </div>

                      {phoneError && (
                        <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                          <span>•</span> {phoneError}
                        </p>
                      )}
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="button"
                      onClick={() => handleSendOTP(false)}
                      disabled={loading || phone.length !== 10}
                      className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#F05A00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      {loading ? (
                        <span>Sending OTP...</span>
                      ) : (
                        <>
                          <span>Send OTP</span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-5 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative bg-white px-3 text-[11px] font-medium text-gray-400">
                      or continue with
                    </span>
                  </div>

                  {/* Social Logins */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition cursor-pointer shadow-2xs"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition cursor-pointer shadow-2xs"
                    >
                      <AppleIcon className="w-4 h-4" />
                      <span>Apple</span>
                    </button>
                  </div>

                  {/* Footer Link: Switch to Create an Account in Modal */}
                  <div className="mt-6 text-center text-xs text-gray-500 font-medium">
                    New to TASPro Company?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setSignupMobile(phone);
                        setMode("signup");
                      }}
                      className="font-bold text-[#FF6A00] hover:underline cursor-pointer ml-1"
                    >
                      Create an Account
                    </button>
                  </div>
                </>
              ) : (
                /* OTP Step */
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtpError(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#FF6A00] mb-4 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Number</span>
                  </button>

                  <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center mb-3 border border-orange-100 text-[#FF6A00] shadow-2xs">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    OTP Verification
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 mb-5">
                    Enter 4-digit code sent to{" "}
                    <strong className="text-gray-900 font-bold">
                      +{selectedCountry?.code || "91"} {phone}
                    </strong>
                  </p>

                  {/* 4 Digit OTP Inputs */}
                  <div className="grid grid-cols-4 gap-3 mb-3" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-full h-13 text-center text-xl font-black rounded-xl border outline-none transition-all bg-gray-50/50 text-gray-900 font-mono ${
                          otpError
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-gray-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 focus:bg-white"
                        }`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-red-500 text-xs font-medium mb-3 text-center flex items-center justify-center gap-1">
                      <span>•</span> {otpError}
                    </p>
                  )}

                  {/* Resend OTP */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-5">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={() => handleSendOTP(true)}
                        className="text-[#FF6A00] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" /> Resend OTP
                      </button>
                    ) : (
                      <span>
                        Resend code in <strong className="text-gray-900 font-bold">{timer}s</strong>
                      </span>
                    )}
                  </div>

                  {/* Verify Button */}
                  <button
                    type="button"
                    onClick={() => handleVerifyOTP()}
                    disabled={verifyLoading || otpDigits.join("").length !== 4}
                    className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#F05A00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {verifyLoading ? "Verifying..." : "Verify & Proceed"}
                  </button>
                </>
              )}
            </div>
          ) : (
            /* ================= VIEW 2: CREATE AN ACCOUNT MODAL (IMAGE 3) ================= */
            <div>
              {/* Orange decorative accent bar on top */}
              <div className="w-10 h-1 bg-[#FF6A00] rounded-full mb-3"></div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                Create an Account
              </h2>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Join TASPro to book, track and manage your home services.
              </p>

              {/* Form */}
              <form onSubmit={handleCreateAccountSubmit} className="space-y-3">
                {/* 1. Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Full Name <span className="text-[#FF6A00]">*</span>
                  </label>
                  <div
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all bg-white ${
                      signupErrors.fullName
                        ? "border-red-500 ring-2 ring-red-100"
                        : "border-gray-200 focus-within:border-[#FF6A00] focus-within:ring-2 focus-within:ring-orange-100"
                    }`}
                  >
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (signupErrors.fullName)
                          setSignupErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      placeholder="Enter your full name"
                      className="w-full text-xs sm:text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 font-sans bg-transparent"
                    />
                  </div>
                  {signupErrors.fullName && (
                    <p className="text-red-500 text-[11px] font-medium mt-0.5">• {signupErrors.fullName}</p>
                  )}
                </div>

                {/* 2. Mobile & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Mobile Number <span className="text-[#FF6A00]">*</span>
                    </label>
                    <div
                      className={`flex items-center rounded-xl border transition-all overflow-hidden bg-white ${
                        signupErrors.mobile
                          ? "border-red-500 ring-2 ring-red-100"
                          : "border-gray-200 focus-within:border-[#FF6A00] focus-within:ring-2 focus-within:ring-orange-100"
                      }`}
                    >
                      <div className="flex items-center gap-1 px-2.5 py-2 bg-gray-50 border-r border-gray-200 text-xs font-bold text-gray-800 shrink-0">
                        <span>+91</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 flex-1 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={signupMobile}
                          onChange={(e) => {
                            setSignupMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                            if (signupErrors.mobile)
                              setSignupErrors((prev) => ({ ...prev, mobile: "" }));
                          }}
                          placeholder="10-digit number"
                          className="w-full text-xs sm:text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 font-sans bg-transparent"
                        />
                      </div>
                    </div>
                    {signupErrors.mobile && (
                      <p className="text-red-500 text-[11px] font-medium mt-0.5">• {signupErrors.mobile}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Email Address <span className="text-[#FF6A00]">*</span>
                    </label>
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all bg-white ${
                        signupErrors.email
                          ? "border-red-500 ring-2 ring-red-100"
                          : "border-gray-200 focus-within:border-[#FF6A00] focus-within:ring-2 focus-within:ring-orange-100"
                      }`}
                    >
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (signupErrors.email)
                            setSignupErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        placeholder="Enter email"
                        className="w-full text-xs sm:text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 font-sans bg-transparent"
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-red-500 text-[11px] font-medium mt-0.5">• {signupErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* 3. Gender */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Gender <span className="text-[#FF6A00]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Male", "Female", "Other"] as const).map((g) => {
                      const isSelected = gender === g;
                      return (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setGender(g)}
                          className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer select-none ${
                            isSelected
                              ? "border-[#FF6A00] bg-orange-50/60 text-[#FF6A00]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-[#FF6A00] bg-[#FF6A00]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && <span className="w-1 h-1 rounded-full bg-white" />}
                          </span>
                          <span>{g}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Service Address & Live Map Card */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Service Address <span className="text-[#FF6A00]">*</span>
                  </label>

                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all bg-white ${
                      signupErrors.serviceAddress
                        ? "border-red-500 ring-2 ring-red-100"
                        : "border-gray-200 focus-within:border-[#FF6A00] focus-within:ring-2 focus-within:ring-orange-100"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={serviceAddress}
                      onChange={(e) => {
                        setServiceAddress(e.target.value);
                        if (signupErrors.serviceAddress)
                          setSignupErrors((prev) => ({ ...prev, serviceAddress: "" }));
                      }}
                      placeholder="Enter your service address"
                      className="w-full text-xs font-medium text-gray-900 outline-none placeholder:text-gray-400 font-sans bg-transparent"
                    />
                    
                    {/* Live GPS Trigger Button */}
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={geoLoading}
                      className="text-[11px] font-bold text-[#FF6A00] hover:text-orange-700 flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md hover:bg-orange-50 transition cursor-pointer"
                      title="Fetch current GPS location"
                    >
                      {geoLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>Use My Location</span>
                    </button>
                  </div>
                  {signupErrors.serviceAddress && (
                    <p className="text-red-500 text-[11px] font-medium mt-0.5">• {signupErrors.serviceAddress}</p>
                  )}

                  {/* Real Interactive Map Preview Card */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/90 shadow-2xs mt-1.5 relative">
                    
                    {/* Map Box */}
                    <div
                      ref={miniMapContainerRef}
                      onClick={() => setShowMapPicker(true)}
                      className="w-full h-22 sm:h-24 bg-[#E2E8F0] relative cursor-pointer"
                      title="Click to open full map location picker"
                    />

                    {/* Bottom Location Info Bar */}
                    <div className="p-2 px-3 bg-white border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                          <MapPin className="w-3 h-3 fill-[#FF6A00]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                            Selected Location
                          </div>
                          <div className="text-xs font-bold text-gray-900 truncate">
                            {selectedLocation}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="text-xs font-bold text-gray-600 hover:text-[#FF6A00] flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md hover:bg-gray-50 transition cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit on Map</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* 5. Create Account Submit */}
                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full py-3 bg-[#FF6A00] hover:bg-[#F05A00] disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {signupLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* 6. Switch back to Login */}
              <div className="mt-4 text-center text-xs text-gray-500 font-medium">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-bold text-[#FF6A00] hover:underline cursor-pointer ml-1"
                >
                  Login Now
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ================= RIGHT SIDE: BRAND BANNER ================= */}
        <AuthSideBanner />

      </div>

      {/* Full-Screen Map Picker Modal with Draggable Pin Marker */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLat={latitude}
        initialLng={longitude}
        onConfirm={(loc) => {
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
          if (loc.address) {
            setServiceAddress(loc.address);
          }
          const cityState = [loc.city, loc.state, "India"].filter(Boolean).join(", ");
          setSelectedLocation(cityState || "Raipur, Chhattisgarh, India");
          if (signupErrors.serviceAddress) {
            setSignupErrors((prev) => ({ ...prev, serviceAddress: "" }));
          }
        }}
      />

    </div>
  );
}
