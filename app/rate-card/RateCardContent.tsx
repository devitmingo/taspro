"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export interface RateCartItem {
  id?: number;
  service_id: number;
  service_category_id?: number | null;
  service_sub_category_id?: number | null;
  service_sub_category?: { id: number; name: string } | null;
  description: string;
  unit_price: number | string;
  cgst_percentage: number;
  sgst_percentage: number;
  total_amount: number | string;
  discount_percentage: number;
  actual_amount: number | string;
  waranty_days: number;
  is_active?: number;
}

const formatPrice = (val: any) => {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "string" && val.startsWith("₹")) return val;
  const num = parseFloat(val);
  return isNaN(num) ? String(val) : `₹${Math.round(num)}`;
};

const RateCardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams?.get("service_id") ?? "";

  const [rateData, setRateData] = useState<RateCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openElectrical, setOpenElectrical] = useState(true);
  const [openSpare, setOpenSpare] = useState(true);

  useEffect(() => {
    const fetchRateCard = async () => {
      setLoading(true);
      try {
        const queryParam = serviceId ? `?service_id=${serviceId}` : "";
        const res = await fetch(`${API_BASE_URL}/rate-carts${queryParam}`, {
          headers: { accept: "application/json" },
        });

        const json = await res.json();
        if (json?.status && Array.isArray(json?.data)) {
          setRateData(json.data);
        } else {
          setRateData([]);
        }
      } catch (error) {
        console.error("RATE CARD FETCH ERROR:", error);
        setRateData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRateCard();
  }, [serviceId]);

  // Split dynamic backend items into Electrical Parts (Service Charges) and Spare Parts
  const { electricalParts, spareParts } = useMemo(() => {
    const electrical: RateCartItem[] = [];
    const spare: RateCartItem[] = [];

    rateData.forEach((item) => {
      const desc = item.description || "";
      const hasSubCat = item.service_sub_category_id !== null && item.service_sub_category_id !== undefined;
      const isGas = desc.toLowerCase().startsWith("gas");
      const isServiceDesc = /repair|service|cleaning|installation|leakage/i.test(desc);

      if (hasSubCat || isGas || (isServiceDesc && !/motor|blower|pcb|fan|compressor|capacitor|pipe/i.test(desc))) {
        electrical.push(item);
      } else {
        spare.push(item);
      }
    });

    return { electricalParts: electrical, spareParts: spare };
  }, [rateData]);

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center relative mb-6">
          <button
            onClick={() => router.back()}
            className="absolute left-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeft size={22} className="text-gray-800" />
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rate Card</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm">Loading rate card details from server...</p>
          </div>
        ) : rateData.length === 0 ? (
          <div className="border border-gray-200 rounded-2xl p-10 text-center bg-white shadow-sm space-y-3">
            <p className="text-gray-600 font-medium text-base">No rate card records found.</p>
            <p className="text-gray-400 text-xs">
              Please ensure the database seeder has been executed on the backend server.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Electrical Parts / Service Charges Accordion */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <button
                onClick={() => setOpenElectrical(!openElectrical)}
                className="w-full bg-black text-white px-5 py-4 flex justify-between items-center transition-colors hover:bg-neutral-900"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold">Electrical Parts</h2>
                  <span className="text-xs bg-neutral-800 text-gray-300 px-2 py-0.5 rounded-full">
                    {electricalParts.length}
                  </span>
                </div>
                <ChevronDown
                  className={`transition-transform duration-300 ${openElectrical ? "rotate-180" : ""}`}
                />
              </button>

              {openElectrical && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3.5 font-semibold text-gray-700">Description</th>
                        <th className="text-right px-4 py-3.5 font-semibold text-gray-700 w-36 sm:w-44">
                          Service Charge
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {electricalParts.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                            No electrical parts or service charges available.
                          </td>
                        </tr>
                      ) : (
                        electricalParts.map((item: RateCartItem, index: number) => {
                          const actual = formatPrice(item.actual_amount);
                          const finalPrice = formatPrice(item.total_amount);
                          const subName = item.service_sub_category?.name;

                          return (
                            <tr key={item.id ?? index} className="hover:bg-gray-50/70 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-medium text-gray-900">{item.description}</span>
                                  {subName && (
                                    <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                                      {subName}
                                    </span>
                                  )}
                                  {!subName && item.description?.toLowerCase().startsWith("gas") && (
                                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                                      Gas Refill
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-3.5 text-right">
                                {actual && actual !== finalPrice && (
                                  <p className="text-gray-400 line-through text-xs">{actual}</p>
                                )}
                                <p className="font-bold text-gray-900 text-sm sm:text-base">{finalPrice}</p>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Spare Parts Accordion */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <button
                onClick={() => setOpenSpare(!openSpare)}
                className="w-full bg-black text-white px-5 py-4 flex justify-between items-center transition-colors hover:bg-neutral-900"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold">Spare Parts</h2>
                  <span className="text-xs bg-neutral-800 text-gray-300 px-2 py-0.5 rounded-full">
                    {spareParts.length}
                  </span>
                </div>
                <ChevronDown
                  className={`transition-transform duration-300 ${openSpare ? "rotate-180" : ""}`}
                />
              </button>

              {openSpare && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3.5 font-semibold text-gray-700">Part Name</th>
                        <th className="text-center px-4 py-3.5 font-semibold text-gray-700 w-32 sm:w-36">Price</th>
                        <th className="text-right px-4 py-3.5 font-semibold text-gray-700 w-32 sm:w-40">Warranty</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {spareParts.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                            No spare parts available.
                          </td>
                        </tr>
                      ) : (
                        spareParts.map((item: RateCartItem, index: number) => {
                          const actual = formatPrice(item.actual_amount);
                          const finalPrice = formatPrice(item.total_amount);
                          const warranty = item.waranty_days
                            ? `${item.waranty_days} Days Warranty`
                            : "30 Days Warranty";

                          return (
                            <tr key={item.id ?? index} className="hover:bg-gray-50/70 transition-colors">
                              <td className="px-4 py-3.5 font-medium text-gray-900">{item.description}</td>

                              <td className="px-4 py-3.5 text-center">
                                {actual && actual !== finalPrice && (
                                  <p className="text-gray-400 line-through text-xs">{actual}</p>
                                )}
                                <p className="font-bold text-gray-900 text-sm sm:text-base">{finalPrice}</p>
                              </td>

                              <td className="px-4 py-3.5 text-right">
                                <span className="inline-block text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                                  {warranty}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-xs sm:text-sm text-gray-700 space-y-1">
              <p className="font-semibold text-red-600">
                Note: Given Amount is Single Unit/Seat/PCs. Amount
              </p>
              <p className="text-gray-600 text-xs">
                * Prices are inclusive of GST. Additional charges may apply for customized or non-standard work.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RateCardContent;
