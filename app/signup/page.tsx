"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthModal from "@/components/AuthModal";

function SignupModalWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const handleClose = () => {
    if (redirectParam && redirectParam !== "/signup" && redirectParam !== "/login") {
      router.push(redirectParam);
    } else if (typeof window !== "undefined" && window.history.length > 1 && document.referrer && !document.referrer.includes("/signup")) {
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
        initialMode="signup"
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SignupModalWrapper />
    </Suspense>
  );
}
