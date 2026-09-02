export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.tasprocompany.in/api";

export const API_HOST_URL = API_BASE_URL.replace(/\/api\/?$/, "");
export const LIVE_MEDIA_BASE_URL = "https://app.tasprocompany.in";

export const BASE_URL = API_BASE_URL;

/**
 * Format any image URL returned from API to use valid media storage URL.
 * Converts local IPs / localhost or http mixed content to https live storage URLs.
 */
export const getImageUrl = (src?: string | null, fallback = "/tas.logo.png"): string => {
  if (!src || typeof src !== "string" || src.trim() === "") {
    return fallback;
  }

  // Rewrite local dev URLs (e.g. http://127.0.0.1:8000/storage/... or http://localhost:8000/storage/...)
  if (src.includes("127.0.0.1:8000") || src.includes("localhost:8000")) {
    src = src.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, LIVE_MEDIA_BASE_URL);
  }

  // Force HTTPS for production domains to avoid mixed-content blocks
  if (src.startsWith("http://app.tasprocompany.in") || src.startsWith("http://taskpro.itmingo.com")) {
    src = src.replace(/^http:\/\//, "https://");
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
