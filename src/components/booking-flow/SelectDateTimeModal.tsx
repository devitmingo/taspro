"use client";

import { CalendarDays, MapPin, X } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SelectDateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (
    date: string,
    time: string,
    notes: string,
    slotId?: number
  ) => void;
  showLocation?: boolean;
  location?: string;
  serviceId?: number | string;
}

const DEFAULT_SLOTS = [
  { id: 1, slot_time: "09:00 AM - 11:00 AM" },
  { id: 2, slot_time: "11:00 AM - 01:00 PM" },
  { id: 3, slot_time: "01:00 PM - 03:00 PM" },
  { id: 4, slot_time: "03:00 PM - 05:00 PM" },
  { id: 5, slot_time: "05:00 PM - 07:00 PM" },
  { id: 6, slot_time: "07:00 PM - 09:00 PM" },
];

export const SelectDateTimeModal: React.FC<SelectDateTimeModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  showLocation = false,
  location = "",
  serviceId = 1,
}) => {
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const [dateObj, setDateObj] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [timeSlots, setTimeSlots] = useState<any[]>(DEFAULT_SLOTS);
  const [slotLoading, setSlotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);

    // Ensure selectedDate is initialized
    if (!selectedDate) {
      const today = new Date();
      setDateObj(today);
      setSelectedDate(formatDate(today));
    }

    const locationData =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("selected_location") || "{}")
        : {};

    const fetchSlots = async () => {
      try {
        setSlotLoading(true);

        const res = await axios.get(`${API_BASE_URL}/slots`, {
          params: {
            service_id: serviceId,
            date: selectedDate || formatDate(new Date()),
            state_name: locationData.state_name || "Chhattisgarh",
            city_name: locationData.city_name || "Raipur",
          },
          headers: {
            Accept: "application/json",
          },
        });

        const fetched = res.data?.data;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setTimeSlots(fetched);
        } else {
          setTimeSlots(DEFAULT_SLOTS);
        }
      } catch (error: any) {
        setTimeSlots(DEFAULT_SLOTS);
      } finally {
        setSlotLoading(false);
      }
    };

    fetchSlots();
  }, [isOpen, selectedDate, serviceId]);

  const handleClose = () => {
    setShowCalendar(false);
    setError(null);
    onClose();
  };

  const handleContinue = () => {
    if (!selectedTime) {
      setError("Please select a time slot to continue.");
      return;
    }

    const activeDate = selectedDate || formatDate(new Date());
    const slotId = localStorage.getItem("selectedSlotId") || timeSlots.find((s) => s.slot_time === selectedTime)?.id || 1;

    onContinue(
      activeDate,
      selectedTime,
      notes,
      Number(slotId)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[28px] w-full max-w-md p-6 relative shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md z-[9999] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Date</h2>

        {/* Date Input Box */}
        <div className="mb-5 relative">
          <div
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full text-xs font-semibold bg-gray-100 px-4 py-3.5 rounded-xl outline-none pr-10 cursor-pointer flex items-center justify-between border border-gray-200 hover:border-orange-400 transition-all"
          >
            <span className="text-gray-800">{selectedDate || "Select Date"}</span>
            <CalendarDays className="w-4 h-4 text-orange-500" />
          </div>

          {showCalendar && (
            <div className="absolute top-14 left-0 z-50 bg-white p-2 rounded-2xl shadow-xl border border-gray-200">
              <DatePicker
                selected={dateObj}
                onChange={(date: Date | null) => {
                  if (date) {
                    setDateObj(date);
                    setSelectedDate(formatDate(date));
                    setSelectedTime("");
                    setError(null);
                  }
                  setShowCalendar(false);
                }}
                inline
                minDate={new Date()}
              />
            </div>
          )}
        </div>

        {/* Time Slot Title */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            Select Time Slot <span className="text-orange-500">*</span>
          </h2>
          {selectedTime && (
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
              Selected
            </span>
          )}
        </div>

        <div className="mb-4">
          {slotLoading ? (
            <div className="text-center py-4 text-xs font-semibold text-gray-500 animate-pulse">
              Loading available slots...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {timeSlots.map((slot: any) => {
                const isSelected = selectedTime === slot.slot_time;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setSelectedTime(slot.slot_time);
                      setError(null);
                      localStorage.setItem("selectedSlotId", String(slot.id));
                    }}
                    className={`py-3 px-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                      isSelected
                        ? "border-orange-500 bg-orange-50 text-orange-600 shadow-2xs ring-1 ring-orange-400"
                        : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {slot.slot_time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Validation Error Message */}
        {error && (
          <p className="text-red-500 text-xs font-semibold mb-4 text-center animate-shake">
            {error}
          </p>
        )}

        {showLocation && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Your Location</h2>
            <div className="relative mb-6">
              <div className="w-full text-xs bg-gray-100 px-4 py-3.5 rounded-xl pr-10 text-gray-700 font-medium border border-gray-200">
                {location || "No location found"}
              </div>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500">
                <MapPin className="w-4 h-4" />
              </span>
            </div>
          </>
        )}

        {/* Notes */}
        <h2 className="text-lg font-bold text-gray-900 mb-2">Special Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any specific instructions or requirements here..."
          className="w-full bg-gray-100 px-4 py-3 rounded-xl outline-none resize-none mb-6 h-24 text-xs font-medium text-gray-800 border border-gray-200 focus:border-orange-400"
        />

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedTime}
          className={`w-full py-3.5 rounded-full font-bold text-sm shadow-md transition-all ${
            !selectedTime
              ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-75"
              : "text-white hover:shadow-lg active:scale-98 cursor-pointer"
          }`}
          style={
            selectedTime
              ? {
                  background: "linear-gradient(90deg, #FF6B00, #FFA500)",
                }
              : {
                  background: "#E5E7EB",
                }
          }
        >
          Continue &rarr;
        </button>
      </div>
    </div>
  );
};
