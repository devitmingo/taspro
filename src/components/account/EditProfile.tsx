"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Check,
  User,
  Mail,
  Phone,
  Smartphone,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, API_HOST_URL } from "@/config/api";
import Swal from "sweetalert2";

export default function EditProfile({
  setActiveView,
  profile,
  fetchProfile,
}: {
  setActiveView: (view: string) => void;
  profile: any;
  fetchProfile: () => void;
}) {
  const { login, user } = useAuth();

  const getImageUrl = (img?: string) => {
    if (!img) return "/img/profileimg.png";
    if (img.startsWith("http") || img.startsWith("/")) {
      return img;
    }
    return `${API_HOST_URL}/${img}`;
  };

  // Initial values to detect if user changed their phone or email
  const [initialPhone, setInitialPhone] = useState(
    profile?.mobile || user?.mobile || user?.phone || ""
  );
  const [initialEmail, setInitialEmail] = useState(
    profile?.email || user?.email || ""
  );

  // Full Name
  const [fullName, setFullName] = useState(
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      profile?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      ""
  );

  // Email
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [isEmailVerified, setIsEmailVerified] = useState(
    Boolean(profile?.email || user?.email)
  );

  // Phone Number
  const [phone, setPhone] = useState(
    profile?.mobile || user?.mobile || user?.phone || ""
  );
  const [isPhoneVerified, setIsPhoneVerified] = useState(
    Boolean(profile?.mobile || user?.mobile || user?.phone)
  );

  // Alternate Phone Number
  const [altPhone, setAltPhone] = useState(
    profile?.alt_mobile ||
      profile?.alternateNumber ||
      user?.alt_mobile ||
      user?.alternateNumber ||
      ""
  );

  // Gender: clean values: "Male" | "Female" | "Other"
  const [gender, setGender] = useState(
    profile?.gender || user?.gender || "Male"
  );

  // Profile image preview
  const [preview, setPreview] = useState(
    profile?.profile_url || user?.profileImage || "/img/profileimg.png"
  );
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      const name =
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
        profile?.name ||
        "";
      if (name) setFullName(name);

      if (profile.email) {
        setEmail(profile.email);
        setInitialEmail(profile.email);
        setIsEmailVerified(true);
      }
      if (profile.mobile) {
        setPhone(profile.mobile);
        setInitialPhone(profile.mobile);
        setIsPhoneVerified(true);
      }
      if (profile.alt_mobile) {
        setAltPhone(profile.alt_mobile);
      }
      if (profile.gender) {
        setGender(profile.gender);
      }
      if (profile.profile_url) {
        setPreview(profile.profile_url);
      }
    }
  }, [profile]);

  // Verify Email Handler
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#ff6a00",
      });
      return false;
    }

    const { value: code } = await Swal.fire({
      title: "Verify Email Address",
      html: `
        <div style="text-align: left; font-size: 14px; color: #4B5563;">
          <p>We've sent a 4-digit verification code to:</p>
          <p style="font-weight: 700; color: #111827; margin: 4px 0 16px 0; font-size: 15px;">${trimmedEmail}</p>
          <label style="font-size: 12px; font-weight: 600; color: #374151;">Enter Verification Code</label>
        </div>
      `,
      input: "text",
      inputPlaceholder: "••••",
      inputAttributes: {
        maxlength: "6",
        style: "text-align: center; letter-spacing: 6px; font-size: 20px; font-weight: bold;",
      },
      showCancelButton: true,
      confirmButtonText: "Verify Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ff6a00",
      cancelButtonColor: "#9CA3AF",
      preConfirm: (val) => {
        if (!val || val.trim().length < 4) {
          Swal.showValidationMessage("Please enter the 4-digit verification code");
          return false;
        }
        return val.trim();
      },
    });

    if (code) {
      setIsEmailVerified(true);
      await Swal.fire({
        icon: "success",
        title: "Email Verified!",
        text: "Your email address has been successfully verified.",
        timer: 1800,
        showConfirmButton: false,
      });
      return true;
    }
    return false;
  };

  // Verify Phone Handler with OTP
  const handleVerifyPhone = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      Swal.fire({
        icon: "warning",
        title: "Phone Number Required",
        text: "Please enter a 10-digit mobile number.",
        confirmButtonColor: "#ff6a00",
      });
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Mobile Number",
        text: "Please enter a valid 10-digit Indian mobile number starting with 6-9.",
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
      console.log("OTP send notice:", e);
    }

    const { value: otp } = await Swal.fire({
      title: "Verify Phone Number",
      html: `
        <div style="text-align: left; font-size: 14px; color: #4B5563;">
          <p>We've sent a 4-digit verification OTP to:</p>
          <p style="font-weight: 700; color: #111827; margin: 4px 0 16px 0; font-size: 16px;">+91 ${trimmedPhone}</p>
          <label style="font-size: 12px; font-weight: 600; color: #374151;">Enter 4-Digit OTP</label>
        </div>
      `,
      input: "text",
      inputPlaceholder: "••••",
      inputAttributes: {
        maxlength: "4",
        style: "text-align: center; letter-spacing: 6px; font-size: 20px; font-weight: bold;",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        title: "Phone Number Required",
        text: "Please enter your phone number.",
        confirmButtonColor: "#ff6a00",
      });
      return;
    }

    // OTP verification required if phone changed
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

    // Verification required if email changed
    if (
      email.trim() &&
      email.trim().toLowerCase() !== initialEmail.trim().toLowerCase() &&
      !isEmailVerified
    ) {
      const result = await Swal.fire({
        icon: "info",
        title: "Email Verification Required",
        text: `You have changed your email to ${email.trim()}. Please verify it before saving.`,
        showCancelButton: true,
        confirmButtonText: "Verify Email",
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

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customer_id");

      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const formData = new FormData();
      formData.append("customer_id", customerId || "");
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email.trim());
      formData.append("mobile", phone.trim());
      formData.append("alt_mobile", altPhone.trim());
      formData.append("gender", gender);

      if (profileFile) {
        formData.append("profile", profileFile);
      }

      const res = await axios.post(
        `${API_BASE_URL}/customers/update-profile`,
        formData,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.status) {
        await fetchProfile();

        const profileRes = await axios.get(
          `${API_BASE_URL}/customers/profile`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const updated = profileRes.data.data;

        login({
          phone: updated.mobile,
          firstName: updated.first_name,
          lastName: updated.last_name,
          email: updated.email,
          alternateNumber: updated.alt_mobile,
          alt_mobile: updated.alt_mobile,
          gender: updated.gender,
          profileImage: updated.profile_url,
          profileCompleted: true,
          contactVerified: true,
        });

        await Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Your profile has been updated successfully.",
          timer: 1800,
          showConfirmButton: false,
        });

        setActiveView("default");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: res.data.message || "Profile update failed",
          confirmButtonColor: "#ff6a00",
        });
      }
    } catch (error: any) {
      console.log("Update profile error:", error?.response?.data || error);

      await Swal.fire({
        icon: "error",
        title: "Oops!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong",
        confirmButtonColor: "#ff6a00",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
      <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setActiveView("default")}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#FF6A00] flex items-center justify-center transition-all cursor-pointer border border-gray-200 hover:border-orange-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Edit Profile
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Update your personal details and contact verification
            </p>
          </div>
        </div>

        {/* Hidden file input for photo upload */}
        <input
          type="file"
          id="profileUpload"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setProfileFile(file);
              setPreview(URL.createObjectURL(file));
            }
          }}
        />

        {/* Profile Photo Edit (Square with curved corners) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/30 border border-orange-100 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          <div
            onClick={() => document.getElementById("profileUpload")?.click()}
            className="relative group cursor-pointer shrink-0"
            title="Click to change profile photo"
          >
            <img
              src={preview}
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover aspect-square shadow-sm border-2 border-orange-200 ring-4 ring-white group-hover:opacity-90 transition-all"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/img/profileimg.png";
              }}
            />
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-[#FF6A00] hover:bg-[#F05A00] text-white flex items-center justify-center shadow-md border-2 border-white transition-transform group-hover:scale-105">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Profile Photo
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload a photo to personalize your customer profile across TASpro.
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={() => document.getElementById("profileUpload")?.click()}
                className="px-3.5 py-1.5 bg-white hover:bg-orange-50 border border-orange-200 text-[#FF6A00] font-bold text-xs rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>

              {profileFile && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileFile(null);
                    setPreview(profile?.profile_url || user?.profileImage || "/img/profileimg.png");
                  }}
                  className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              Recommended: Square JPG, PNG or WEBP (up to 5MB)
            </p>
          </div>
        </div>

        {/* 1. Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-bold text-gray-700">
            Full Name <span className="text-[#FF6A00]">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none">
              <User className="w-4 h-4" />
            </div>
            <input
              name="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* 2. Email Address with Verification */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-bold text-gray-700">
            Email Address <span className="text-[#FF6A00]">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (val.trim().toLowerCase() !== initialEmail.trim().toLowerCase()) {
                  setIsEmailVerified(false);
                } else {
                  setIsEmailVerified(true);
                }
              }}
              placeholder="e.g. name@example.com"
              className="w-full pl-10 pr-28 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
            />
            <div className="absolute right-2.5">
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
        </div>

        {/* 3. Gender (Clean Segmented Selector: Male, Female, Other) */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-gray-700">
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
                      ? "border-[#FF6A00] bg-orange-50/50 text-[#FF6A00] ring-1 ring-orange-200 shadow-2xs"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-700 hover:bg-white"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#FF6A00] bg-[#FF6A00]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span>{g}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Phone Number with OTP Verification */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-bold text-gray-700">
            Phone Number <span className="text-[#FF6A00]">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center gap-1.5 text-gray-500 font-bold text-xs pointer-events-none">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>+91</span>
              <span className="text-gray-300">|</span>
            </div>
            <input
              type="tel"
              name="phone"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPhone(val);
                if (val !== initialPhone) {
                  setIsPhoneVerified(false);
                } else {
                  setIsPhoneVerified(true);
                }
              }}
              placeholder="9876543210"
              className="w-full pl-20 pr-32 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all font-mono placeholder:text-gray-400"
            />
            <div className="absolute right-2.5">
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
              Phone number changed. Click "Verify via OTP" to verify with OTP before saving.
            </p>
          )}
        </div>

        {/* 5. Alternate Phone Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-bold text-gray-700">
              Alternate Phone Number
            </label>
            <span className="text-[11px] text-gray-400 font-medium">Optional</span>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center gap-1.5 text-gray-500 font-bold text-xs pointer-events-none">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span>+91</span>
              <span className="text-gray-300">|</span>
            </div>
            <input
              type="tel"
              name="altPhone"
              maxLength={10}
              value={altPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setAltPhone(val);
              }}
              placeholder="Secondary mobile number"
              className="w-full pl-20 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 transition-all font-mono placeholder:text-gray-400"
            />
          </div>
          <p className="text-[11px] text-gray-400">
            Used by service technicians if your primary number is unreachable.
          </p>
        </div>

        {/* Save & Cancel Actions */}
        <div className="pt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 bg-gradient-to-r from-[#FF6A00] to-[#FF5500] hover:opacity-95 active:scale-[0.99] text-white font-extrabold rounded-xl shadow-md text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <span>Saving Changes...</span> : <span>Save Changes</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveView("default")}
            className="px-6 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
