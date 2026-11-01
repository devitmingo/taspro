"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const ReworkPolicyPage = () => {
  const [reworkPolicy, setReworkPolicy] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customer-policies`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (res.data?.status) {
        setReworkPolicy(res.data?.data?.rework_policy || "");
      }
    } catch (error) {
      console.error("Rework Policy Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50/70 py-6 md:py-10">
      <div className="w-full 2xl:w-[85%] mx-auto px-4 sm:px-5">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs sm:shadow-sm p-6 sm:p-10 lg:p-12">
          {/* Heading */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Rework Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Our 100% satisfaction assurance — complimentary rework guidelines and eligibility.
            </p>
          </div>

          <div className="w-full">
            {loading ? (
              <div className="py-12 text-center text-gray-500">
                <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p>Loading rework policy...</p>
              </div>
            ) : reworkPolicy ? (
              <div
                className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-8
                  [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 dark:[&_h1]:text-white [&_h1]:mb-6
                  [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-4
                  [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-gray-800 dark:[&_h3]:text-gray-200 [&_h3]:mt-6 [&_h3]:mb-3
                  [&_p]:mb-4 [&_p]:leading-7
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2
                  [&_li]:text-gray-700 dark:[&_li]:text-gray-300 [&_li]:leading-7"
                dangerouslySetInnerHTML={{
                  __html: reworkPolicy,
                }}
              />
            ) : (
              <p className="text-gray-500 py-6">No rework policy content available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReworkPolicyPage;
