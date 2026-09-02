export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.tasprocompany.in/api";

export const API_HOST_URL = API_BASE_URL.replace(/\/api\/?$/, "");
export const LIVE_MEDIA_BASE_URL = "https://app.tasprocompany.in";

export const BASE_URL = API_BASE_URL;

/**
 * Format any image URL returned from API to use valid media storage URL.
 * Loads live media assets for relative storage paths and production URLs.
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

  // Full HTTP/HTTPS URLs
  if (src.startsWith("http://") || src.startsWith("https://")) {
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
