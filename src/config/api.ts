export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000/api"
    : "https://app.tasprocompany.in/api");

export const API_HOST_URL = API_BASE_URL.replace(/\/api\/?$/, "");
export const LIVE_MEDIA_BASE_URL = API_HOST_URL;

export const BASE_URL = API_BASE_URL;

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ||
  "AIzaSyDxK5yY7_jlOZt_JthC-NtNZW-kvV_TnUc";

/**
 * Format any image URL returned from API to use valid media storage URL.
 */
export const getImageUrl = (src?: string | null, fallback = "/tas.logo.png"): string => {
  if (!src || typeof src !== "string" || src.trim() === "") {
    return fallback;
  }

  // Local static public assets (e.g. "/ac.png", "/tas.logo.png", "/heroimage.jpg")
  if (
    src.startsWith("/") &&
    (src.endsWith(".png") ||
      src.endsWith(".jpg") ||
      src.endsWith(".jpeg") ||
      src.endsWith(".svg") ||
      src.endsWith(".webp") ||
      src.endsWith(".ico")) &&
    !src.startsWith("/storage")
  ) {
    return src;
  }

  // Data URLs / Blobs
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  // Legacy category mapping if database row references old missing PNG from previous deployment
  const LEGACY_MAP: Record<string, string> = {
    "1786615985_9782.png": "1792148921_4095.webp", // Appliances Repair & Service
    "1786615975_4189.png": "1792149010_4155.webp", // Deep Cleaning Services
    "1786615965_4652.png": "1792149153_2243.webp", // Handyman Service
    "1786615951_9999.png": "1792149143_7008.webp", // TASpro Cleaning Packages
  };

  for (const [oldFile, newFile] of Object.entries(LEGACY_MAP)) {
    if (src.includes(oldFile)) {
      src = src.replace(oldFile, newFile);
      break;
    }
  }

  // Full HTTP/HTTPS URLs (external images or media server)
  if (src.startsWith("http://") || src.startsWith("https://")) {
    if (src.startsWith("http://app.tasprocompany.in")) {
      return src.replace(/^http:\/\//, "https://");
    }
    if (
      API_HOST_URL.includes("tasprocompany.in") &&
      (src.includes("127.0.0.1:8000") || src.includes("localhost:8000"))
    ) {
      return src.replace(/^http:\/\/(?:127\.0\.0\.1|localhost):8000/, API_HOST_URL);
    }
    if (
      (API_HOST_URL.includes("127.0.0.1") || API_HOST_URL.includes("localhost")) &&
      src.includes("tasprocompany.in/storage/")
    ) {
      return src.replace(/https?:\/\/(?:app\.)?tasprocompany\.in/, API_HOST_URL);
    }
    return src;
  }

  // Relative storage paths or bare filenames
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  if (cleanPath.startsWith("/storage/")) {
    return `${API_HOST_URL}${cleanPath}`;
  }

  // If bare filename without folder, resolve to appropriate storage directory
  if (!src.includes("/")) {
    const BRAND_FILES = [
      "voltas.png", "daikin.png", "samsung.png", "blueStar.png", "hitachi.png",
      "mitsubishi.png", "lg.png", "panasonic.png", "whirlpool.png", "godrej.png",
      "haier.png", "aquaguard.png", "bosch.png", "faber.png", "havells.png",
      "hindware.png", "ifb.png", "kent.png", "orient.png", "sony.png"
    ];
    if (BRAND_FILES.includes(src)) {
      return `${API_HOST_URL}/storage/covered-brands/${src}`;
    }
    return `${API_HOST_URL}/storage/service-issues/${src}`;
  }

  return `${API_HOST_URL}/storage${cleanPath}`;
};

export default API_BASE_URL;
