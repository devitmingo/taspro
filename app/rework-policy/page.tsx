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
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-8">
            Rework Policy
          </h1>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading rework policy...</div>
          ) : reworkPolicy ? (
            <div
              className="
                prose
                prose-lg
                max-w-none
                text-gray-700
                dark:text-gray-300
                leading-8
                [&_h1]:text-4xl
                [&_h1]:font-bold
                [&_h1]:mb-6
                [&_h2]:text-3xl
                [&_h2]:font-semibold
                [&_h2]:mt-8
                [&_h2]:mb-4
                [&_h3]:text-2xl
                [&_h3]:font-medium
                [&_h3]:mt-6
                [&_h3]:mb-3
                [&_p]:mb-4
                [&_ul]:list-disc
                [&_ul]:pl-6
                [&_ol]:list-decimal
                [&_ol]:pl-6
                [&_li]:mb-2
              "
              dangerouslySetInnerHTML={{
                __html: reworkPolicy,
              }}
            />
          ) : (
            <p className="text-gray-500">No policy content available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReworkPolicyPage;
