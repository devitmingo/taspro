"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, User, Check } from "lucide-react";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import Swal from "sweetalert2";

const EditProfilePage = () => {
  const router = useRouter();
  const { user, login } = useAuth();

  const [fullName, setFullName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(user?.email));
  const [phone, setPhone] = useState(user?.mobile || user?.phone || "");
  const [isPhoneVerified, setIsPhoneVerified] = useState(
    Boolean(user?.mobile || user?.phone)
  );
  const [altPhone, setAltPhone] = useState(
    user?.alt_mobile || user?.alternateNumber || ""
  );
  const [gender, setGender] = useState(user?.gender || "Male");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const name =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";
      if (name) setFullName(name);
      if (user.email) {
        setEmail(user.email);
        setIsEmailVerified(true);
      }
      if (user.mobile || user.phone) {
        setPhone(user.mobile || user.phone);
        setIsPhoneVerified(true);
      }
      if (user.alt_mobile || user.alternateNumber) {
        setAltPhone(user.alt_mobile || user.alternateNumber || "");
      }
      if (user.gender) setGender(user.gender);
    }
  }, [user]);

  const handleVerifyEmail = async () => {
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter an email address to verify.",
        confirmButtonColor: "#ff5500",
      });
      return;
    }

    const { value: code } = await Swal.fire({
      title: "Verify Email",
      html: `
        <div style="text-align: left; font-size: 14px; color: #4B5563;">
          <p>We've sent a 4-digit verification code to:</p>
          <p style="font-weight: 700; color: #111827; margin: 4px 0 16px 0;">${email.trim()}</p>
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
          Swal.showValidationMessage("Please enter the 4-digit code");
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

  const handleVerifyPhone = async () => {
    if (!phone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Phone Required",
        text: "Please enter a 10-digit mobile number.",
        confirmButtonColor: "#ff5500",
      });
      return;
    }

    const { value: otp } = await Swal.fire({
      title: "Verify Mobile Number",
      html: `
        <div style="text-align: left; font-size: 14px; color: #4B5563;">
          <p>We've sent an OTP to:</p>
          <p style="font-weight: 700; color: #111827; margin: 4px 0 16px 0;">+91 ${phone.trim()}</p>
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

  const handleSave = async () => {
    if (!fullName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Full Name Required",
        text: "Please enter your full name.",
        confirmButtonColor: "#ff5500",
      });
      return;
    }

    if (phone.trim() !== (user?.mobile || user?.phone || "") && !isPhoneVerified) {
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
        await handleVerifyPhone();
      }
      return;
    }

    setLoading(true);
    try {
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
          phone: phone.trim(),
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
          confirmButtonColor: "#ff5500",
        });
      }
    } catch (e: any) {
      await Swal.fire({
        icon: "error",
        title: "Oops!",
        text: e?.response?.data?.message || "Failed to update profile.",
        confirmButtonColor: "#ff5500",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64">
            <AccountSidebar />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Form */}
              <div className="space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                  </div>

                  {/* Email Address with Verify Button */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (e.target.value !== (user?.email || "")) {
                            setIsEmailVerified(false);
                          }
                        }}
                        placeholder="Enter your email"
                        className="w-full p-3 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                      <div className="absolute right-2">
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
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <div className="flex gap-4">
                    {["Male", "Female", "Other"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={option}
                          checked={gender === option}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-gray-700 text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Phone & Alternate Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Number with Verify */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setPhone(val);
                          if (val !== (user?.mobile || user?.phone || "")) {
                            setIsPhoneVerified(false);
                          }
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full p-3 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                      <div className="absolute right-2">
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

                  {/* Alternate Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Phone Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={altPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setAltPhone(val);
                      }}
                      placeholder="Alternate number (optional)"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSave}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
