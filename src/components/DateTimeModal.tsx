"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Calendar,
  Clock,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
} from "lucide-react";

interface DateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (date: string, timeSlot: string, notes: string) => void;
}

const DEFAULT_SLOTS = [
  "09:00 AM",
  "09:45 AM",
  "10:30 AM",
  "11:15 AM",
  "12:00 PM",
  "12:45 PM",
  "01:30 PM",
  "02:15 PM",
  "03:00 PM",
  "03:45 PM",
  "04:30 PM",
];

const DateTimeModal = ({ isOpen, onClose, onContinue }: DateTimeModalProps) => {
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const formatDisplayDate = (date: Date) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const d = String(date.getDate()).padStart(2, "0");
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [windowStartDate, setWindowStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [dateObj, setDateObj] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(new Date()));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(windowStartDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [windowStartDate]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setWindowStartDate(now);
    setDateObj(now);
    setSelectedDate(formatDate(now));
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handlePrevWeek = () => {
    setWindowStartDate((prev) => {
      const prevWeek = new Date(prev);
      prevWeek.setDate(prevWeek.getDate() - 7);
      if (prevWeek < today) return new Date(today);
      return prevWeek;
    });
  };

  const handleNextWeek = () => {
    setWindowStartDate((prev) => {
      const nextWeek = new Date(prev);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    });
  };

  const isPrevDisabled = windowStartDate <= today;

  const isToday = (day: Date) => {
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (day: Date) => {
    return (
      day.getDate() === dateObj.getDate() &&
      day.getMonth() === dateObj.getMonth() &&
      day.getFullYear() === dateObj.getFullYear()
    );
  };

  const handleDateSelect = (day: Date) => {
    setDateObj(day);
    setSelectedDate(formatDate(day));
    setSelectedTimeSlot("");
    setError(null);
  };

  const handleContinue = () => {
    if (!selectedTimeSlot) {
      setError("Please select a time slot to continue.");
      return;
    }

    const activeDate = selectedDate || formatDate(new Date());
    onContinue(activeDate, selectedTimeSlot, specialNotes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[26px] sm:rounded-[28px] w-full max-w-[580px] p-5 sm:p-7 relative shadow-2xl my-auto animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Schedule Your Service
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Choose a convenient date and time for your service visit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Select Your Date */}
        <div className="mt-5 sm:mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <Calendar className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900">
                Select Your Date
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span>{formatMonthYear(windowStartDate)}</span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  disabled={isPrevDisabled}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                    isPrevDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                  }`}
                  aria-label="Previous week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Next week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 7-Day Horizontal Strip */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day, idx) => {
              const selected = isSelectedDate(day);
              const todayFlag = isToday(day);
              const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = day.getDate();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`flex flex-col items-center justify-between py-2 sm:py-2.5 px-0.5 sm:px-1.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                    selected
                      ? "border-orange-500 ring-1 ring-orange-500 bg-[#FFF9F5] shadow-xs"
                      : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/20"
                  }`}
                >
                  <span
                    className={`text-[11px] sm:text-xs font-semibold ${
                      selected ? "text-orange-600" : "text-gray-500"
                    }`}
                  >
                    {dayName}
                  </span>
                  <span
                    className={`text-base sm:text-xl font-bold my-0.5 ${
                      selected ? "text-orange-600" : "text-gray-900"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {todayFlag ? (
                    <span className="bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Today
                    </span>
                  ) : (
                    <span className="text-gray-400 text-[9px] sm:text-[10px] font-medium py-0.5">
                      Available
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Select Time Slot */}
        <div className="mt-5 sm:mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900">
                Select Time Slot <span className="text-orange-500">*</span>
              </span>
            </div>
            {selectedTimeSlot && (
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                Selected
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {DEFAULT_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setSelectedTimeSlot(slot);
                    setError(null);
                  }}
                  className={`flex items-center justify-center py-2.5 px-2 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "border-orange-500 ring-1 ring-orange-500 bg-[#FFF9F5] text-orange-600 font-bold shadow-2xs"
                      : "border-gray-200 bg-white text-gray-800 hover:border-orange-200 hover:bg-orange-50/20"
                  }`}
                >
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white mr-1.5 shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  <span>{slot}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Special Notes */}
        <div className="mt-5 sm:mt-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
              <Pencil className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <span className="text-sm sm:text-base font-bold text-gray-900">
              Special Notes{" "}
              <span className="text-gray-400 font-normal text-xs sm:text-sm">
                (Optional)
              </span>
            </span>
          </div>
          <textarea
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="Add any specific instructions or requirements here..."
            className="w-full bg-[#F9FAFB] hover:bg-white focus:bg-white border border-gray-200 focus:border-orange-400 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-800 outline-none resize-none h-20 placeholder:text-gray-400 transition-colors"
          />
        </div>

        {/* Validation Error Message */}
        {error && (
          <p className="text-red-500 text-xs font-semibold mt-3 text-center">
            {error}
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Summary Pill */}
          <div className="flex-1 bg-[#FFF9F5] border border-orange-100 rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between sm:justify-start gap-2 sm:gap-3 text-xs text-gray-700">
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>
                Date:{" "}
                <strong className="font-bold text-gray-900">
                  {formatDisplayDate(dateObj)}
                </strong>
              </span>
            </div>
            <div className="h-4 w-[1px] bg-orange-200 shrink-0" />
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>
                Time Slot:{" "}
                <strong className="font-bold text-gray-900">
                  {selectedTimeSlot || "--"}
                </strong>
              </span>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedTimeSlot}
            className={`px-7 py-3 rounded-2xl font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 ${
              !selectedTimeSlot
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-75"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-md cursor-pointer active:scale-[0.98]"
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeModal;
