"use client";

import { useIsAdmin } from "@/components/auth/AuthProvider";
import { HeaderAdminButton } from "@/components/auth/HeaderAdminButton";

export function HomeAdminButton() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) return null;

  return (
    <div className="border-t border-red-400/15 bg-cinema-black px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:py-5 md:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl justify-center">
        <HeaderAdminButton className="w-full max-w-sm" />
      </div>
    </div>
  );
}
