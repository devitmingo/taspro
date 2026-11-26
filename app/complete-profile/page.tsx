"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthModal from "@/components/AuthModal";

function CompleteProfileModalWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const handleClose = () => {
    try {
      sessionStorage.setItem("profilePromptDismissed", "1");
    } catch (e) {}
    if (redirectParam) {
      router.push(redirectParam);
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

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CompleteProfileModalWrapper />
    </Suspense>
  );
}
