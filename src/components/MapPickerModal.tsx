"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Navigation, Check } from "lucide-react";

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

declare global {
  interface Window {
    L: any;
  }
}

export default function MapPickerModal({
  isOpen,
  onClose,
  initialLat = 21.2514, // Raipur default
  initialLng = 81.6296,
  onConfirm,
}: MapPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [address, setAddress] = useState<string>("Locating address...");
  const [city, setCity] = useState<string>("Raipur");
  const [state, setState] = useState<string>("Chhattisgarh");
  const [postalCode, setPostalCode] = useState<string>("492001");
  const [geocodingLoading, setGeocodingLoading] = useState<boolean>(false);
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(false);

  // Load Leaflet CSS and JS dynamically
  useEffect(() => {
    if (!isOpen) return;

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Add Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        setLeafletLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, [isOpen]);

  // Reverse Geocoding
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setGeocodingLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await res.json();

      if (data && data.address) {
        const addrObj = data.address;
        const formatted =
          data.display_name ||
          `${addrObj.road || ""}, ${addrObj.suburb || ""}, ${
            addrObj.city || addrObj.town || addrObj.village || ""
          }`;

        const detectedCity =
          addrObj.city ||
          addrObj.town ||
          addrObj.village ||
          addrObj.county ||
          "Raipur";
        const detectedState = addrObj.state || "Chhattisgarh";
        const detectedPincode = addrObj.postcode || "492001";

        setAddress(formatted);
        setCity(detectedCity);
        setState(detectedState);
        setPostalCode(detectedPincode);
      } else {
        setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    } finally {
      setGeocodingLoading(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !leafletLoaded || !mapContainerRef.current) return;

    const L = window.L;
    const startLat = lat || initialLat;
    const startLng = lng || initialLng;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom Red Pin Marker Icon
      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; items-center; justify-content: center;">
            <div style="width: 44px; height: 44px; background-color: #FF6B00; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 6px 16px rgba(255,107,0,0.5); display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: grab;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });

      const marker = L.marker([startLat, startLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Drag End listener
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        setLat(position.lat);
        setLng(position.lng);
        reverseGeocode(position.lat, position.lng);
      });

      // Map Click listener
      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        setLat(clickLat);
        setLng(clickLng);
        reverseGeocode(clickLat, clickLng);
      });

      reverseGeocode(startLat, startLng);
    } else {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [isOpen, leafletLoaded]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        setLat(currentLat);
        setLng(currentLng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([currentLat, currentLng], 16);
          markerRef.current.setLatLng([currentLat, currentLng]);
          reverseGeocode(currentLat, currentLng);
        }
      },
      (err) => {
        console.warn("Location permission error:", err);
      }
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
              <MapPin className="w-5 h-5 text-orange-500" />
              Pin Point Location
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Drag the pin marker or tap anywhere on the map
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 w-full bg-gray-100">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Current GPS Locate Button */}
          <button
            onClick={handleLocateMe}
            className="absolute top-4 right-4 z-[500] bg-white text-gray-800 p-3 rounded-2xl shadow-lg border border-gray-200 flex items-center gap-2 text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-95"
          >
            <Navigation className="w-4 h-4 text-orange-500" />
            <span>Locate Me</span>
          </button>
        </div>

        {/* Selected Location Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shrink-0 space-y-3">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-orange-700 tracking-wider block">
                {geocodingLoading ? "Fetching Address..." : "Selected Location"}
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
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            Confirm Location & Add Address
          </button>
        </div>
      </div>
    </div>
  );
}
