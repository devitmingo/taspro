"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Home,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  Phone,
  Navigation,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import AddNewAddressModal from "../AddNewAddressModal";
import Swal from "sweetalert2";

type Props = {
  setActiveView: (view: string) => void;
};

export default function SavedAddresses({ setActiveView }: Props) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchAddresses = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/customers/customer-addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setAddresses(res.data?.data || []);
    } catch (error) {
      console.log("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (formData: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const cleanPhone = (val: string) => {
      const digits = val.replace(/\D/g, "").replace(/^91/, "").replace(/^0/, "");
      return `+91 ${digits}`;
    };

    const payload = {
      full_name: formData.fullName || formData.name || "Customer",
      contact_number: cleanPhone(formData.contactNumber || formData.phone || ""),
      alt_contact_number: cleanPhone(
        formData.alternateNumber || formData.altPhone || formData.phone || ""
      ),
      postal_code: formData.postalCode || formData.pincode || "492001",
      latitude: formData.latitude || 21.2514,
      longitude: formData.longitude || 81.6296,
      country_id: 1,
      state_id: 1,
      city_id: 1,
      state_name: formData.state_name || formData.state || "Chhattisgarh",
      city_name: formData.city_name || formData.city || "Raipur",
      house_number: formData.houseNo || "",
      street: formData.street || formData.location || formData.address || "",
      type: "Home",
      is_active: 1,
    };

    try {
      await axios.post(`${API_BASE_URL}/customers/customer-addresses`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      setIsAddModalOpen(false);
      await fetchAddresses();

      Swal.fire({
        icon: "success",
        title: "Address Saved",
        text: "Your new address has been added successfully.",
        confirmButtonColor: "#FF6A00",
      });
    } catch (err: any) {
      console.error("Save address error:", err);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: err.response?.data?.message || "Could not save address. Please try again.",
        confirmButtonColor: "#FF6A00",
      });
    }
  };

  const handleDelete = (addressId: number) => {
    Swal.fire({
      title: "Delete Address?",
      text: "Are you sure you want to remove this saved address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `${API_BASE_URL}/customers/customer-addresses/${addressId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );
          setAddresses((prev) => prev.filter((a) => a.id !== addressId));
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Address removed.",
            confirmButtonColor: "#FF6A00",
          });
        } catch (e) {
          // Fallback UI delete
          setAddresses((prev) => prev.filter((a) => a.id !== addressId));
        }
      }
    });
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* 1. Header with Back Button & Add Address */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveView("default")}
            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50/60 hover:bg-orange-50 hover:border-orange-200 text-gray-700 hover:text-[#FF6A00] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Saved Addresses
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage your saved locations for fast, 1-click home service appointments
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-center px-4 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* 2. Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 animate-pulse space-y-3"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        /* 3. Empty State */
        <div className="text-center py-14 px-4 rounded-3xl bg-gray-50/60 border border-dashed border-gray-200 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200/80 text-[#FF6A00] flex items-center justify-center mx-auto shadow-2xs">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              No Saved Addresses Found
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Save your home, apartment or office address once to schedule verified technicians in seconds.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#F05A00] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Address</span>
            </button>
          </div>
        </div>
      ) : (
        /* 4. Addresses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {addresses.map((addr: any, index: number) => {
            const isHome =
              (addr.type || "").toLowerCase() === "home" ||
              (addr.address_type || "").toLowerCase() === "home";
            const isOffice =
              (addr.type || "").toLowerCase() === "office" ||
              (addr.type || "").toLowerCase() === "work";

            const street =
              addr.street ||
              addr.address ||
              addr.address_line_1 ||
              addr.location ||
              "";
            const house = addr.house_number || addr.houseNo || "";
            const city =
              typeof addr.city === "object"
                ? addr.city?.name
                : addr.city_name || addr.city || "Raipur";
            const state =
              typeof addr.state === "object"
                ? addr.state?.name
                : addr.state_name || addr.state || "Chhattisgarh";
            const pin = addr.postal_code || addr.pincode || addr.pin || "";

            const isDefault = index === 0;

            return (
              <div
                key={addr.id || index}
                className="p-5 sm:p-6 rounded-2xl border border-gray-200/90 hover:border-orange-200 bg-white hover:bg-orange-50/10 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  {/* Top Bar: Icon + Name + Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0">
                        {isHome ? (
                          <Home className="w-5 h-5 text-orange-600" />
                        ) : isOffice ? (
                          <Building2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <MapPin className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                            {addr.full_name || addr.name || "Customer Address"}
                          </h3>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {addr.type || addr.address_type || "Home"}
                          </span>
                        </div>
                        {addr.contact_number && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{addr.contact_number}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {isDefault && (
                      <span className="text-[10px] font-extrabold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Default
                      </span>
                    )}
                  </div>

                  {/* Address Body */}
                  <div className="text-xs text-gray-600 space-y-1 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                    <p className="font-medium text-gray-800 leading-relaxed">
                      {[house, street].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-gray-500">
                      {[city, state].filter(Boolean).join(", ")}
                      {pin ? ` - ${pin}` : ""}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-gray-400" />
                    Verified Location
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Address Modal */}
      <AddNewAddressModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddAddress}
      />
    </div>
  );
}

