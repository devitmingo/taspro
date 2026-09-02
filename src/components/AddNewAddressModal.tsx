"use client";

import { X, MapPin } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import MapPickerModal from "./MapPickerModal";

interface AddNewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    fullName: string;
    contactNumber: string;
    alternateNumber: string;
    postalCode: string;
    state: string;
    city: string;
    houseNo: string;
    location: string;
    roadLandmark: string;
    latitude?: number;
    longitude?: number;
    state_name?: string;
    city_name?: string;
  }) => void;
}

const AddNewAddressModal = ({
  isOpen,
  onClose,
  onSave,
}: AddNewAddressModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    alternateNumber: "",
    postalCode: "",
    state: "",
    city: "",
    houseNo: "",
    location: "",
    roadLandmark: "",
    latitude: 0,
    longitude: 0,
    state_name: "",
    city_name: "",
  });

  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (
      !formData.fullName ||
      !formData.contactNumber ||
      !formData.postalCode ||
      !formData.state ||
      !formData.city ||
      !formData.houseNo ||
      !formData.location
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#f97316",
      });
      return;
    }
    onSave(formData);
    // Reset form
    setFormData({
      fullName: "",
      contactNumber: "",
      alternateNumber: "",
      postalCode: "",
      state: "",
      city: "",
      houseNo: "",
      location: "",
      roadLandmark: "",
      latitude: 0,
      longitude: 0,
      state_name: "",
      city_name: "",
    });
  };

  if (!isOpen) return null;

  const states = ["Chhattisgarh", "Madhya Pradesh", "Maharashtra", "Delhi"];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className="max-h-[80vh] overflow-y-auto pr-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-1">
            Add New Address
          </h2>
          <p className="text-xs text-gray-500 mb-6 text-center">
            Please fill in all required details to add your address.
          </p>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Full Name <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-colors text-gray-900 text-sm bg-gray-50/50"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Contact Number <span className="text-orange-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-colors text-gray-900 text-sm bg-gray-50/50"
              />
            </div>

            {/* Alternate Number */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Alternate Number
              </label>
              <input
                type="tel"
                name="alternateNumber"
                value={formData.alternateNumber}
                onChange={handleChange}
                placeholder="Enter alternate number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-colors text-gray-900 text-sm bg-gray-50/50"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Postal Code <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900"
              />
            </div>

            {/* Location Input with Open Map */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Use my Location <span className="text-orange-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="text-[11px] font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  Open Map
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onClick={() => setShowMapPicker(true)}
                  placeholder="Click to drag pin on map"
                  className="w-full px-4 py-3 pr-10 bg-gray-50/50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900 cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Open Google Maps to drag pin point"
                >
                  <img src="/loc.png" alt="location" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* House No / Building */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                House / Flat / Building No <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                name="houseNo"
                value={formData.houseNo}
                onChange={handleChange}
                placeholder="Enter house / building number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-colors text-gray-900 text-sm bg-gray-50/50"
              />
            </div>

            {/* Road / Landmark */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Road / Area / Landmark
              </label>
              <input
                type="text"
                name="roadLandmark"
                value={formData.roadLandmark}
                onChange={handleChange}
                placeholder="Nearby landmark or area"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-colors text-gray-900 text-sm bg-gray-50/50"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                City <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900"
              />
            </div>

            {/* State */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                State <span className="text-orange-500">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-900"
              >
                <option value="">Select State</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-98"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Google Maps Picker Modal with Draggable Pin Point Marker */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLat={formData.latitude || 21.2514}
        initialLng={formData.longitude || 81.6296}
        onConfirm={(loc) => {
          setFormData((prev) => ({
            ...prev,
            latitude: loc.latitude,
            longitude: loc.longitude,
            location: loc.address,
            postalCode: loc.postalCode || prev.postalCode,
            city: loc.city || prev.city,
            state: loc.state || prev.state,
            city_name: loc.city,
            state_name: loc.state,
          }));
          localStorage.setItem(
            "user_location",
            JSON.stringify({
              latitude: loc.latitude,
              longitude: loc.longitude,
              address: loc.address,
              city: loc.city,
              state: loc.state,
            })
          );
          window.dispatchEvent(new Event("location-updated"));
        }}
      />
    </div>
  );
};

export default AddNewAddressModal;
