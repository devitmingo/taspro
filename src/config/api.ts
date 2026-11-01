export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export const API_HOST_URL = API_BASE_URL.replace(/\/api\/?$/, "");
export const LIVE_MEDIA_BASE_URL = API_HOST_URL;

export const BASE_URL = API_BASE_URL;

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
    return src;
  }

  // Relative storage paths or bare filenames
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  if (cleanPath.startsWith("/storage/")) {
    return `${API_HOST_URL}${cleanPath}`;
  }

  return `${API_HOST_URL}/storage${cleanPath}`;
};

export default API_BASE_URL;
