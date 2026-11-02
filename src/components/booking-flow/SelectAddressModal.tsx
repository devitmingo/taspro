"use client";

import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

interface Address {
  id: string | number;
  full_name?: string;
  name?: string;
  contact_number?: string;
  phone?: string;
  house_number?: string;
  houseNo?: string;
  street?: string;
  type?: string;
  city?: any;
  state?: any;
  city_name?: string;
  state_name?: string;
  postal_code?: string;
  pincode?: string;
}

interface SelectAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (address: any) => void;
  onAddNew: () => void;
  addresses: any[];
  onEdit?: (address: any) => void;
  onDelete?: (addressId: string | number) => void;
  onRefresh?: () => void;
}

export const SelectAddressModal: React.FC<SelectAddressModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  onAddNew,
  addresses,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addressList, setAddressList] = useState<any[]>(addresses || []);

  useEffect(() => {
    setAddressList(addresses || []);
    if (addresses?.length > 0 && !selectedId) {
      setSelectedId(String(addresses[0].id));
    }
  }, [addresses]);

  if (!isOpen) return null;

  const handleContinue = () => {
    const selected = addressList.find((a) => String(a.id) === selectedId);
    if (selected) onContinue(selected);
  };

  const handleEdit = (address: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(address);
    }
  };

  const handleDelete = async (address: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Delete Address?",
      text: "Are you sure you want to delete this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      try {
        await axios.delete(`${API_BASE_URL}/customers/customer-addresses/${address.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        setAddressList((prev) => prev.filter((a) => String(a.id) !== String(address.id)));
        if (selectedId === String(address.id)) {
          setSelectedId(null);
        }

        if (onDelete) onDelete(address.id);
        if (onRefresh) onRefresh();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Address deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.log("Delete address error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Failed to delete address.",
          confirmButtonColor: "#f97316",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[28px] w-full max-w-lg p-6 relative shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Address</h3>

        {/* Address List */}
        <div
          className="space-y-3.5 mb-5 max-h-[380px] overflow-y-auto pr-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {addressList?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No saved addresses found. Please add a new address.
            </p>
          ) : (
            addressList?.map((address) => {
              const isSelected = selectedId === String(address.id);
              return (
                <div
                  key={address.id}
                  onClick={() => setSelectedId(String(address.id))}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? "border-orange-500 bg-orange-50/20 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {/* Left: Radio Button */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isSelected ? "border-orange-500" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                      )}
                    </div>

                    {/* Middle: Address Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {address.full_name || address.name}
                        </p>

                        <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                          {address.type || "Home"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 leading-snug break-words">
                        {[
                          address.house_number || address.houseNo,
                          address.street || address.location,
                          address.city?.name || address.city_name || address.city,
                          address.state?.name || address.state_name || address.state,
                          address.postal_code || address.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {address.contact_number || address.phone}
                      </p>
                    </div>
                  </div>

                  {/* Right: Action Buttons (Icons Only) */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={(e) => handleEdit(address, e)}
                      className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Address"
                      aria-label="Edit Address"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(address, e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Address"
                      aria-label="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New */}
        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm mb-6 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add a new address
        </button>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedId}
          className="w-full py-3 rounded-full text-white font-semibold cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: selectedId
              ? "linear-gradient(90deg, #FF6B00, #FFA500)"
              : "#D1D5DB",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
