"use client";

import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth/session";

export function useAuthUser() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { user: SessionUser | null }) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return user;
}
