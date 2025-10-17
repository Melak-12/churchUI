"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { mockSettings } from "@/lib/mock-data";

interface FeaturesContextType {
  features: {
    events: boolean;
    financial: boolean;
    communications: boolean;
    voting: boolean;
    memberPortal: boolean;
    ministries: boolean;
    attendance: boolean;
    dataCollection: boolean;
  };
  updateFeatures: (
    newFeatures: Partial<FeaturesContextType["features"]>
  ) => void;
}

const FeaturesContext = createContext<FeaturesContextType | undefined>(
  undefined
);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState(mockSettings.features!);

  const updateFeatures = useCallback(
    (newFeatures: Partial<FeaturesContextType["features"]>) => {
      setFeatures((prev) => ({ ...prev, ...newFeatures }));
    },
    []
  );

  return (
    <FeaturesContext.Provider value={{ features, updateFeatures }}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeaturesContext);
  if (context === undefined) {
    throw new Error("useFeatures must be used within a FeaturesProvider");
  }
  return context;
}
