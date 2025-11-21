"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email || !token) {
        setStatus("error");
        setMessage("Missing email or verification token");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [email, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        {status === "loading" && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">Your email has been verified successfully.</p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
