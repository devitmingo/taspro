"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, X, ShieldCheck, ArrowLeft, RotateCw } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";

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

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMode(initialMode);
    setStep("phone");
    setOtpDigits(["", "", "", ""]);
  }, [initialMode, isOpen]);

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

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Please enter a valid 10-digit phone number.",
        confirmButtonColor: "#FF6A00",
      });
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

        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);

        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: `OTP has been sent to +${selectedCountry?.code || "91"} ${phone}`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.data.message || "Unable to send OTP.",
          confirmButtonColor: "#FF6A00",
        });
      }
    } catch (error: any) {
      console.error(error?.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#FF6A00",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

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

  const handleVerifyOTP = async (otpValue?: string) => {
    const finalOtp = otpValue || otpDigits.join("");
    if (finalOtp.length !== 4) {
      Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text: "Please enter a 4-digit code.",
        confirmButtonColor: "#FF6A00",
      });
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
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          mobile: u.mobile,
          alt_mobile: u.alt_mobile,
          alternateNumber: u.alt_mobile,
          gender: u.gender,
          profileImage: u.profile,
          profileCompleted: Boolean(u.first_name && u.first_name.trim() !== ""),
          contactVerified: true,
        });

        onClose();

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: `Logged in successfully!`,
          timer: 1500,
          showConfirmButton: false,
        });

        if (!u.first_name || u.first_name.trim() === "") {
          router.push(`/complete-profile-step-1?phone=${u.mobile}`);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: res.data.message || "Invalid OTP code. Please try again.",
          confirmButtonColor: "#FF6A00",
        });
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "OTP verification failed.",
        confirmButtonColor: "#FF6A00",
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl relative flex flex-col md:flex-row border border-gray-100 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side - Form Container */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-white overflow-hidden">
          <div>
            {step === "phone" ? (
              <>
                {/* Modal Tabs Header */}
                <div className="flex border-b border-gray-200 mb-5">
                  <button
                    onClick={() => setMode("login")}
                    className={`pb-2.5 px-3 text-sm font-bold transition-all relative ${
                      mode === "login"
                        ? "text-[#FF6A00] border-b-2 border-[#FF6A00]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={`pb-2.5 px-3 text-sm font-bold transition-all relative ${
                      mode === "signup"
                        ? "text-[#FF6A00] border-b-2 border-[#FF6A00]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">
                  {mode === "login" ? "Hello & Welcome!" : "Create Account"}
                </h2>
                <p className="text-xs text-gray-500 mb-5">
                  {mode === "login"
                    ? "Sign in to continue your journey with us"
                    : "Join us today to enjoy our home services"}
                </p>

                {/* Phone Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:border-[#FF6A00] focus-within:ring-1 focus-within:ring-[#FF6A00]">
                      <select
                        value={selectedCountry?.id || ""}
                        onChange={(e) => {
                          const c = countries.find((item) => item.id === Number(e.target.value));
                          if (c) setSelectedCountry(c);
                        }}
                        className="bg-gray-50 px-2.5 py-2.5 text-xs text-gray-700 font-medium border-r border-gray-200 outline-none"
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

                      <div className="relative flex-1 flex items-center">
                        <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                          placeholder="Enter 10-digit number"
                          className="w-full pl-8 pr-3 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#FF6A00] to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-sm transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* OTP Step Inside Modal */
              <>
                <button
                  onClick={() => setStep("phone")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-orange-600 mb-3 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Number</span>
                </button>

                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3 border border-orange-100 text-[#FF6A00]">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">
                  OTP Verification
                </h2>
                <p className="text-xs text-gray-500 mb-4 truncate">
                  Enter 4-digit code sent to{" "}
                  <strong className="text-gray-800">
                    +{selectedCountry?.code || "91"} {phone}
                  </strong>
                </p>

                {/* 4 Digit OTP Grid Inputs */}
                <div className="grid grid-cols-4 gap-2.5 mb-5" onPaste={handlePaste}>
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
                      className="w-full h-12 text-center text-lg font-bold rounded-xl border border-gray-300 focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 text-gray-900"
                    />
                  ))}
                </div>

                {/* Resend OTP */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-5">
                  {canResend ? (
                    <button
                      onClick={handleSendOTP}
                      className="text-[#FF6A00] font-bold hover:underline flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" /> Resend OTP
                    </button>
                  ) : (
                    <span>
                      Resend in <strong className="text-gray-700">{timer}s</strong>
                    </span>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  onClick={() => handleVerifyOTP()}
                  disabled={verifyLoading || otpDigits.join("").length !== 4}
                  className="w-full py-3 bg-gradient-to-r from-[#FF6A00] to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-sm transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  {verifyLoading ? "Verifying..." : "Verify & Proceed"}
                </button>
              </>
            )}
          </div>

          {/* Mode Switch Footer */}
          {step === "phone" && (
            <div className="pt-4 text-center text-xs text-gray-500 border-t border-gray-100 mt-4">
              {mode === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-[#FF6A00] font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-[#FF6A00] font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Brand Banner */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#FF6A00] to-orange-600 p-8 flex-col justify-between text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Welcome to TASPRO</h3>
            <p className="text-orange-100 text-xs leading-relaxed">
              Professional home services with certified technicians and guaranteed quality.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
            <p className="text-xs text-orange-50 font-medium leading-relaxed">
              "Join over 50,000+ happy homeowners getting reliable repair & cleaning services."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
