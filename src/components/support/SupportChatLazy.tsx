"use client";

import dynamic from "next/dynamic";

const SupportChatWidget = dynamic(
  () =>
    import("@/components/support/SupportChatWidget").then(
      (module) => module.SupportChatWidget
    ),
  { ssr: false }
);

export function SupportChatLazy() {
  return <SupportChatWidget />;
}
