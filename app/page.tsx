"use client";

import ServiceSection from "@/components/ServiceSection";
import FeatureSection from "@/components/FeatureSection";
import ServicePromoSection from "@/components/ServicePromoSection";
import MajorServices from "@/components/MajorServices";
import WhyChooseUs from "@/components/WhyChooseUs";
import DownloadApp from "@/components/DownloadApp";
import HomeStartupModal from "@/components/HomeStartupModal";
import DynamicCategorySection from "@/components/DynamicCategorySection";
import ServicesSection from "@/components/ServicesSection";
import NoServiceModal from "@/components/NoServiceModal";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import ServiceReels from "@/components/ServiceReels";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [isMounted, setIsMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [servicesApiData, setServicesApiData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [showNoServiceModal, setShowNoServiceModal] = useState(false);
  const [unservedCity, setUnservedCity] = useState("Raipur");
  const [availableCitiesList, setAvailableCitiesList] = useState<any[]>([
    { name: "Raipur", state: "Chhattisgarh" },
    { name: "Durg", state: "Chhattisgarh" },
    { name: "Bhilai", state: "Chhattisgarh" },
    { name: "New Raipur", state: "Chhattisgarh" },
  ]);

  useEffect(() => {
    setIsMounted(true);

    const fetchCities = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/cities`);
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const list = res.data.data.map((c: any) => ({
            name: c.name,
            state: c.state?.name || "Chhattisgarh",
          }));
          setAvailableCitiesList(list);
        }
      } catch (e) {}
    };

    fetchCities();
  }, []);

  const loadAllData = useCallback(async (state: string, city: string, stateId?: number, cityId?: number) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token && token !== "null" && token !== "undefined") {
        headers.Authorization = `Bearer ${token}`;
      }

      const [dashRes, servRes, catRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/customers/dashboard`, {
          params: {
            state,
            city,
            state_id: stateId,
            city_id: cityId,
            state_name: state,
            city_name: city,
          },
          headers,
        }),
        axios.get(`${API_BASE_URL}/services`, {
          params: {
            state_name: state,
            city_name: city,
          },
        }),
        axios.get(`${API_BASE_URL}/service-categories`),
      ]);

      let categories: any[] = [];

      if (dashRes.status === "fulfilled" && dashRes.value.data?.data) {
        setDashboardData(dashRes.value.data.data);
      }

      if (catRes.status === "fulfilled" && catRes.value.data?.data && Array.isArray(catRes.value.data.data) && catRes.value.data.data.length > 0) {
        categories = catRes.value.data.data;
      } else if (dashRes.status === "fulfilled" && dashRes.value.data?.data?.categories && Array.isArray(dashRes.value.data.data.categories) && dashRes.value.data.data.categories.length > 0) {
        categories = dashRes.value.data.data.categories;
      }

      setCategoriesData(categories);

      let servicesList: any[] = [];
      let hasCitySpecificServices = false;

      if (servRes.status === "fulfilled" && servRes.value.data?.data && Array.isArray(servRes.value.data.data) && servRes.value.data.data.length > 0) {
        servicesList = servRes.value.data.data;
        hasCitySpecificServices = true;
      }

      // Check if dashboard returned city-specific services
      if (dashRes.status === "fulfilled" && dashRes.value.data?.data) {
        const dData = dashRes.value.data.data;
        const hasAppliance = Array.isArray(dData.appliance_repair_services?.data || dData.appliance_repair_services) && (dData.appliance_repair_services?.data || dData.appliance_repair_services).length > 0;
        const hasDeep = Array.isArray(dData.deep_cleaning_services?.data || dData.deep_cleaning_services) && (dData.deep_cleaning_services?.data || dData.deep_cleaning_services).length > 0;
        const hasCleaning = Array.isArray(dData.cleaning_packages?.data || dData.cleaning_packages) && (dData.cleaning_packages?.data || dData.cleaning_packages).length > 0;
        const hasHandyman = Array.isArray(dData.handyman_services?.data || dData.handyman_services) && (dData.handyman_services?.data || dData.handyman_services).length > 0;
        if (hasAppliance || hasDeep || hasCleaning || hasHandyman) {
          hasCitySpecificServices = true;
          if (servicesList.length === 0 && hasAppliance) {
            servicesList = dData.appliance_repair_services?.data || dData.appliance_repair_services;
          }
        }
      }

      setServicesApiData(servicesList);

      if (!hasCitySpecificServices) {
        setUnservedCity(city || "your city");
        setShowNoServiceModal(true);
      } else {
        setShowNoServiceModal(false);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const savedLocation = localStorage.getItem("selected_location");
    if (savedLocation) {
      try {
        const loc = JSON.parse(savedLocation);
        loadAllData(loc.state || "Chhattisgarh", loc.city || "Raipur", loc.state_id, loc.city_id);
        return;
      } catch (e) {}
    }
    loadAllData("Chhattisgarh", "Raipur");
  }, [loadAllData]);

  // Listen to Location Change Events
  useEffect(() => {
    const handleLocationChange = (e: any) => {
      const loc = e.detail;
      if (loc && loc.city) {
        loadAllData(loc.state || "Chhattisgarh", loc.city, loc.state_id, loc.city_id);
      }
    };

    window.addEventListener("location-changed", handleLocationChange);
    return () => {
      window.removeEventListener("location-changed", handleLocationChange);
    };
  }, [loadAllData]);

  // Profile completion redirect
  useEffect(() => {
    if (user && !user.profileCompleted) {
      router.push(`/complete-profile?phone=${user.phone}`);
    }
  }, [user, router]);

  const handleSelectAnotherCity = () => {
    setShowNoServiceModal(false);
    window.dispatchEvent(new Event("open-location-modal"));
  };

  const handleContinueDefaultCity = (targetCity = "Raipur") => {
    setShowNoServiceModal(false);
    const found = availableCitiesList.find((c) => c.name.toLowerCase() === targetCity.toLowerCase());
    const locationData = {
      city: targetCity,
      state: found?.state || "Chhattisgarh",
      isManual: true,
    };
    localStorage.setItem("selected_location", JSON.stringify(locationData));
    window.dispatchEvent(
      new CustomEvent("location-changed", { detail: locationData })
    );
  };

  if (isMounted && user && !user.profileCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white relative">
      <HomeStartupModal />

      <NoServiceModal
        isOpen={showNoServiceModal}
        onClose={() => setShowNoServiceModal(false)}
        cityName={unservedCity}
        onSelectAnotherCity={handleSelectAnotherCity}
        onContinueDefaultCity={handleContinueDefaultCity}
        availableCities={availableCitiesList.map((c) => c.name)}
      />

      <main>
        <ServiceSection
          data={categoriesData.length > 0 ? categoriesData : (dashboardData?.categories || [])}
          applianceData={servicesApiData}
          sliders={dashboardData?.sliders || []}
        />

        <FeatureSection />

        {/* Dynamic Category Sections based on View Type set in Admin Panel */}
        {categoriesData && categoriesData.length > 0 ? (
          categoriesData.map((cat: any) => {
            const catName = (cat.name || "").toLowerCase();
            let catItems: any[] = [];

            if (catName.includes("appliance")) {
              catItems = dashboardData?.appliance_repair_services?.data || dashboardData?.appliance_repair_services || servicesApiData;
            } else if (catName.includes("deep") || catName.includes("house cleaning")) {
              catItems = dashboardData?.deep_cleaning_services?.data || dashboardData?.deep_cleaning_services || [];
            } else if (catName.includes("package")) {
              catItems = dashboardData?.cleaning_packages?.data || dashboardData?.cleaning_packages || [];
            } else if (catName.includes("handyman")) {
              catItems = dashboardData?.handyman_services?.data || dashboardData?.handyman_services || [];
            } else {
              catItems = servicesApiData;
            }

            return (
              <DynamicCategorySection
                key={cat.id || cat.name}
                title={cat.name}
                viewType={cat.view_type || 1}
                data={catItems}
              />
            );
          })
        ) : (
          <>
            <DynamicCategorySection
              title="Appliances Repair & Service"
              viewType={1}
              data={dashboardData?.appliance_repair_services || servicesApiData}
            />
            <DynamicCategorySection
              title="Deep Cleaning Services"
              viewType={2}
              data={dashboardData?.deep_cleaning_services}
            />
            <DynamicCategorySection
              title="TASpro Cleaning Packages"
              viewType={3}
              data={dashboardData?.cleaning_packages}
            />
            <DynamicCategorySection
              title="Handyman Services"
              viewType={1}
              data={dashboardData?.handyman_services}
            />
          </>
        )}

        <MajorServices data={dashboardData?.major_services || []} />

        <ServicePromoSection />

        <WhyChooseUs data={dashboardData?.why_choose_us || []} />
        <DownloadApp />
        <ServiceReels data={dashboardData?.reels || []} />
        <div className="sm:block hidden">
          <ServicesSection data={servicesApiData} dashboardData={dashboardData} />
        </div>
      </main>
    </div>
  );
}
