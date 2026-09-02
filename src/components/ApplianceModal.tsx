"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import axios from "axios";
import { API_BASE_URL, getImageUrl } from "@/config/api";

const appliances = [
  { id: 1, image: "/10.svg", label: "AC Repair", slug: "ac-repair-service", category_id: 1 },
  { id: 2, image: "/2.svg", label: "Washing Machine Repair", slug: "washing-machine-repair", category_id: 1 },
  { id: 3, image: "/8.svg", label: "Refrigerator Repair", slug: "refrigerator-repair", category_id: 1 },
  { id: 4, image: "/5.svg", label: "Microwave Repair", slug: "microwave-repair", category_id: 1 },
  { id: 5, image: "/3.svg", label: "Water Purifier / RO Repair", slug: "water-purifier-ro-repair", category_id: 1 },
  { id: 6, image: "/7.svg", label: "Geyser Service & Repair", slug: "geyser-service-repair", category_id: 1 },
  { id: 7, image: "/tas.logo.png", label: "Full Home Deep Cleaning", slug: "full-home-deep-cleaning", category_id: 2 },
  { id: 8, image: "/tas.logo.png", label: "Bathroom Cleaning", slug: "bathroom-cleaning", category_id: 2 },
  { id: 9, image: "/6.svg", label: "Kitchen Deep Cleaning", slug: "kitchen-deep-cleaning", category_id: 2 },
  { id: 10, image: "/tas.logo.png", label: "Sofa & Upholstery Cleaning", slug: "sofa-upholstery-cleaning", category_id: 2 },
  { id: 11, image: "/tas.logo.png", label: "Electrician Service", slug: "electrician-service", category_id: 3 },
  { id: 12, image: "/tas.logo.png", label: "Plumber Service", slug: "plumber-service", category_id: 3 },
  { id: 13, image: "/tas.logo.png", label: "Carpenter Service", slug: "carpenter-service", category_id: 3 },
  { id: 14, image: "/tas.logo.png", label: "Premium Cleaning Package", slug: "premium-cleaning-package", category_id: 4 },
];

interface ApplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any[];
  category?: any;
}

const ApplianceModal = ({
  isOpen,
  onClose,
  data = [],
  category = null,
}: ApplianceModalProps) => {
  const router = useRouter();

  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [categoryServices, setCategoryServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getApplianceImage = (name: string, fallbackUrl?: string) => {
    if (fallbackUrl && fallbackUrl !== "null" && fallbackUrl !== "") {
      return getImageUrl(fallbackUrl, "/tas.logo.png");
    }
    return "/tas.logo.png";
  };

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimate(false);
      document.body.style.overflow = "unset";
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const categoryId = category?.id || category?.service_category_id || 1;

    let state = "Chhattisgarh";
    let city = "Raipur";
    const savedLocation = typeof window !== "undefined" ? localStorage.getItem("selected_location") : null;
    if (savedLocation) {
      try {
        const loc = JSON.parse(savedLocation);
        state = loc.state || state;
        city = loc.city || city;
      } catch (e) {}
    }

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/services`, {
        params: {
          service_category_id: categoryId,
          state_name: state,
          city_name: city,
        },
      })
      .then(async (res) => {
        if (res.data?.status && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setCategoryServices(res.data.data);
        } else {
          const fallbackRes = await axios.get(`${API_BASE_URL}/services`, {
            params: {
              service_category_id: categoryId,
            },
          });
          if (fallbackRes.data?.status && Array.isArray(fallbackRes.data?.data)) {
            setCategoryServices(fallbackRes.data.data);
          } else {
            setCategoryServices([]);
          }
        }
      })
      .catch((err) => {
        console.log("Failed to fetch category services:", err);
        setCategoryServices([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, category]);

  // Determine final list of items to show
  let itemsToShow: any[] = [];

  if (categoryServices.length > 0) {
    itemsToShow = categoryServices.map((item) => ({
      id: item.id,
      image: getApplianceImage(item.name, item.image || item.icon),
      label: item.name,
      slug: item.slug || "ac-repair-service",
    }));
  } else if (data.length > 0 && category?.id) {
    const categoryId = Number(category.id);
    const filtered = data.filter(
      (item) => Number(item.service_category_id || item.category_id) === categoryId
    );
    itemsToShow = filtered.map((item) => ({
      id: item.id,
      image: getApplianceImage(item.name, item.image || item.icon),
      label: item.name,
      slug: item.slug || "ac-repair-service",
    }));
  }

  const categoryTitle = category?.name || category?.title || "Appliance Repair & Service";
  const categoryDesc =
    categoryTitle.includes("Appliance") || categoryTitle.includes("AC")
      ? "Professional repair services for all your home appliances. Expert technicians at your service."
      : categoryTitle.includes("Cleaning Services")
      ? "Professional deep cleaning services for your home and office."
      : categoryTitle.includes("Handyman")
      ? "Expert handyman services for electrical, plumbing, and carpentry repairs."
      : categoryTitle.includes("Package")
      ? "Special cleaning packages and bundle offers for a sparkling clean home."
      : "Professional doorstep services by verified expert technicians.";

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-opacity duration-300 ease-out ${
        animate ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-t-[32px] sm:rounded-[28px] w-full sm:w-[680px] max-w-2xl p-6 sm:p-7 relative shadow-2xl border border-gray-100 transition-all duration-350 ease-out transform ${
          animate
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full sm:translate-y-28 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {categoryTitle}
          </h2>

          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Grid - 4 Columns with Circular Cards matching Figma */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : itemsToShow.length > 0 ? (
          <div className="grid grid-cols-4 gap-4 sm:gap-6 max-h-[68vh] overflow-y-auto p-2 hide-scrollbar justify-items-center">
            {itemsToShow.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  router.push(`/service/${item.slug}?service_id=${item.id}`);
                  onClose();
                }}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                {/* Circular Image Container Box */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#EDEDED] group-hover:bg-[#E5E5E7] p-3 sm:p-4 flex items-center justify-center transition-all duration-200 shadow-sm border border-gray-100/50">
                  <SafeImage
                    src={item.image}
                    alt={item.label}
                    width={90}
                    height={90}
                    fallbackSrc="/tas.logo.png"
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Label Text Outside Circle */}
                <span className="text-[11px] sm:text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors mt-2 text-center leading-tight line-clamp-1 max-w-[100px]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-3 text-orange-500 font-bold text-xl">
              🔍
            </div>
            <p className="text-gray-800 font-semibold text-base">No services available</p>
            <p className="text-gray-500 text-xs mt-1 max-w-xs">
              There are currently no active services in this category for your selected location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplianceModal;

