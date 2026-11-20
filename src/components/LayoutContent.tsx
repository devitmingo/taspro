"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContactButton from "@/components/FloatingContactButton";
import { Suspense } from "react";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  return (
    <>
      {/* HEADER */}
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <div className="w-full max-w-full overflow-x-clip mx-auto px-0 pt-0 pb-0">{children}</div>

      {/* FOOTER */}
      <Footer />

      {/* FLOATING DIRECT CONTACT / REACH BUTTON */}
      <FloatingContactButton />
    </>
  );
}
