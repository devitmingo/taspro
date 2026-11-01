"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const OnDemandServices = () => {
  const [cityName, setCityName] = useState("Raipur");
  const [stateName, setStateName] = useState("Chhattisgarh");
  const [servingCities, setServingCities] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem("selected_location");
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed.city) setCityName(parsed.city);
        if (parsed.state) setStateName(parsed.state);
      }
    } catch (e) {}

    const handleLocationChange = (e: any) => {
      if (e.detail) {
        if (e.detail.city) setCityName(e.detail.city);
        if (e.detail.state) setStateName(e.detail.state);
      }
    };
    window.addEventListener("location-changed", handleLocationChange);

    const fetchCities = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/cities`);
        if (res.data?.status && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setServingCities(res.data.data);
        }
      } catch (err) {}
    };
    fetchCities();

    return () => window.removeEventListener("location-changed", handleLocationChange);
  }, []);

  const handleCitySelect = (cityItem: any) => {
    const targetCity = typeof cityItem === "string" ? cityItem : cityItem.name;
    const targetState = typeof cityItem === "string" ? "Chhattisgarh" : (cityItem.state?.name || cityItem.state || "Chhattisgarh");
    const locationData = {
      city: targetCity,
      state: targetState,
      city_id: typeof cityItem === "object" ? cityItem.id : undefined,
      state_id: typeof cityItem === "object" ? cityItem.state_id : undefined,
      isManual: true,
    };
    localStorage.setItem("selected_location", JSON.stringify(locationData));
    setCityName(targetCity);
    setStateName(targetState);
    window.dispatchEvent(
      new CustomEvent("location-changed", { detail: locationData })
    );
  };

  return (
    <section className="py-8 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-1 gap-6">
          {/* Cleaning Packages */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Cleaning Packages</h3>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <a href="/service/bathroom-cleaning" className="hover:text-orange-500 transition-colors">Bathroom Cleaning Package</a>
              <span>|</span>
              <a href="/service/deep-cleaning" className="hover:text-orange-500 transition-colors">Water Tank Cleaning Package</a>
              <span>|</span>
              <a href="/service/deep-cleaning" className="hover:text-orange-500 transition-colors">Sofa Cleaning Package</a>
              <span>|</span>
              <a href="/service/full-house-cleaning" className="hover:text-orange-500 transition-colors">Home Cleaning Package</a>
            </div>
          </div>
        </div>

        {/* Cities Row */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-gray-900">Serving Cities:</span>
            {(servingCities.length > 0 ? servingCities : [{ id: 1, name: "Raipur" }, { id: 2, name: "Durg" }]).map((cityItem: any, idx: number, arr: any[]) => {
              const name = typeof cityItem === "string" ? cityItem : cityItem.name;
              const isCurrent = name.toLowerCase() === cityName.toLowerCase();
              return (
                <span key={cityItem.id || name} className="inline-flex items-center gap-2">
                  <span
                    onClick={() => handleCitySelect(cityItem)}
                    className={`cursor-pointer transition-colors ${
                      isCurrent
                        ? "text-orange-600 font-bold"
                        : "text-gray-600 hover:text-orange-500"
                    }`}
                  >
                    {name}
                  </span>
                  {idx < arr.length - 1 && <span className="text-gray-400">|</span>}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnDemandServices;
