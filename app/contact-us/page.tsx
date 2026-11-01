"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

interface ContactData {
  heading: string;
  description: string;
  chat_title: string;
  email_desc: string;
  email: string;
  phone_title: string;
  phone_timing: string;
  phone: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  threads?: string;
  content?: string;
}

const defaultData: ContactData = {
  heading: "Contact Us",
  description:
    "We're here to assist you! If you have any questions, concerns, or need further assistance, please don't hesitate to reach out to us. Our dedicated support team is ready to help and provide the guidance you need.",
  chat_title: "Chat to us",
  email_desc: "Our friendly team is here to help.",
  email: "info@tascompany.in",
  phone_title: "Phone",
  phone_timing: "Mon – Sat from 8am to 8pm",
  phone: "7447-0000-45",
  address: "Office No. 201, Atlantis Corporate Park Ring Road No.1, Telebandha, Raipur Chhattisgarh (22) 492001",
  facebook: "",
  twitter: "",
  linkedin: "",
  instagram: "",
  threads: "",
  content: "",
};

export default function ContactPage() {
  const [contact, setContact] = useState<ContactData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchContactData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/contact-us`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (res.data?.status && res.data?.data) {
          setContact((prev) => ({
            ...prev,
            ...res.data.data,
          }));
        }
      } catch (err) {
        try {
          const res = await axios.get(`${API_BASE_URL}/customer-policies`, {
            headers: {
              Accept: "application/json",
            },
          });
          if (res.data?.status && res.data?.data?.contact_us) {
            setContact((prev) => ({
              ...prev,
              ...res.data.data.contact_us,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch contact details:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50/70 py-6 md:py-10">
      <div className="w-full 2xl:w-[85%] mx-auto px-4 sm:px-5">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs sm:shadow-sm p-6 sm:p-10 lg:p-12">
          {/* HEADER */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {contact.heading || "Contact Us"}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 leading-relaxed whitespace-pre-line">
              {contact.description}
            </p>
          </div>

          {/* CONTACT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
            {/* CHAT CARD */}
            <div className="h-full p-5 sm:p-6 flex gap-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
              <div className="min-w-10 w-10 h-10 rounded-xl bg-[#FEECE7] flex items-center justify-center shrink-0">
                <img
                  src="/message.png"
                  alt="chat"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                  {contact.chat_title || "Chat to us"}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {contact.email_desc || "Our friendly team is here to help."}
                </p>

                <a
                  href={`mailto:${contact.email}`}
                  className="block text-sm sm:text-base text-gray-900 dark:text-white mt-3 font-medium break-words hover:text-orange-500 transition-colors"
                >
                  {contact.email}
                </a>
              </div>
            </div>

            {/* PHONE CARD */}
            <div className="h-full p-5 sm:p-6 flex gap-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
              <div className="min-w-10 w-10 h-10 rounded-xl bg-[#FEECE7] flex items-center justify-center shrink-0">
                <img
                  src="/phone.png"
                  alt="phone"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                  {contact.phone_title || "Phone"}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {contact.phone_timing || "Mon – Sat from 8am to 8pm"}
                </p>

                <a
                  href={`tel:${contact.phone?.replace(/[^0-9+]/g, "")}`}
                  className="block text-sm sm:text-base text-gray-900 dark:text-white mt-3 font-medium hover:text-orange-500 transition-colors"
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          </div>

          {/* OFFICE ADDRESS */}
          {contact.address && (
            <div className="mb-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2">
                Registered Office
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {contact.address}
              </p>
            </div>
          )}

          {/* SOCIAL SECTION */}
          <div className="p-5 sm:p-6 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Social Links
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Follow us on social media
            </p>

            <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
              <a
                href={contact.facebook || "#"}
                target={contact.facebook ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={!contact.facebook ? "pointer-events-none opacity-80" : ""}
              >
                <img
                  src="/facebook.png"
                  alt="facebook"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer hover:scale-110 transition"
                />
              </a>

              <a
                href={contact.twitter || "#"}
                target={contact.twitter ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label="Twitter"
                className={!contact.twitter ? "pointer-events-none opacity-80" : ""}
              >
                <img
                  src="/twitter2.png"
                  alt="twitter"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer hover:scale-110 transition"
                />
              </a>

              <a
                href={contact.linkedin || "#"}
                target={contact.linkedin ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={!contact.linkedin ? "pointer-events-none opacity-80" : ""}
              >
                <img
                  src="/linkedin.png"
                  alt="linkedin"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer hover:scale-110 transition"
                />
              </a>

              <a
                href={contact.instagram || "#"}
                target={contact.instagram ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={!contact.instagram ? "pointer-events-none opacity-80" : ""}
              >
                <img
                  src="/instagram.png"
                  alt="instagram"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer hover:scale-110 transition"
                />
              </a>

              <a
                href={contact.threads || "#"}
                target={contact.threads ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label="Threads"
                className={!contact.threads ? "pointer-events-none opacity-80" : ""}
              >
                <img
                  src="/threat.png"
                  alt="threads"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer hover:scale-110 transition"
                />
              </a>
            </div>
          </div>

          {/* ADDITIONAL CUSTOM CONTENT */}
          {contact.content && (
            <div
              className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-8"
              dangerouslySetInnerHTML={{ __html: contact.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
