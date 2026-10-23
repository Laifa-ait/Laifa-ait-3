import { useState, useEffect, useCallback } from "react";
import { VehicleCatalogItemDto } from "../domains/auto/auto.types";

const COMPARE_KEY = "olmart_auto_compare_vehicles";
const COMPARE_EVENT = "olmart:auto_compare_changed";

export function useVehicleComparison() {
  const [comparedVehicles, setComparedVehicles] = useState<VehicleCatalogItemDto[]>(() => {
    try {
      const stored = localStorage.getItem(COMPARE_KEY);
      return stored ? (JSON.parse(stored) as VehicleCatalogItemDto[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem(COMPARE_KEY);
        setComparedVehicles(stored ? (JSON.parse(stored) as VehicleCatalogItemDto[]) : []);
      } catch {
        setComparedVehicles([]);
      }
    };

    window.addEventListener(COMPARE_EVENT, handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(COMPARE_EVENT, handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isComparing = useCallback(
    (id: string): boolean => comparedVehicles.some((v) => v.id === id),
    [comparedVehicles]
  );

  const toggleCompare = useCallback((vehicle: VehicleCatalogItemDto) => {
    setComparedVehicles((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      let next: VehicleCatalogItemDto[];
      if (exists) {
        next = prev.filter((v) => v.id !== vehicle.id);
      } else {
        if (prev.length >= 3) {
          next = [...prev.slice(1), vehicle]; // Max 3 véhicules
        } else {
          next = [...prev, vehicle];
        }
      }
      try {
        localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(COMPARE_EVENT));
      } catch {
        // storage quota fallback
      }
      return next;
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparedVehicles([]);
    try {
      localStorage.removeItem(COMPARE_KEY);
      window.dispatchEvent(new CustomEvent(COMPARE_EVENT));
    } catch {
      // ignore
    }
  }, []);

  return {
    comparedVehicles,
    isComparing,
    toggleCompare,
    clearComparison,
    count: comparedVehicles.length,
  };
}
