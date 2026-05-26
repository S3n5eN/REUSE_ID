"use client";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    async function cleanup() {
      try {
        const res = await fetch("/api/Pengguna/expiredCleanup");
        const data = await res.json();
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }
    cleanup();
  }, []);
  return <>{children}</>;
}
