"use client";

import React, { useState, useEffect } from "react";
import { getImageUrl } from "@/config/api";

type SafeImageProps = {
  src?: string | null;
  alt?: string | null;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  fallbackSrc?: string;
};

const DEFAULT_LOGO = "/tas.logo.png";

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  style,
  fallbackSrc = DEFAULT_LOGO,
}: SafeImageProps) {
  const initialSrc = getImageUrl(src, fallbackSrc);

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState<boolean>(
    typeof src !== "string" || src.trim() === ""
  );

  useEffect(() => {
    const validSrc = getImageUrl(src, fallbackSrc);
    setImgSrc(validSrc);
    setHasError(typeof src !== "string" || src.trim() === "");
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const objectFitStyle: React.CSSProperties = hasError
    ? { objectFit: "contain", padding: "6px", backgroundColor: "#f9fafb" }
    : {};

  if (fill) {
    return (
      <img
        src={imgSrc}
        alt={alt || "TAS Pro Service"}
        loading="lazy"
        decoding="async"
        onError={handleError}
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: hasError ? "contain" : (style?.objectFit || "cover"),
          ...objectFitStyle,
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || "TAS Pro Service"}
      width={width || 80}
      height={height || 80}
      loading="lazy"
      decoding="async"
      onError={handleError}
      className={className}
      style={{
        objectFit: hasError ? "contain" : (style?.objectFit || "cover"),
        ...objectFitStyle,
        ...style,
      }}
    />
  );
}
