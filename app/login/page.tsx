"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthModal from "@/components/AuthModal";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const handleClose = () => {
    const savedRedirect =
      redirectParam ||
      (typeof window !== "undefined"
        ? localStorage.getItem("redirectAfterLogin") || sessionStorage.getItem("redirectAfterLogin")
        : null);

    if (savedRedirect && savedRedirect !== "/login" && savedRedirect !== "/signup") {
      try {
        localStorage.removeItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin");
      } catch (e) {}
      router.push(savedRedirect);
    } else if (typeof window !== "undefined" && window.history.length > 1 && document.referrer && !document.referrer.includes("/login")) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthModal
        isOpen={true}
        onClose={handleClose}
        initialMode="login"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginContent />
    </Suspense>
  );
}
