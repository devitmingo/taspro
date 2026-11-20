"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, User, Check, AlertCircle, Phone, Smartphone, Mail } from "lucide-react";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import Swal from "sweetalert2";

const EditProfilePage = () => {
  const router = useRouter();
  const { user, login } = useAuth();
  const initializedRef = useRef(false);

  const [fullName, setFullName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || (user as any)?.name || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [initialEmail, setInitialEmail] = useState(user?.email || "");
  const [isEmailVerified, setIsEmailVerified] = useState(
    Boolean((user as any)?.is_email_verified || (user as any)?.email_verified_at)
  );

  const [phone, setPhone] = useState(
    (user?.mobile || user?.phone || "").replace(/\D/g, "").slice(-10)
  );
  const [initialPhone, setInitialPhone] = useState(
    (user?.mobile || user?.phone || "").replace(/\D/g, "").slice(-10)
  );
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);

  const [altPhone, setAltPhone] = useState(
    (user?.alt_mobile || user?.alternateNumber || "").replace(/\D/g, "").slice(-10)
  );
  const [gender, setGender] = useState(user?.gender || "Male");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !initializedRef.current) {
      initializedRef.current = true;
      const name =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || (user as any)?.name || "";
      if (name) setFullName(name);
      if (user.email) {
        setEmail(user.email);
        setInitialEmail(user.email);
        setIsEmailVerified(Boolean((user as any)?.is_email_verified || (user as any)?.email_verified_at));
      } else {
        setIsEmailVerified(false);
      }
      if (user.mobile || user.phone) {
        const cleanMob = (user.mobile || user.phone || "").replace(/\D/g, "").slice(-10);
        setPhone(cleanMob);
        setInitialPhone(cleanMob);
        setIsPhoneVerified(true);
      }
      if (user.alt_mobile || user.alternateNumber) {
        setAltPhone(((user.alt_mobile || user.alternateNumber || "") as string).replace(/\D/g, "").slice(-10));
      }
      if (user.gender) setGender(user.gender);
    }
  }, [user]);

  const handleVerifyEmail = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter an email address to verify.",
        confirmButtonColor: "#ff6a00",
      });
      return false;
    }

    try {
      await axios.post(`${API_BASE_URL}/customers/send-email-otp`, {
        email: trimmedEmail,
      });
    } catch (e) {
      console.log("Send email OTP error:", e);
    }

    const { value: code } = await Swal.fire({
      title: "Verify Email",
      html: `
        <div style="text-align: left; font-size: 14px; color: #4B5563;">
          <p>We've sent a 4-digit verification code to:</p>
          <p style="font-weight: 700; color: #111827; margin: 4px 0 16px 0;">${trimmedEmail}</p>
          <label style="font-size: 12px; font-weight: 600; color: #374151;">Enter Verification Code</label>
        </div>
      `,
      input: "text",
      inputPlaceholder: "••••",
      inputAttributes: {
        maxlength: "4",
        style: "text-align: center; letter-spacing: 4px; font-size: 18px; font-weight: bold;",
      },
      showCancelButton: true,
      confirmButtonText: "Verify Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ff6a00",
      cancelButtonColor: "#9CA3AF",
      preConfirm: (val) => {
        if (!val || val.trim().length !== 4) {
          Swal.showValidationMessage("Please enter the 4-digit code");
          return false;
        }
        return val.trim();
      },
    });

    if (code) {
      try {
        const token = localStorage.getItem("token");
        const headers = token
          ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
          : { Accept: "application/json" };

        const res = await axios.post(
          `${API_BASE_URL}/customers/verify-email-otp`,
          {
            email: trimmedEmail,
            otp: code,
          },
          { headers }
        );

        if (res.data?.status) {
          setIsEmailVerified(true);
          await Swal.fire({
            icon: "success",
            title: "Email Verified!",
            text: "Your email address has been successfully verified.",
            timer: 1800,
            showConfirmButton: false,
          });
          return true;
        } else {
          Swal.fire({
            icon: "error",
            title: "Verification Failed",
            text: res.data?.message || "Invalid verification code.",
            confirmButtonColor: "#ff6a00",
          });
          return false;
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: err.response?.data?.message || "Invalid OTP entered.",
          confirmButtonColor: "#ff6a00",
        });
        return false;
      }
    }
    return false;
  };

  const handleVerifyPhone = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      Swal.fire({
        icon: "warning",
        title: "Phone Required",
        text: "Please enter a 10-digit mobile number.",
        confirmButtonColor: "#ff6a00",
      });
      return false;
    }

    try {
      await axios.post(`${API_BASE_URL}/customers/send-otp`, {
        mobile: trimmedPhone,
        country_id: 1,
      });
    } catch (e) {
      console.log("Send OTP error:", e);
    }

    const { value: otp } = await Swal.fire({
      title: "Verify Mobile Number",
      html: `
        <div style="text-align: left; font-size: 14px; color: #4B5563;">
          <p>We've sent an OTP to:</p>
          <p style="font-weight: 700; color: #111827; margin: 4px 0 16px 0;">+91 ${trimmedPhone}</p>
          <label style="font-size: 12px; font-weight: 600; color: #374151;">Enter 4-Digit OTP</label>
        </div>
      `,
      input: "text",
      inputPlaceholder: "••••",
      inputAttributes: {
        maxlength: "4",
        style: "text-align: center; letter-spacing: 4px; font-size: 18px; font-weight: bold;",
      },
      showCancelButton: true,
      confirmButtonText: "Verify OTP",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ff6a00",
      cancelButtonColor: "#9CA3AF",
      preConfirm: (val) => {
        if (!val || val.trim().length !== 4) {
          Swal.showValidationMessage("Please enter the 4-digit OTP");
          return false;
        }
        return val.trim();
      },
    });

    if (otp) {
      setIsPhoneVerified(true);
      await Swal.fire({
        icon: "success",
        title: "Mobile Verified!",
        text: "Your mobile number has been successfully verified.",
        timer: 1800,
        showConfirmButton: false,
      });
      return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Full Name Required",
        text: "Please enter your full name.",
        confirmButtonColor: "#ff6a00",
      });
      return;
    }

    if (!phone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Phone Required",
        text: "Please enter your mobile number.",
        confirmButtonColor: "#ff6a00",
      });
      return;
    }

    if (phone.trim() !== initialPhone && !isPhoneVerified) {
      const result = await Swal.fire({
        icon: "info",
        title: "OTP Verification Required",
        text: `You have changed your phone number to +91 ${phone.trim()}. Please verify with OTP before saving.`,
        showCancelButton: true,
        confirmButtonText: "Send & Verify OTP",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ff6a00",
      });
      if (result.isConfirmed) {
        const verified = await handleVerifyPhone();
        if (!verified) return;
      } else {
        return;
      }
    }

    if (email.trim() && !isEmailVerified) {
      const result = await Swal.fire({
        icon: "info",
        title: "Email Verification Required",
        text: `Your email (${email.trim()}) is not yet verified. Please verify it with OTP before saving.`,
        showCancelButton: true,
        confirmButtonText: "Verify via OTP",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ff6a00",
      });
      if (result.isConfirmed) {
        const verified = await handleVerifyEmail();
        if (!verified) return;
      } else {
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customer_id") || user?.id || "";

      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const formData = new FormData();
      formData.append("customer_id", String(customerId));
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("name", fullName.trim());
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim());
      formData.append("is_email_verified", isEmailVerified ? "1" : "0");
      formData.append("mobile", phone.trim().replace(/\D/g, "").slice(-10));
      formData.append("alt_mobile", altPhone.trim().replace(/\D/g, "").slice(-10));
      formData.append("gender", gender);

      const res = await axios.post(
        `${API_BASE_URL}/customers/update-profile`,
        formData,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.status) {
        login({
          id: user?.id,
          phone: phone.trim().replace(/\D/g, "").slice(-10),
          firstName,
          lastName,
          email: email.trim(),
          alternateNumber: altPhone.trim(),
          alt_mobile: altPhone.trim(),
          gender,
          profileCompleted: true,
          contactVerified: true,
        });

        await Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Your profile has been saved successfully.",
          timer: 1800,
          showConfirmButton: false,
        });

        router.push("/account");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: res.data.message || "Failed to update profile.",
          confirmButtonColor: "#ff6a00",
        });
      }
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e.response?.data?.message || "Failed to update profile. Please try again.",
        confirmButtonColor: "#ff6a00",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <AccountSidebar />

          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Edit Profile
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Update your personal details and contact verification
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-[#FF6A00]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900"
                    />
                  </div>
                </div>

                {/* Email Address with OTP Verify */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-[#FF6A00]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        if (val.trim().toLowerCase() !== initialEmail.trim().toLowerCase()) {
                          setIsEmailVerified(false);
                        }
                      }}
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-32 py-3 border border-gray-200 rounded-xl focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isEmailVerified && email.trim() ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200/80">
                          <Check className="w-3 h-3 stroke-[3]" /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleVerifyEmail}
                          className="text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#F05A00] px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                  {email.trim() && !isEmailVerified && (
                    <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Email is unverified. Click &quot;Verify&quot; to verify via OTP.
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender <span className="text-[#FF6A00]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Male", "Female", "Other"].map((g) => {
                      const isSelected = gender === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#FF6A00] bg-orange-50/50 text-[#FF6A00] ring-1 ring-orange-200"
                              : "border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-700 hover:bg-white"
                          }`}
                        >
                          <span>{g}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phone Number with OTP Verify */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-[#FF6A00]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-500 font-bold text-xs pointer-events-none">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>+91</span>
                      <span className="text-gray-300">|</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(val);
                        if (val !== initialPhone) {
                          setIsPhoneVerified(false);
                        } else {
                          setIsPhoneVerified(true);
                        }
                      }}
                      className="w-full pl-20 pr-36 py-3 border border-gray-200 rounded-xl focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900 font-mono"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isPhoneVerified && phone.trim() ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200/80">
                          <Check className="w-3 h-3 stroke-[3]" /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleVerifyPhone}
                          className="text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#F05A00] px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                          Verify via OTP
                        </button>
                      )}
                    </div>
                  </div>
                  {phone !== initialPhone && !isPhoneVerified && (
                    <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Phone number changed. Click &quot;Verify via OTP&quot; to verify before saving.
                    </p>
                  )}
                </div>

                {/* Alternate Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alternate Phone Number <span className="text-xs font-normal text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-500 font-bold text-xs pointer-events-none">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <span>+91</span>
                      <span className="text-gray-300">|</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={altPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setAltPhone(val);
                      }}
                      placeholder="Alternate phone number"
                      className="w-full pl-20 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900 font-mono"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#FF6A00] to-[#FF5500] hover:opacity-95 text-white font-bold rounded-xl shadow-md text-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => router.push("/account")}
                    className="px-6 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
