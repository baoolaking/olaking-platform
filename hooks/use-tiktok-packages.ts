"use client";

import { useState, useEffect } from "react";
import type { TikTokCoinPackage } from "@/types/tiktok-packages";

export function useTikTokPackages() {
  const [packages, setPackages] = useState<TikTokCoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoading(true);
        const response = await fetch("/api/tiktok-packages", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch packages");
        }

        const data = await response.json();
        setPackages(data.packages || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching TikTok packages:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch packages");
        setPackages([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPackages();
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tiktok-packages", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();
      setPackages(data.packages || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching TikTok packages:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  return { packages, loading, error, refetch };
}
