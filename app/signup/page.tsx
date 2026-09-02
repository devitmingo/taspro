"use client";

import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthModal
        isOpen={true}
        onClose={() => router.push("/")}
        initialMode="signup"
      />
    </div>
  );
}
