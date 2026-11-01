"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import { API_BASE_URL as BASE_URL } from "@/config/api";

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}/faqs?type=User`, {
        headers: {
          Accept: "application/json",
        },
      });

      console.log("FAQ API Response:", response.data);

      if (response.data?.status) {
        setFaqs(response.data.data || []);
      } else {
        setFaqs([]);
      }
    } catch (error) {
      console.error("FAQ fetch error:", error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50/70 py-6 md:py-10">
      <div className="w-full 2xl:w-[85%] mx-auto px-4 sm:px-5">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs sm:shadow-sm p-6 sm:p-10 lg:p-12">
          {/* Heading */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Find answers to common questions about our services, booking process, payments, and policies.
            </p>
          </div>

          <div className="w-full space-y-4">
            {loading ? (
              <div className="py-12 text-center text-gray-500">
                <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p>Loading FAQs...</p>
              </div>
            ) : faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div
                  key={faq.id || index}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl px-5 sm:px-6 py-4 shadow-2xs hover:border-orange-200 transition-all bg-white dark:bg-gray-800"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-start justify-between gap-4 text-left cursor-pointer"
                  >
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white leading-6">
                      {faq.question}
                    </h3>

                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" />
                    )}
                  </button>

                  {openIndex === index && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div
                        className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-7"
                        dangerouslySetInnerHTML={{ __html: faq.answer || "" }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                No FAQs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
