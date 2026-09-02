"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Search,
  MapPin,
  User,
  ChevronDown,
  Phone,
  Mic,
  CircleUserRound,
  Bell,
  Heart,
  House,
  ClipboardList,
  Wrench,
  UserRound,
  X,
  Check,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { SERVICES_DATA } from "@/data/services";
import AuthModal from "./AuthModal";
import { useBooking } from "@/context/BookingContext";
import Swal from "sweetalert2";

const getRouteSlug = (nameOrSlug: string, id?: any) => {
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

const Header = () => {
  const { user } = useAuth();
  const { cartItems, clearCart } = useBooking();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentState, setCurrentState] = useState("Chhattisgarh");
  const [currentCity, setCurrentCity] = useState("Raipur");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Location Dropdown States (Strictly Master Cities Only)
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [activeStateTab, setActiveStateTab] = useState<string>("All");
  const [masterStateList, setMasterStateList] = useState<any[]>([]);
  const [dynamicCities, setDynamicCities] = useState<any[]>([]);

  const locationRef = useRef<HTMLDivElement>(null);
  const mobileLocationRef = useRef<HTMLDivElement>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchServices, setSearchServices] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setNotificationCount(0);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/customers/notifications`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.status && Array.isArray(res.data.data)) {
          let count = 0;
          res.data.data.forEach((section: any) => {
            if (Array.isArray(section.data)) {
              section.data.forEach((item: any) => {
                if (item.status === "Unread" || item.is_read === 0 || item.read_at === null) {
                  count++;
                }
              });
            }
          });
          setNotificationCount(count);
        }
      } catch (err) {
        setNotificationCount(0);
      }
    };

    if (isClient) {
      fetchUnreadNotifications();
    }
  }, [isClient, pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setActiveTab(params.get("tab"));
    }
  }, []);

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const GOOGLE_MAPS_API_KEY = "AIzaSyB5BXHlIhGcjTGYsBM57A99eV--ti4ePOs";

  const detectCurrentLocation = (force = false) => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    const savedLocation = localStorage.getItem("selected_location");
    if (!force && savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        if (parsed.isManual) return; // User explicitly selected this city manually
      } catch (e) {}
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();

          if (data?.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
            const addressComponents = data.results[0].address_components || [];
            let detectedCity = "";
            let detectedState = "";

            for (const comp of addressComponents) {
              const types = comp.types || [];
              if (types.includes("locality") || types.includes("sublocality_level_1")) {
                if (!detectedCity) detectedCity = comp.long_name;
              } else if (types.includes("administrative_area_level_2") && !detectedCity) {
                detectedCity = comp.long_name;
              } else if (types.includes("administrative_area_level_1")) {
                detectedState = comp.long_name;
              }
            }

            const finalCity = detectedCity || "Raipur";
            const finalState = detectedState || "Chhattisgarh";

            const locationData = {
              city: finalCity,
              state: finalState,
              lat: latitude,
              lng: longitude,
              isAutoDetected: true,
              isManual: false,
            };

            localStorage.setItem("selected_location", JSON.stringify(locationData));
            setCurrentCity(locationData.city);
            setCurrentState(locationData.state);

            window.dispatchEvent(
              new CustomEvent("location-changed", { detail: locationData })
            );
          } else {
            handleCitySelect({ name: "Raipur", state: "Chhattisgarh" }, false);
          }
        } catch (err) {
          console.error("Geocoding failed:", err);
          handleCitySelect({ name: "Raipur", state: "Chhattisgarh" }, false);
        } finally {
          setIsDetectingLocation(false);
          setIsLocationOpen(false);
        }
      },
      (error) => {
        console.warn("Geolocation position unavailable or denied:", error);
        setIsDetectingLocation(false);
        if (!localStorage.getItem("selected_location")) {
          handleCitySelect({ name: "Raipur", state: "Chhattisgarh" }, false);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem("selected_location");
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        if (location.city) setCurrentCity(location.city);
        if (location.state) setCurrentState(location.state);
        if (!location.isManual) {
          // If previously auto-detected, we can refresh current location
          detectCurrentLocation(true);
        }
      } catch (e) {
        detectCurrentLocation(false);
      }
    } else {
      detectCurrentLocation(true);
    }
  }, []);

  useEffect(() => {
    const handleLocationEvent = (e: any) => {
      if (e.detail) {
        if (e.detail.city) setCurrentCity(e.detail.city);
        if (e.detail.state) setCurrentState(e.detail.state);
      }
    };
    const handleOpenLocationModal = () => {
      setIsLocationOpen(true);
    };
    window.addEventListener("location-changed", handleLocationEvent);
    window.addEventListener("open-location-modal", handleOpenLocationModal);
    return () => {
      window.removeEventListener("location-changed", handleLocationEvent);
      window.removeEventListener("open-location-modal", handleOpenLocationModal);
    };
  }, []);

  // Fetch Master States & Master Cities ONLY directly from API endpoints
  useEffect(() => {
    const fetchMasterCities = async () => {
      try {
        const [statesRes, citiesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/states`),
          axios.get(`${API_BASE_URL}/cities`),
        ]);

        const statesData = statesRes.data?.data || [];
        const citiesData = citiesRes.data?.data || [];

        setMasterStateList(statesData);

        const cityList: any[] = [];

        // 1. Add Master Cities from API
        if (Array.isArray(citiesData) && citiesData.length > 0) {
          citiesData.forEach((c: any) => {
            if (!cityList.some((existing) => existing.name.toLowerCase() === c.name.toLowerCase())) {
              cityList.push({
                id: c.id,
                name: c.name,
                state: c.state?.name || "Chhattisgarh",
                state_id: c.state_id,
              });
            }
          });
        }

        // 2. Fetch cities for each active state to gather all available master cities
        for (const st of statesData) {
          try {
            const res = await axios.get(`${API_BASE_URL}/cities`, {
              params: { state_id: st.id },
            });
            if (res.data?.data && Array.isArray(res.data.data)) {
              res.data.data.forEach((c: any) => {
                if (!cityList.some((existing) => existing.name.toLowerCase() === c.name.toLowerCase())) {
                  cityList.push({
                    id: c.id,
                    name: c.name,
                    state: st.name,
                    state_id: st.id,
                  });
                }
              });
            }
          } catch (err) {}
        }

        // 3. Clean default Cities fallback
        if (cityList.length === 0) {
          cityList.push(
            { id: 1, name: "Raipur", state: "Chhattisgarh", state_id: 1 },
            { id: 2, name: "Durg", state: "Chhattisgarh", state_id: 1 },
            { id: 3, name: "Bhilai", state: "Chhattisgarh", state_id: 1 },
            { id: 4, name: "New Raipur", state: "Chhattisgarh", state_id: 1 },
            { id: 5, name: "Panaji", state: "Goa", state_id: 2 },
            { id: 6, name: "Margao", state: "Goa", state_id: 2 }
          );
        }

        setDynamicCities(cityList);
      } catch (e) {
        console.log("Error fetching master cities:", e);
      }
    };

    fetchMasterCities();
  }, []);

  // Click outside listener for location dropdown & search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node) &&
        mobileLocationRef.current &&
        !mobileLocationRef.current.contains(e.target as Node)
      ) {
        setIsLocationOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Populate searchable services dynamically based on city and state
  useEffect(() => {
    const fetchAllSearchServices = async () => {
      const allItems: any[] = [];

      // 1. Add local SERVICES_DATA
      SERVICES_DATA.forEach((s) => {
        allItems.push({
          id: s.id,
          name: s.name,
          category: s.category || "Service",
          slug: s.slug,
        });
        if (s.types) {
          s.types.forEach((t) => {
            if (t.subServices) {
              t.subServices.forEach((sub) => {
                allItems.push({
                  id: sub.id,
                  name: sub.name,
                  category: s.name,
                  slug: s.slug,
                });
              });
            }
          });
        }
      });

      // 2. Fetch dynamic API services city-wise
      try {
        const res = await axios.get(`${API_BASE_URL}/services`, {
          params: { state_name: currentState, city_name: currentCity },
        });
        if (res.data?.data && Array.isArray(res.data.data)) {
          res.data.data.forEach((apiItem: any) => {
            allItems.push({
              id: apiItem.id,
              name: apiItem.name,
              category: "Appliance & Home Service",
              slug: getRouteSlug(apiItem.name, apiItem.id),
            });
            if (Array.isArray(apiItem.subServices)) {
              apiItem.subServices.forEach((sub: any) => {
                allItems.push({
                  id: sub.id,
                  name: sub.name,
                  category: apiItem.name,
                  slug: getRouteSlug(sub.name, apiItem.id),
                });
              });
            }
          });
        }
      } catch (e) {
        console.log("Header API search services fetch error:", e);
      }

      // Deduplicate items by lowercased name
      const uniqueMap = new Map();
      allItems.forEach((item) => {
        if (!uniqueMap.has(item.name.toLowerCase())) {
          uniqueMap.set(item.name.toLowerCase(), item);
        }
      });

      setSearchServices(Array.from(uniqueMap.values()));
    };

    fetchAllSearchServices();
  }, [currentCity, currentState]);

  const filteredResults =
    searchQuery.trim() === ""
      ? []
      : searchServices
          .filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 8);

  const handleSelectService = (serviceItem: any) => {
    const slug = serviceItem.slug || getRouteSlug(serviceItem.name, serviceItem.id);
    const url = slug === "amc-services" ? "/amc-services" : `/service/${slug}?service_id=${serviceItem.id}`;
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredResults.length > 0) {
      handleSelectService(filteredResults[0]);
    } else if (searchQuery.trim()) {
      const slug = getRouteSlug(searchQuery);
      setSearchQuery("");
      setIsSearchOpen(false);
      router.push(`/service/${slug}`);
    }
  };

  const handleVoiceSearch = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Voice search is not supported in this browser.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsSearchOpen(true);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const getProfileImage = (img?: string | null) => {
    if (!img) return "/profile.png";
    if (img.startsWith("http") || img.startsWith("/")) return img;
    return `https://taskpro.itmingo.com/storage/customers/${img}`;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.get(`${API_BASE_URL}/customers/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("customer_id");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleCitySelect = async (cityObj: { name: string; state: string }, isManual = true) => {
    const savedCart = localStorage.getItem("cartItems");
    let parsedCart = [];
    try {
      parsedCart = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {}

    const hasItems = (parsedCart && parsedCart.length > 0) || (cartItems && cartItems.length > 0);

    if (hasItems && currentCity !== cityObj.name) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Change Location?",
        text: "Changing your location will clear your current cart items as services may vary by city.",
        showCancelButton: true,
        confirmButtonColor: "#f97316",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Change Location",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        setIsLocationOpen(false);
        setLocationSearch("");
        return;
      }

      if (clearCart) clearCart();
      localStorage.removeItem("cartItems");
    }

    const locationData = {
      city: cityObj.name,
      state: cityObj.state,
      isManual: isManual,
    };

    localStorage.setItem("selected_location", JSON.stringify(locationData));
    setCurrentCity(cityObj.name);
    setCurrentState(cityObj.state);

    window.dispatchEvent(
      new CustomEvent("location-changed", { detail: locationData })
    );

    setIsLocationOpen(false);
    setLocationSearch("");
  };

  // Filter ONLY cities by state tab and search query
  const filteredCities = dynamicCities.filter((item) => {
    const matchesState =
      activeStateTab === "All" || item.state.toLowerCase() === activeStateTab.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(locationSearch.toLowerCase());
    return matchesState && matchesSearch;
  });

  const stateTabs = ["All", ...masterStateList.map((s) => s.name)];

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa] border-b border-gray-200 shadow-xs">
      <div className="w-full 2xl:w-[85%] mx-auto px-4 sm:px-5">
        {/* MOBILE HEADER */}
        <div className="md:hidden py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Hey! {user?.firstName || "User"}
              </h2>

              {/* Mobile Location Dropdown Trigger */}
              <div ref={mobileLocationRef} className="relative mt-1">
                <div
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="flex items-center gap-1 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <MapPin className="w-5 h-5 text-orange-500 fill-orange-500 shrink-0" />
                  <span className="text-gray-700 font-medium">{currentCity}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isLocationOpen ? "rotate-180" : ""}`} />
                </div>

                {/* Mobile Floating Dropdown */}
                {isLocationOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-3 overflow-hidden animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Select City
                      </span>
                      <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
                        {currentCity}
                      </span>
                    </div>

                    {/* Master State Filters */}
                    {stateTabs.length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-2 border-b border-gray-100">
                        {stateTabs.map((st) => (
                          <button
                            key={st}
                            onClick={() => setActiveStateTab(st)}
                            className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
                              activeStateTab === st
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* GPS Detect Current Location button */}
                    <button
                      onClick={() => detectCurrentLocation(true)}
                      disabled={isDetectingLocation}
                      className="w-full my-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-orange-200 shadow-2xs"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? "animate-spin" : ""}`} />
                      <span>{isDetectingLocation ? "Detecting location..." : "Use Current Location (GPS)"}</span>
                    </button>

                    {/* GPS Detect Current Location button */}
                    <button
                      onClick={() => detectCurrentLocation(true)}
                      disabled={isDetectingLocation}
                      className="w-full my-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-orange-200 shadow-2xs cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? "animate-spin" : ""}`} />
                      <span>{isDetectingLocation ? "Detecting location..." : "Use Current Location (GPS)"}</span>
                    </button>

                    {/* Search box */}
                    <div className="my-2">
                      <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-200">
                        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <input
                          type="text"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          placeholder="Search city..."
                          className="w-full text-xs bg-transparent outline-none text-gray-700"
                        />
                      </div>
                    </div>

                    {/* Cities List ONLY */}
                    <div className="max-h-60 overflow-y-auto py-1">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => {
                          const isSelected = city.name.toLowerCase() === currentCity.toLowerCase();
                          return (
                            <div
                              key={city.id}
                              onClick={() => handleCitySelect(city)}
                              className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs font-medium transition-colors ${
                                isSelected
                                  ? "bg-orange-50 text-orange-600 font-bold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-orange-500" : "text-gray-400"}`} />
                                <span>{city.name}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-orange-500" />}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-gray-400">
                          No cities found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5">
              <Link href="/wishlist">
                <Heart className="w-5 h-5 sm:w-8 sm:h-8 text-black" />
              </Link>

              <Link href="/notifications" className="relative">
                <Bell className="w-5 h-5 sm:w-8 sm:h-8 text-black fill-black" />
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* MOBILE SEARCH BAR */}
          <div ref={mobileSearchRef} className="relative mt-2">
            <form
              onSubmit={handleSearchSubmit}
              className="border border-orange-500 rounded-xl px-4 py-2 flex items-center gap-3 bg-white shadow-sm"
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={`Search services in ${currentCity}...`}
                className="flex-1 outline-none bg-transparent text-sm placeholder:text-gray-400 text-gray-800"
              />
              {searchQuery && (
                <X
                  onClick={() => setSearchQuery("")}
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                />
              )}
            </form>

            {/* Mobile Search Overlay */}
            {isSearchOpen && searchQuery.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-72 overflow-y-auto">
                {filteredResults.length > 0 ? (
                  <div className="py-2">
                    {filteredResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectService(item)}
                        className="px-4 py-3 hover:bg-orange-50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <Search className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="text-xs font-medium text-gray-800">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded-full font-medium">
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No services found for &quot;<span className="font-semibold text-gray-700">{searchQuery}</span>&quot; in {currentCity}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE BOTTOM NAV */}
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md z-50 md:hidden">
            <div className="grid grid-cols-4 h-16">
              <Link
                href="/"
                className={`flex flex-col items-center justify-center ${
                  pathname === "/" ? "text-orange-500" : "text-gray-500"
                }`}
              >
                <House className="w-5 h-5" />
                <span className="text-[11px] mt-1 font-medium">Home</span>
              </Link>

              <Link
                href="/my-booking?tab=amc"
                className={`flex flex-col items-center justify-center ${
                  pathname?.startsWith("/my-booking") && activeTab === "amc"
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                <Wrench className="w-5 h-5" />
                <span className="text-[11px] mt-1 font-medium">
                  AMC Services
                </span>
              </Link>

              <Link
                href="/my-booking?tab=home"
                className={`flex flex-col items-center justify-center ${
                  pathname?.startsWith("/my-booking") && activeTab !== "amc"
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-[11px] mt-1 font-medium">Booking</span>
              </Link>

              <Link
                href="/account"
                className={`flex flex-col items-center justify-center ${
                  pathname === "/account" ? "text-orange-500" : "text-gray-500"
                }`}
              >
                <UserRound className="w-5 h-5" />
                <span className="text-[11px] mt-1 font-medium">Account</span>
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP HEADER */}
        <div className="hidden md:flex items-center justify-between h-20 gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 w-40 sm:w-44 relative shrink-0">
            <Link href="/" className="block">
              <img src="/tas.logo.png" alt="TAS Company" className="w-full h-auto object-contain" />
            </Link>
          </div>

          {/* Search + Location Container (Location on LEFT, Search on RIGHT) */}
          <div className="flex items-center border rounded-full bg-gray-50 w-full md:max-w-sm lg:max-w-xl relative shadow-xs">
            {/* DESKTOP CITY DROPDOWN (On the LEFT of Search Bar) */}
            <div ref={locationRef} className="relative shrink-0 border-r border-gray-200">
              <div
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer shrink-0 hover:bg-gray-100 transition-colors rounded-l-full select-none"
              >
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700 font-medium truncate max-w-[110px]">
                  {currentCity}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isLocationOpen ? "rotate-180" : ""}`} />
              </div>

              {/* Floating Inline City Dropdown */}
              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-2.5 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-3 overflow-hidden animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Select City
                    </span>
                    <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
                      {currentCity}
                    </span>
                  </div>

                  {/* Master State Filters */}
                  {stateTabs.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-2 border-b border-gray-100">
                      {stateTabs.map((st) => (
                        <button
                          key={st}
                          onClick={() => setActiveStateTab(st)}
                          className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
                            activeStateTab === st
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search box */}
                  <div className="my-2">
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-200">
                      <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Search city..."
                        className="w-full text-xs bg-transparent outline-none text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Cities List ONLY */}
                  <div className="max-h-60 overflow-y-auto py-1">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => {
                        const isSelected = city.name.toLowerCase() === currentCity.toLowerCase();
                        return (
                          <div
                            key={city.id}
                            onClick={() => handleCitySelect(city)}
                            className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs font-medium transition-colors ${
                              isSelected
                                ? "bg-orange-50 text-orange-600 font-bold"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-orange-500" : "text-gray-400"}`} />
                              <span>{city.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-500" />}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400">
                        No cities found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DESKTOP SEARCH BAR (To the RIGHT of Location Selector) */}
            <div ref={searchRef} className="hidden lg:flex items-center flex-1 px-4 relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder={`Search services in ${currentCity}...`}
                  className="flex-1 bg-transparent outline-none text-xs px-2 py-1 text-gray-800 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <X
                    onClick={() => setSearchQuery("")}
                    className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600 mr-2"
                  />
                )}
                <Mic
                  onClick={handleVoiceSearch}
                  className={`w-4 h-4 cursor-pointer transition-colors ${
                    isListening ? "text-orange-500 animate-pulse" : "text-gray-600 hover:text-orange-500"
                  }`}
                />
              </form>

              {/* Desktop Floating Results Overlay */}
              {isSearchOpen && searchQuery.trim() !== "" && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-80 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    <div className="py-2">
                      {filteredResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectService(item)}
                          className="px-4 py-2.5 hover:bg-orange-50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <Search className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span className="text-xs font-medium text-gray-800">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded-full font-medium">
                            {item.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No services found for &quot;<span className="font-semibold text-gray-700">{searchQuery}</span>&quot; in {currentCity}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Nav Action Group */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Mobile No */}
            <div className="flex items-center gap-2 shrink-0">
              <Phone className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-gray-700 text-sm font-medium whitespace-nowrap">
                7447-0000-45
              </span>
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="shrink-0">
              <Heart className="w-6 h-6 text-gray-800 hover:text-orange-500 transition-colors" />
            </Link>

            {/* Notification */}
            <Link href="/notifications" className="relative shrink-0">
              <Bell className="w-6 h-6 text-gray-800 hover:text-orange-500 transition-colors" />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>

            {/* Login */}
            {!isClient ? null : user ? (
            <div className="relative group flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-gray-200">
                <img
                  src={getProfileImage(user?.profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <span className="hidden lg:text-base text-[10px] md:inline text-gray-700 font-medium">
                {user.firstName || "Login"}
              </span>

              <ChevronDown className="w-4 h-4 text-gray-500" />

              <div className="absolute right-0 top-10 w-52 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border">
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-gray-900">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || "User"}
                  </p>

                  <p className="text-sm text-gray-500">
                    {user.email || user.phone}
                  </p>
                </div>

                <Link
                  href="/my-booking"
                  className="block px-4 py-2 text-sm hover:bg-orange-50"
                >
                  My Booking
                </Link>

                <Link
                  href="/account"
                  className="block px-4 py-2 text-sm hover:bg-orange-50"
                >
                  Account
                </Link>

                <hr className="my-2" />

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-orange-50"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 cursor-pointer outline-none"
            >
              <div className="bg-gray-200 p-1.5 sm:p-2 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="hidden sm:inline text-gray-700 font-medium">Login</span>
            </button>
          )}
        </div>
      </div>
    </div>

    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
    />
  </header>
  );
};

export default Header;
