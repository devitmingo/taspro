"use client";

import React from "react";

interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`w-full px-4 sm:px-0 sm:max-w-[90%] mx-auto lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default LayoutContainer;
