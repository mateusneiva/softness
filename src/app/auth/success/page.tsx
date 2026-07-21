"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../../store/auth";
import { Loader2 } from "lucide-react";

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      login(token).then(() => {
        router.push("/");
      });
    } else {
      router.push("/login");
    }
  }, [token, login, router]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6">
      <Loader2 className="animate-spin text-neutral-950 mb-4" size={40} />
      <h1 className="text-xl font-semibold text-neutral-700 animate-pulse">Completing authentication...</h1>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex flex-col justify-center items-center p-6"><Loader2 className="animate-spin text-neutral-950 mb-4" size={40} /></div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}
