"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  Send,
  Camera,
  ArrowLeft,
  CheckCheck,
  Sparkles,
  Paperclip,
  Smile,
  ShieldCheck,
  Clock,
  MapPin,
  X,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "partner" | "system";
  text: string;
  time: string;
  image?: string;
  status?: "sent" | "delivered" | "read";
}

interface ChatBotPanelProps {
  booking: any;
  onClose: () => void;
}

const ChatBotPanel: React.FC<ChatBotPanelProps> = ({ booking, onClose }) => {
  const partnerName =
    booking?.service_provider?.name ||
    booking?.provider_name ||
    booking?.technician_name ||
    "Aadam Gabriel";

  const partnerImage =
    booking?.service_provider?.image ||
    booking?.provider_image ||
    "/pro.jpg";

  const partnerPhone =
    booking?.service_provider?.mobile ||
    booking?.customer_details?.phone ||
    "7447000045";

  const serviceTitle =
    booking?.service_details?.title ||
    booking?.title ||
    booking?.service ||
    "AC Repair & Service";

  const bookingId =
    booking?.booking?.booking_id ||
    booking?.booking_id ||
    booking?.id ||
    "BK-001";

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-1",
      sender: "system",
      text: `Chat session started for Booking #${bookingId} (${serviceTitle})`,
      time: "Today",
    },
    {
      id: "partner-1",
      sender: "partner",
      text: `Hello! I am ${partnerName}, your assigned TASpro service partner for ${serviceTitle}.`,
      time: "11:30 AM",
      status: "read",
    },
    {
      id: "partner-2",
      sender: "partner",
      text: "On my way! I have packed the required diagnostic tools and spare components.",
      image: "/way.jpg",
      time: "11:32 AM",
      status: "read",
    },
    {
      id: "partner-3",
      sender: "partner",
      text: "I will be at your doorstep within 15–20 minutes.",
      time: "11:33 AM",
      status: "read",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string, imageToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content && !imageToSend) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: content,
      image: imageToSend,
      time: formatCurrentTime(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend && !imageToSend) {
      setInput("");
    } else if (textToSend) {
      setInput("");
    }

    // Mark as delivered/read after a brief moment
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: "read" } : m))
      );
    }, 800);

    // Realistic automated partner response
    generatePartnerResponse(content || "photo");
  };

  const generatePartnerResponse = (userText: string) => {
    const lower = userText.toLowerCase();
    let reply = "Got it! Thanks for letting me know. I'm proceeding accordingly.";

    if (lower.includes("ok") || lower.includes("okay") || lower.includes("sure")) {
      reply = "Great! Let me know if you need any adjustments or special precautions before I arrive.";
    } else if (lower.includes("where") || lower.includes("location") || lower.includes("reach")) {
      reply = "I'm currently navigating through the main avenue and should arrive in about 10-15 minutes.";
    } else if (lower.includes("late") || lower.includes("delay") || lower.includes("time")) {
      reply = "Traffic is smooth on my route right now. I'm strictly adhering to the scheduled appointment window.";
    } else if (lower.includes("call") || lower.includes("phone")) {
      reply = `Sure thing! You can also tap the phone icon above to call me directly at ${partnerPhone}.`;
    } else if (lower.includes("photo") || lower.includes("image")) {
      reply = "Thanks for the photo! I've reviewed it and have the appropriate replacement materials ready.";
    } else if (lower.includes("price") || lower.includes("cost") || lower.includes("charge")) {
      reply = "The initial inspection and labor charges follow the exact pricing shown in your booking summary. Any extra parts will be quoted upfront!";
    }

    // Trigger typing state
    setTimeout(() => {
      setIsTyping(true);
    }, 600);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `prt-${Date.now()}`,
          sender: "partner",
          text: reply,
          time: formatCurrentTime(),
          status: "read",
        },
      ]);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleSend("Shared a photo", reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const quickReplies = [
    "Where are you now?",
    "Running a bit late?",
    "Please call me",
    "Address confirmed 👍",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-sm flex flex-col h-[calc(100vh-210px)] sm:h-[650px] min-h-[460px] max-h-[700px] overflow-hidden">
      {/* 1. Chat Header */}
      <div className="bg-white px-3 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200/70 hover:border-orange-200 text-gray-700 hover:text-[#FF6A00] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Back to Bookings"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="relative shrink-0">
            <img
              src={partnerImage}
              alt={partnerName}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-orange-200 shadow-2xs"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/pro.jpg";
              }}
            />
            {/* Green glowing online dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                {partnerName}
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Verified Pro</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
              <span>•</span>
              <span className="font-mono text-gray-400">#{bookingId}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline truncate">{serviceTitle}</span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${partnerPhone}`}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Call Technician"
          >
            <Phone className="w-3.5 h-3.5 fill-emerald-600" />
            <span className="hidden sm:inline">Call</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Chat Messages Body */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 bg-[#FAF9F6]/50">
        {messages.map((msg) => {
          if (msg.sender === "system") {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-[11px] font-medium text-gray-500 bg-white/90 border border-gray-200/80 px-3 py-1 rounded-full shadow-2xs">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <img
                  src={partnerImage}
                  alt={partnerName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-gray-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/pro.jpg";
                  }}
                />
              )}

              <div
                className={`max-w-[82%] sm:max-w-[70%] space-y-1 ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-3 sm:p-3.5 rounded-2xl shadow-2xs text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-r from-[#FF6A00] to-[#FF8533] text-white rounded-br-xs font-medium"
                      : "bg-white text-gray-800 rounded-bl-xs border border-gray-100 shadow-xs"
                  }`}
                >
                  {msg.image && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-black/10 max-w-[260px]">
                      <img
                        src={msg.image}
                        alt="attachment"
                        className="w-full h-auto object-cover max-h-52"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/way.jpg";
                        }}
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>

                {/* Timestamp & read status */}
                <div
                  className={`flex items-center gap-1 text-[10px] px-1 ${
                    isUser
                      ? "justify-end text-gray-400"
                      : "justify-start text-gray-400"
                  }`}
                >
                  <span>{msg.time}</span>
                  {isUser && (
                    <CheckCheck
                      className={`w-3.5 h-3.5 ${
                        msg.status === "read"
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 justify-start">
            <img
              src={partnerImage}
              alt={partnerName}
              className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-gray-200"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/pro.jpg";
              }}
            />
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-xs px-4 py-2.5 shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium text-gray-500 ml-1">
                {partnerName} is typing...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Quick Reply Suggestion Chips */}
      <div className="bg-white border-t border-gray-100 px-3 sm:px-4 py-2 flex items-center gap-1.5 overflow-x-auto hide-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FF6A00]" />
          Quick:
        </span>
        {quickReplies.map((qr) => (
          <button
            key={qr}
            type="button"
            onClick={() => handleSend(qr)}
            className="px-2.5 py-1 rounded-full bg-gray-50 hover:bg-orange-50 border border-gray-200/80 hover:border-orange-200 text-gray-700 hover:text-[#FF6A00] text-[11px] font-semibold whitespace-nowrap transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            {qr}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Box */}
      <div className="bg-white p-2.5 sm:p-3.5 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50/80 border border-gray-200 rounded-2xl px-2.5 sm:px-3 py-1.5 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-[#FF6A00] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Attach Photo"
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${partnerName}...`}
            className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 py-1"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs ${
              input.trim()
                ? "bg-[#FF6A00] hover:bg-[#F05A00] text-white scale-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed scale-95"
            }`}
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPanel;
