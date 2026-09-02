"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
            <p className="text-gray-600 text-sm mb-6">
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md hover:bg-orange-600 transition-colors"
            >
              Refresh Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
