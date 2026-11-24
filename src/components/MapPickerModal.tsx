"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Navigation, Check, Search, Loader2 } from "lucide-react";
import { GOOGLE_MAPS_API_KEY } from "@/config/api";

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  onConfirm: (locationData: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  }) => void;
}

// Global script loader for Google Maps
const loadGoogleMapsScript = (apiKey: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("No window object");

    if ((window as any).google && (window as any).google.maps) {
      return resolve((window as any).google.maps);
    }

    const existingScript = document.getElementById("google-maps-script") as HTMLScriptElement;
    if (existingScript) {
      if ((window as any).google?.maps) {
        return resolve((window as any).google.maps);
      }
      existingScript.addEventListener("load", () => resolve((window as any).google?.maps));
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as any).google?.maps);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export default function MapPickerModal({
  isOpen,
  onClose,
  initialLat = 21.2514, // Raipur default
  initialLng = 81.6296,
  onConfirm,
}: MapPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [address, setAddress] = useState<string>("Locating address...");
  const [city, setCity] = useState<string>("Raipur");
  const [state, setState] = useState<string>("Chhattisgarh");
  const [postalCode, setPostalCode] = useState<string>("492001");
  const [geocodingLoading, setGeocodingLoading] = useState<boolean>(false);
  const [mapsLoaded, setMapsLoaded] = useState<boolean>(false);
  const [locateMeLoading, setLocateMeLoading] = useState<boolean>(false);

  // Sync initial coordinates
  useEffect(() => {
    if (initialLat && initialLng) {
      setLat(initialLat);
      setLng(initialLng);
    }
  }, [initialLat, initialLng]);

  // Load Google Maps SDK
  useEffect(() => {
    if (!isOpen) return;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        setMapsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load Google Maps SDK:", err);
      });
  }, [isOpen]);

  // Reverse geocode lat/lng via Google Geocoder
  const reverseGeocode = (latitude: number, longitude: number) => {
    const google = (window as any).google;
    if (!google?.maps?.Geocoder) {
      // Fallback via Google Geocoding REST API if JS Geocoder not yet ready
      setGeocodingLoading(true);
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.results && data.results[0]) {
            parseAndSetAddress(data.results[0]);
          } else {
            setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        })
        .catch(() => {
          setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        })
        .finally(() => setGeocodingLoading(false));
      return;
    }

    setGeocodingLoading(true);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results: any[], status: string) => {
        setGeocodingLoading(false);
        if (status === "OK" && results && results[0]) {
          parseAndSetAddress(results[0]);
        } else {
          setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
      }
    );
  };

  const parseAndSetAddress = (result: any) => {
    const formatted = result.formatted_address || "";
    let detectedCity = "";
    let detectedState = "";
    let detectedPostal = "";

    if (result.address_components) {
      for (const comp of result.address_components) {
        if (comp.types.includes("locality")) {
          detectedCity = comp.long_name;
        } else if (!detectedCity && comp.types.includes("administrative_area_level_2")) {
          detectedCity = comp.long_name.replace(/\s+District$/i, "");
        }

        if (comp.types.includes("administrative_area_level_1")) {
          detectedState = comp.long_name;
        }

        if (comp.types.includes("postal_code")) {
          detectedPostal = comp.long_name;
        }
      }
    }

    setAddress(formatted);
    setCity(detectedCity || "Raipur");
    setState(detectedState || "Chhattisgarh");
    setPostalCode(detectedPostal || "492001");
  };

  // Initialize Google Map & Autocomplete
  useEffect(() => {
    if (!isOpen || !mapsLoaded || !mapContainerRef.current) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    const startLat = lat || initialLat;
    const startLng = lng || initialLng;

    // Custom TASPro Brand Marker SVG
    const customMarkerIcon = {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="42" height="50" viewBox="0 0 42 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="shadow" x="0" y="0" width="42" height="50" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#FF6B00" flood-opacity="0.45"/>
          </filter>
          <path g="M21 2C10.5 2 2 10.5 2 21C2 34 18.5 47 19.3 47.6C20.3 48.3 21.7 48.3 22.7 47.6C23.5 47 40 34 40 21C40 10.5 31.5 2 21 2Z" fill="#FF6B00" filter="url(#shadow)"/>
          <path d="M21 2C10.5 2 2 10.5 2 21C2 34 18.5 47 19.3 47.6C20.3 48.3 21.7 48.3 22.7 47.6C23.5 47 40 34 40 21C40 10.5 31.5 2 21 2Z" stroke="#FFFFFF" stroke-width="2.5"/>
          <circle cx="21" cy="20" r="8" fill="#FFFFFF"/>
          <circle cx="21" cy="20" r="4.5" fill="#FF6B00"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(38, 46),
      anchor: new google.maps.Point(19, 46),
    };

    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: startLat, lng: startLng },
        zoom: 16,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      });

      const marker = new google.maps.Marker({
        position: { lat: startLat, lng: startLng },
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        icon: customMarkerIcon,
        title: "Drag to pinpoint your exact address",
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Drag event
      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        if (position) {
          const newLat = position.lat();
          const newLng = position.lng();
          setLat(newLat);
          setLng(newLng);
          reverseGeocode(newLat, newLng);
        }
      });

      // Map click event
      map.addListener("click", (e: any) => {
        if (e.latLng) {
          const clickLat = e.latLng.lat();
          const clickLng = e.latLng.lng();
          marker.setPosition(e.latLng);
          setLat(clickLat);
          setLng(clickLng);
          reverseGeocode(clickLat, clickLng);
        }
      });

      // Google Places Autocomplete on the Search Bar
      if (searchInputRef.current && google.maps.places) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          componentRestrictions: { country: "in" },
          fields: ["geometry", "formatted_address", "address_components", "name"],
        });

        autocomplete.bindTo("bounds", map);
        autocompleteRef.current = autocomplete;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          const placeLat = place.geometry.location.lat();
          const placeLng = place.geometry.location.lng();

          map.setCenter(place.geometry.location);
          map.setZoom(17);
          marker.setPosition(place.geometry.location);

          setLat(placeLat);
          setLng(placeLng);

          if (place.formatted_address) {
            parseAndSetAddress(place);
          } else {
            reverseGeocode(placeLat, placeLng);
          }
        });
      }

      // Initial reverse geocode
      reverseGeocode(startLat, startLng);
    } else {
      mapInstanceRef.current.setCenter({ lat: startLat, lng: startLng });
      if (markerRef.current) {
        markerRef.current.setPosition({ lat: startLat, lng: startLng });
      }
    }
  }, [isOpen, mapsLoaded]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;

    setLocateMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocateMeLoading(false);
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        setLat(currentLat);
        setLng(currentLng);

        if (mapInstanceRef.current && markerRef.current) {
          const google = (window as any).google;
          const pos = new google.maps.LatLng(currentLat, currentLng);
          mapInstanceRef.current.panTo(pos);
          mapInstanceRef.current.setZoom(17);
          markerRef.current.setPosition(pos);
          reverseGeocode(currentLat, currentLng);
        }
      },
      (err) => {
        setLocateMeLoading(false);
        console.warn("Location permission error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirmLocation = () => {
    onConfirm({
      latitude: lat,
      longitude: lng,
      address,
      city,
      state,
      postalCode,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl relative shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[80vh]">
        {/* Modal Header */}
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between z-10 shrink-0">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF6B00]" />
              Select Delivery Location
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Powered by Google Maps • Drag the pin marker to your doorstep
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Places Search Bar */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 z-10 shrink-0 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search area, landmark, society in Raipur / Durg..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 shadow-xs"
            />
          </div>
          <button
            onClick={handleLocateMe}
            disabled={locateMeLoading}
            className="bg-white text-gray-800 px-3 py-2 rounded-xl border border-gray-300 shadow-xs flex items-center gap-1.5 text-xs font-bold hover:bg-orange-50 hover:text-[#FF6B00] hover:border-orange-300 transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Use current GPS location"
          >
            {locateMeLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B00]" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-[#FF6B00]" />
            )}
            <span>Locate Me</span>
          </button>
        </div>

        {/* Google Map Container */}
        <div className="relative flex-1 w-full bg-gray-100">
          {!mapsLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
              <p className="text-xs font-bold text-gray-600">Loading Google Maps...</p>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Selected Location Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shrink-0 space-y-3">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-orange-700 tracking-wider block">
                {geocodingLoading ? "Fetching Address from Google..." : "Selected Google Maps Location"}
              </span>
              <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 mt-0.5">
                {address}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 font-semibold mt-1">
                <span>City: {city}</span>
                <span>•</span>
                <span>Pincode: {postalCode}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmLocation}
            className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Confirm Location & Add Address
          </button>
        </div>
      </div>
    </div>
  );
}
