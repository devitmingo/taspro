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
    <div className="min-h-screen py-8 md:py-12">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6 md:mb-8 leading-tight">
              Frequently Asked Questions
            </h1>

            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-7">
              Find answers to common questions about our services, booking
              process, payments, and policies.
            </p>
          </div>

          <div className="max-w-4xl space-y-4">
            {loading ? (
              <div className="text-gray-600 dark:text-gray-400">
                Loading FAQs...
              </div>
            ) : faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div
                  key={faq.id || index}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl px-4 sm:px-6 py-4 shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-start justify-between gap-4 text-left"
                  >
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white leading-6">
                      {faq.question}
                    </h3>

                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-700 dark:text-white flex-shrink-0 mt-1" />
                    )}
                  </button>

                  {openIndex === index && (
                    <div className="mt-4 pl-4 border-l-2 border-orange-300">
                      <div
                        className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-7"
                        dangerouslySetInnerHTML={{ __html: faq.answer || "" }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-600 dark:text-gray-400">
                No FAQs found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
