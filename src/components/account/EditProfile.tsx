"use client";

import Image from "next/image";
import { ArrowLeft, Check } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import GradientButton2 from "@/components/ui/GradientButton2";
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
  const getImageUrl = (img?: string) => {
    if (!img) return "/img/profileimg.png";

    if (img.startsWith("http") || img.startsWith("/")) {
      return img;
    }

    return `${API_HOST_URL}/${img}`;
  };

  const { login, user } = useAuth();

  // Full Name: directly full name instead of first name
  const [fullName, setFullName] = useState(
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      profile?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      ""
  );

  // Email in place of Last Name with verify button
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [isEmailVerified, setIsEmailVerified] = useState(
    Boolean(profile?.email || user?.email)
  );

  // Phone Number with verify button
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

  const [gender, setGender] = useState(
    profile?.gender || user?.gender || "Male"
  );
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
        setIsEmailVerified(true);
      }
      if (profile.mobile) {
        setPhone(profile.mobile);
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
        confirmButtonColor: "#ff5500",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#ff5500",
      });
      return;
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
      inputPlaceholder: "e.g. 1234",
      inputAttributes: {
        maxlength: "6",
        style: "text-align: center; letter-spacing: 4px; font-size: 18px; font-weight: bold;",
      },
      showCancelButton: true,
      confirmButtonText: "Verify Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ff5500",
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
    }
  };

  // Verify Phone Handler
  const handleVerifyPhone = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      Swal.fire({
        icon: "warning",
        title: "Phone Number Required",
        text: "Please enter a 10-digit mobile number.",
        confirmButtonColor: "#ff5500",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Mobile Number",
        text: "Please enter a valid 10-digit Indian mobile number starting with 6-9.",
        confirmButtonColor: "#ff5500",
      });
      return;
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
          <p>We've sent an OTP to:</p>
          <p style="font-weight: 700; color: #111827; margin: 4px 0 16px 0;">+91 ${trimmedPhone}</p>
          <label style="font-size: 12px; font-weight: 600; color: #374151;">Enter 4-Digit OTP</label>
        </div>
      `,
      input: "text",
      inputPlaceholder: "Enter 4-digit OTP",
      inputAttributes: {
        maxlength: "4",
        style: "text-align: center; letter-spacing: 4px; font-size: 18px; font-weight: bold;",
      },
      showCancelButton: true,
      confirmButtonText: "Verify OTP",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ff5500",
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
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Full Name Required",
        text: "Please enter your full name.",
        confirmButtonColor: "#ff5500",
      });
      return;
    }

    if (!phone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Phone Number Required",
        text: "Please enter your phone number.",
        confirmButtonColor: "#ff5500",
      });
      return;
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
          confirmButtonColor: "#ff5500",
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
        confirmButtonColor: "#ff5500",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[390px] md:ml-12 mx-auto md:mx-0 flex flex-col items-center md:items-start">
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="w-full flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => setActiveView("default")}
            className="text-black dark:text-white font-medium flex items-center gap-2 hover:text-orange-500 transition cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span>Edit Profile</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="font-semibold bg-gradient-to-r from-[#FEC12D] to-[#FF552C] bg-clip-text text-transparent cursor-pointer"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="flex justify-center md:justify-start mb-10">
          <div className="relative">
            <Image
              src={preview}
              alt="profile"
              width={150}
              height={150}
              className="w-[150px] h-[150px] rounded-full object-cover overflow-hidden"
            />

            <label htmlFor="profileUpload">
              <div className="absolute bottom-1 right-1 bg-white w-7 h-7 flex items-center justify-center rounded-full cursor-pointer shadow">
                <Image
                  src="/icons/edit.png"
                  alt="edit"
                  width={16}
                  height={16}
                />
              </div>
            </label>

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
          </div>
        </div>

        {/* 1. Full Name (Directly full name instead of First Name) */}
        <div>
          <label className="text-[14px] md:text-[16px] font-semibold text-black dark:text-white">
            Full Name
          </label>
          <input
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full text-[14px] md:text-[16px] border-b border-orange-400 bg-white dark:bg-gray-100 outline-none p-2 text-black dark:text-gray-700 dark:rounded-lg"
          />
        </div>

        {/* 2. Email Address in place of Last Name with Verify Button */}
        <div>
          <label className="text-[14px] md:text-[16px] font-semibold text-black dark:text-white">
            Email Address
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value !== (profile?.email || "")) {
                  setIsEmailVerified(false);
                }
              }}
              placeholder="Enter your email address"
              className="w-full text-[14px] md:text-[16px] border-b border-orange-400 bg-white dark:bg-gray-100 outline-none p-2 pr-24 text-black dark:text-gray-700 dark:rounded-lg"
            />
            <div className="absolute right-1 bottom-1.5">
              {isEmailVerified && email.trim() ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <Check className="w-3 h-3 stroke-[3]" /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  className="text-xs font-bold text-[#FF6A00] hover:text-white bg-orange-50 hover:bg-[#FF6A00] px-3 py-1 rounded-full border border-orange-300 hover:border-orange-500 transition-all cursor-pointer shadow-2xs"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Gender Selection */}
        <div>
          <p className="text-[14px] md:text-[16px] font-semibold mb-2 text-black dark:text-white">
            Select gender
          </p>

          <div className="flex flex-col gap-4">
            {["Male", "Female", "Other"].map((g) => (
              <label
                key={g}
                className="flex items-center gap-3 text-[14px] md:text-[16px] cursor-pointer group"
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="hidden"
                />

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                    gender === g
                      ? "bg-gradient-to-r from-[#FEC12D] to-[#FF552C]"
                      : "border-2 border-gray-400 group-hover:border-orange-400"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-white transition-all duration-200 ${
                      gender === g ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>

                <span className="text-black dark:text-gray-200">
                  {g === "Male"
                    ? "I am male"
                    : g === "Female"
                      ? "I am female"
                      : "Rather not to say"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Phone Number with Verify Button */}
        <div>
          <label className="text-[14px] md:text-[16px] font-semibold text-black dark:text-white">
            Phone Number
          </label>
          <div className="relative flex items-center">
            <input
              type="tel"
              name="phone"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPhone(val);
                if (val !== (profile?.mobile || "")) {
                  setIsPhoneVerified(false);
                }
              }}
              placeholder="Enter 10-digit mobile number"
              className="w-full text-[14px] md:text-[16px] border-b border-orange-400 bg-white dark:bg-gray-100 outline-none p-2 pr-24 text-black dark:text-gray-700 dark:rounded-lg"
            />
            <div className="absolute right-1 bottom-1.5">
              {isPhoneVerified && phone.trim() ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <Check className="w-3 h-3 stroke-[3]" /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  className="text-xs font-bold text-[#FF6A00] hover:text-white bg-orange-50 hover:bg-[#FF6A00] px-3 py-1 rounded-full border border-orange-300 hover:border-orange-500 transition-all cursor-pointer shadow-2xs"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5. Alternate Phone Number */}
        <div>
          <label className="text-[14px] md:text-[16px] font-semibold text-black dark:text-white">
            Alternate Phone Number
          </label>
          <input
            type="tel"
            name="altPhone"
            maxLength={10}
            value={altPhone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setAltPhone(val);
            }}
            placeholder="Enter alternate mobile number (optional)"
            className="w-full text-[14px] md:text-[16px] border-b border-orange-400 bg-white dark:bg-gray-100 outline-none p-2 text-black dark:text-gray-700 mb-4 dark:rounded-lg placeholder:text-gray-400 placeholder:text-xs"
          />
        </div>

        {/* Save Button */}
        <div className="w-full pt-2">
          <GradientButton2
            text={loading ? "Saving..." : "Save"}
            width="w-full"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
