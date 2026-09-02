"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import LayoutContainer from "./LayoutContainer";

interface ServiceItem {
  id: number | string;
  name: string;
  slug?: string;
  category_name?: string;
  service_category_id?: number;
}

interface ServicesSectionProps {
  data?: ServiceItem[];
  dashboardData?: any;
}

const getRouteSlug = (nameOrSlug: string, categoryId?: number) => {
  if (!nameOrSlug) return "ac-repair";
  const lower = nameOrSlug.toLowerCase();
  
  if (lower.includes("ac")) return "ac-repair";
  if (lower.includes("washing")) return "washing-repair";
  if (lower.includes("geyser")) return "geyser-repair";
  if (lower.includes("gas")) return "gas-stove-repair";
  if (lower.includes("water cooler")) return "water-cooler-repair";
  if (lower.includes("chimney")) return "chimney-repair";
  if (lower.includes("refrigerator")) return "refrigerator-repair";
  if (lower.includes("microwave")) return "microwave-repair";
  if (lower.includes("water purifier")) return "water-purifier-repair";
  if (lower.includes("tv")) return "tv-repair";
  if (lower.includes("computer")) return "computer-repair";
  if (lower.includes("deep") || lower.includes("home cleaning")) return "deep-cleaning";
  if (lower.includes("bathroom")) return "bathroom-cleaning";
  if (lower.includes("electric")) return "electrician";
  if (lower.includes("plumber")) return "plumber";
  if (lower.includes("handyman") || lower.includes("carpenter")) return "handyman";
  if (lower.includes("pest")) return "pest-control";
  if (lower.includes("cleaning package")) return "cleaning-packages";
  if (lower.includes("amc")) return "amc-services";

  return nameOrSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

// Default fallback services if API has not responded or has missing categories
const DEFAULT_APPLIANCE_SERVICES: ServiceItem[] = [
  { id: 1, name: "AC Repair Service", slug: "ac-repair" },
  { id: 2, name: "Washing Machine Repair", slug: "washing-repair" },
  { id: 3, name: "Refrigerator Repair", slug: "refrigerator-repair" },
  { id: 4, name: "Geyser Repair", slug: "geyser-repair" },
  { id: 5, name: "Gas Stove Repair", slug: "gas-stove-repair" },
  { id: 6, name: "Water Cooler Repair", slug: "water-cooler-repair" },
  { id: 7, name: "Kitchen Chimney Repair", slug: "chimney-repair" },
  { id: 8, name: "Microwave Oven Repair", slug: "microwave-repair" },
  { id: 9, name: "Water Purifier Repair", slug: "water-purifier-repair" },
  { id: 10, name: "TV & Fan Repair", slug: "tv-repair" },
  { id: 11, name: "Computer Repair", slug: "computer-repair" },
];

const DEFAULT_CLEANING_SERVICES: ServiceItem[] = [
  { id: 12, name: "Full Home Deep Cleaning", slug: "deep-cleaning" },
  { id: 13, name: "Bathroom Cleaning", slug: "bathroom-cleaning" },
  { id: 14, name: "Kitchen Deep Cleaning", slug: "deep-cleaning" },
  { id: 15, name: "Sofa & Carpet Cleaning", slug: "deep-cleaning" },
  { id: 16, name: "Office Deep Cleaning", slug: "deep-cleaning" },
  { id: 17, name: "Water Tank Cleaning", slug: "deep-cleaning" },
  { id: 18, name: "Electrician Service", slug: "electrician" },
  { id: 19, name: "Plumber Service", slug: "plumber" },
  { id: 20, name: "Carpenter Service", slug: "handyman" },
  { id: 21, name: "House Painter", slug: "handyman" },
];

const DEFAULT_CONSTRUCTION_SERVICES: ServiceItem[] = [
  { id: 22, name: "Home Renovation & Remodeling", slug: "handyman" },
  { id: 23, name: "Bathroom Renovation & Remodeling", slug: "bathroom-cleaning" },
  { id: 24, name: "Painting & Plumbing Contractor", slug: "plumber" },
  { id: 25, name: "Electrical Contractor", slug: "electrician" },
  { id: 26, name: "Water Proofing & Pest Control", slug: "pest-control" },
];

const DEFAULT_AMC_SERVICES: ServiceItem[] = [
  { id: 27, name: "Air Conditioner (AC) AMC", slug: "amc-services" },
  { id: 28, name: "Water Purifier (RO) AMC", slug: "amc-services" },
  { id: 29, name: "Kitchen Chimney AMC", slug: "amc-services" },
];

const DEFAULT_PACKAGES: ServiceItem[] = [
  { id: 30, name: "Bathroom Cleaning Package", slug: "cleaning-packages" },
  { id: 31, name: "Water Tank Cleaning Package", slug: "cleaning-packages" },
  { id: 32, name: "Sofa Cleaning Package", slug: "cleaning-packages" },
  { id: 33, name: "Premium Cleaning Package", slug: "cleaning-packages" },
];

export default function ServicesSection({ data, dashboardData }: ServicesSectionProps) {
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [cityName, setCityName] = useState("Raipur");
  const [stateName, setStateName] = useState("Chhattisgarh");

  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem("selected_location");
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed.city) setCityName(parsed.city);
        if (parsed.state) setStateName(parsed.state);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setServicesList(data);
      return;
    }

    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/services`, {
          params: {
            state_name: stateName,
            city_name: cityName,
          },
        });
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setServicesList(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic services for footer section", err);
      }
    };

    fetchServices();
  }, [data, cityName, stateName]);

  if (!servicesList || servicesList.length === 0) return null;

  const appliances = servicesList.filter((s) => {
    const l = (s.name || "").toLowerCase();
    return (
      l.includes("ac") ||
      l.includes("wash") ||
      l.includes("refrig") ||
      l.includes("geyser") ||
      l.includes("stove") ||
      l.includes("cooler") ||
      l.includes("chimney") ||
      l.includes("microwave") ||
      l.includes("purifier") ||
      l.includes("tv") ||
      l.includes("computer") ||
      s.service_category_id === 1
    );
  });

  const appliancesFinal = appliances;

  const deepCleaning = servicesList.filter((s) => {
    const l = (s.name || "").toLowerCase();
    return (
      l.includes("clean") ||
      l.includes("bath") ||
      l.includes("sofa") ||
      l.includes("electric") ||
      l.includes("plumb") ||
      l.includes("carpenter") ||
      s.service_category_id === 2
    );
  });

  const cleaningFinal = deepCleaning;

  const renderServiceLinks = (items: ServiceItem[]) => {
    return items.map((item, index) => {
      const slug = getRouteSlug(item.slug || item.name, item.service_category_id);
      const url = slug === "amc-services" ? "/amc-services" : `/service/${slug}?service_id=${item.id}`;
      return (
        <span key={item.id || index} className="inline-flex items-center">
          <Link
            href={url}
            className="hover:text-orange-600 hover:underline transition-colors cursor-pointer font-normal text-gray-600 text-xs sm:text-sm"
          >
            {item.name}
          </Link>
          {index < items.length - 1 && <span className="mx-1.5 text-gray-400 font-light">|</span>}
        </span>
      );
    });
  };

  return (
    <>
      <section className="py-10 sm:py-12 bg-[#EBEBEB] border-t border-gray-200 mt-6 sm:mt-10">
        <LayoutContainer>
          <div className="space-y-6">
            {/* SECTION 1: On-demand Services */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                On-demand Services we offer in {cityName} {stateName}
              </h3>

              {/* Appliances Repair & Service */}
              <div className="mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Appliances Repair & Service
                </h4>
                <div className="text-xs sm:text-sm leading-relaxed flex flex-wrap items-center gap-y-1">
                  {renderServiceLinks(appliancesFinal)}
                </div>
              </div>

              {/* Deep Cleaning Services */}
              <div className="mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Deep Cleaning Services
                </h4>
                <div className="text-xs sm:text-sm leading-relaxed flex flex-wrap items-center gap-y-1">
                  {renderServiceLinks(cleaningFinal)}
                </div>
              </div>

              {/* Construction & Remodeling */}
              <div className="mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Construction & Remodeling
                </h4>
                <div className="text-xs sm:text-sm leading-relaxed flex flex-wrap items-center gap-y-1">
                  {renderServiceLinks(DEFAULT_CONSTRUCTION_SERVICES)}
                </div>
              </div>
            </div>

            {/* SECTION 2: AMC Services */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                AMC Services we offer in {cityName} {stateName}
              </h3>

              {/* Annual Maintenance Contract (AMC) */}
              <div className="mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Annual Maintenance Contract (AMC)
                </h4>
                <div className="text-xs sm:text-sm leading-relaxed flex flex-wrap items-center gap-y-1">
                  {renderServiceLinks(DEFAULT_AMC_SERVICES)}
                </div>
              </div>

              {/* Cleaning Packages */}
              <div className="mb-2">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Cleaning Packages
                </h4>
                <div className="text-xs sm:text-sm leading-relaxed flex flex-wrap items-center gap-y-1">
                  {renderServiceLinks(DEFAULT_PACKAGES)}
                </div>
              </div>
            </div>
          </div>
        </LayoutContainer>
      </section>

      <section className="py-2.5 bg-white border-t border-gray-200">
        <LayoutContainer>
          <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-1.5">
            <span className="font-semibold text-gray-900">Serving Cities :</span>
            {["Raipur", "New Raipur", "Durg", "Bhilai", "Korba", "Raigarh", "Kanker"].map((city, idx, arr) => (
              <span key={city} className="inline-flex items-center">
                <span className="hover:text-orange-600 transition-colors cursor-pointer text-gray-700">{city}</span>
                {idx < arr.length - 1 && <span className="ml-1.5 text-gray-400">|</span>}
              </span>
            ))}
          </div>
        </LayoutContainer>
      </section>
    </>
  );
}
