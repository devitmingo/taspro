"use client";

import { X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
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
    house_number?: string;
    houseNumber?: string;
    street?: string;
    [key: string]: any;
  }) => Promise<any> | void;
  initialData?: any;
}

const AddNewAddressModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddNewAddressModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    alternateNumber: "",
    postalCode: "",
    state: "Chhattisgarh",
    city: "Raipur",
    houseNo: "",
    location: "",
    roadLandmark: "",
    latitude: 21.2514,
    longitude: 81.6296,
    state_name: "Chhattisgarh",
    city_name: "Raipur",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    setErrors({});
    if (initialData) {
      setFormData({
        fullName: initialData.full_name || initialData.fullName || initialData.name || "",
        contactNumber: (initialData.contact_number || initialData.phone || initialData.contactNumber || "")
          .replace(/\D/g, "")
          .slice(-10),
        alternateNumber: (initialData.alt_contact_number || initialData.alternateNumber || initialData.altPhone || "")
          .replace(/\D/g, "")
          .slice(-10),
        postalCode: (initialData.postal_code || initialData.postalCode || initialData.pincode || "")
          .replace(/\D/g, "")
          .slice(0, 6),
        state: initialData.state?.name || initialData.state_name || initialData.state || "Chhattisgarh",
        city: initialData.city?.name || initialData.city_name || initialData.city || "Raipur",
        houseNo: initialData.house_number || initialData.houseNo || "",
        location: initialData.street || initialData.location || "",
        roadLandmark: initialData.roadLandmark || initialData.landmark || "",
        latitude: initialData.latitude || 21.2514,
        longitude: initialData.longitude || 81.6296,
        state_name: initialData.state?.name || initialData.state_name || initialData.state || "Chhattisgarh",
        city_name: initialData.city?.name || initialData.city_name || initialData.city || "Raipur",
      });
    } else {
      setFormData({
        fullName: "",
        contactNumber: "",
        alternateNumber: "",
        postalCode: "",
        state: "Chhattisgarh",
        city: "Raipur",
        houseNo: "",
        location: "",
        roadLandmark: "",
        latitude: 21.2514,
        longitude: 81.6296,
        state_name: "Chhattisgarh",
        city_name: "Raipur",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "contactNumber" | "alternateNumber"
  ) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, [field]: digitsOnly }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, postalCode: digitsOnly }));
    if (errors.postalCode) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.postalCode;
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (formData.contactNumber.length < 10) {
      newErrors.contactNumber = "Please enter a valid 10-digit contact number";
    }

    if (formData.alternateNumber.trim()) {
      if (formData.alternateNumber.length < 10) {
        newErrors.alternateNumber = "Alternate number must be 10 digits";
      } else if (formData.alternateNumber === formData.contactNumber) {
        newErrors.alternateNumber = "Alternate number must be different from contact number";
      }
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (formData.postalCode.length !== 6) {
      newErrors.postalCode = "Please enter a valid 6-digit postal code";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Service location is required";
    }

    if (!formData.houseNo.trim()) {
      newErrors.houseNo = "House / Flat / Building No is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const streetCombined =
        [formData.roadLandmark, formData.location].filter(Boolean).join(", ") ||
        formData.location ||
        formData.roadLandmark ||
        "";

      await onSave({
        ...formData,
        houseNo: formData.houseNo,
        house_number: formData.houseNo,
        houseNumber: formData.houseNo,
        street: streetCombined,
        roadLandmark: formData.roadLandmark,
        location: formData.location,
      });

      // Form is NOT wiped here. If parent succeeds, it will close the modal.
      // If parent fails, user input is safely preserved!
    } catch (err: any) {
      console.log("Error during address save:", err);
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        const fieldErrors: Record<string, string> = {};
        if (backendErrors.full_name) fieldErrors.fullName = backendErrors.full_name[0];
        if (backendErrors.contact_number) fieldErrors.contactNumber = backendErrors.contact_number[0];
        if (backendErrors.alt_contact_number) fieldErrors.alternateNumber = backendErrors.alt_contact_number[0];
        if (backendErrors.postal_code) fieldErrors.postalCode = backendErrors.postal_code[0];
        if (backendErrors.house_number) fieldErrors.houseNo = backendErrors.house_number[0];
        if (backendErrors.street) fieldErrors.location = backendErrors.street[0];
        if (backendErrors.city_name) fieldErrors.city = backendErrors.city_name[0];
        if (backendErrors.state_name) fieldErrors.state = backendErrors.state_name[0];
        if (Object.keys(fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          return;
        }
      }

      const msg = err?.response?.data?.message || err?.message || "";
      if (msg.toLowerCase().includes("contact number")) {
        setErrors((prev) => ({ ...prev, contactNumber: msg }));
      } else if (msg.toLowerCase().includes("house number")) {
        setErrors((prev) => ({ ...prev, houseNo: msg }));
      } else if (msg.toLowerCase().includes("postal") || msg.toLowerCase().includes("pin")) {
        setErrors((prev) => ({ ...prev, postalCode: msg }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const states = ["Chhattisgarh", "Madhya Pradesh", "Maharashtra", "Delhi"];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setErrors({});
            onClose();
          }}
          className="absolute -top-3 -right-3 w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md z-10 transition-colors cursor-pointer"
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
            {initialData ? "Edit Address" : "Add New Address"}
          </h2>
          <p className="text-xs text-gray-500 mb-6 text-center">
            {initialData
              ? "Update your address details."
              : "Please fill in all required details to add your address."}
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
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors text-gray-900 text-sm ${
                  errors.fullName
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                }`}
              />
              {errors.fullName && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.fullName}
                </p>
              )}
            </div>

            {/* Contact Number (Strictly max 10 digits, digits only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Contact Number <span className="text-orange-500">*</span>
                </label>
                <span className="text-[10px] text-gray-400 font-medium">
                  {formData.contactNumber.length}/10 digits
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                name="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => handlePhoneChange(e, "contactNumber")}
                placeholder="10-digit contact number"
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors text-gray-900 text-sm ${
                  errors.contactNumber
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                }`}
              />
              {errors.contactNumber && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.contactNumber}
                </p>
              )}
            </div>

            {/* Alternate Number (Strictly max 10 digits, digits only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Alternate Number
                </label>
                {formData.alternateNumber && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    {formData.alternateNumber.length}/10 digits
                  </span>
                )}
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                name="alternateNumber"
                value={formData.alternateNumber}
                onChange={(e) => handlePhoneChange(e, "alternateNumber")}
                placeholder="Enter alternate number (optional)"
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors text-gray-900 text-sm ${
                  errors.alternateNumber
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                }`}
              />
              {errors.alternateNumber && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.alternateNumber}
                </p>
              )}
            </div>

            {/* Postal Code (Strictly max 6 digits, digits only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Postal Code <span className="text-orange-500">*</span>
                </label>
                <span className="text-[10px] text-gray-400 font-medium">
                  {formData.postalCode.length}/6 digits
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                name="postalCode"
                value={formData.postalCode}
                onChange={handlePostalCodeChange}
                placeholder="Enter 6-digit postal code"
                className={`w-full px-4 py-3 border rounded-xl outline-none text-sm text-gray-900 transition-colors ${
                  errors.postalCode
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                }`}
              />
              {errors.postalCode && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.postalCode}
                </p>
              )}
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
                  className="text-[11px] font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
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
                  className={`w-full px-4 py-3 pr-10 border rounded-xl outline-none text-sm text-gray-900 cursor-pointer transition-colors ${
                    errors.location
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                      : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                  title="Open Google Maps to drag pin point"
                >
                  <img src="/loc.png" alt="location" className="w-5 h-5" />
                </button>
              </div>
              {errors.location && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.location}
                </p>
              )}
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
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors text-gray-900 text-sm ${
                  errors.houseNo
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                }`}
              />
              {errors.houseNo && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.houseNo}
                </p>
              )}
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
                className={`w-full px-4 py-3 border rounded-xl outline-none text-sm text-gray-900 transition-colors ${
                  errors.city
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                }`}
              />
              {errors.city && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.city}
                </p>
              )}
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
                className={`w-full px-4 py-3 border rounded-xl outline-none text-sm text-gray-900 transition-colors ${
                  errors.state
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                }`}
              >
                <option value="">Select State</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.state}
                </p>
              )}
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Address...</span>
                </>
              ) : (
                initialData ? "Update Address" : "Save Address"
              )}
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
            postalCode: (loc.postalCode || prev.postalCode).replace(/\D/g, "").slice(0, 6),
            city: loc.city || prev.city,
            state: loc.state || prev.state,
            city_name: loc.city,
            state_name: loc.state,
          }));
          setErrors((prev) => {
            const next = { ...prev };
            delete next.location;
            delete next.postalCode;
            delete next.city;
            delete next.state;
            return next;
          });
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
