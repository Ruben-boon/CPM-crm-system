"use client";
import { ReactNode } from "react";
import { GenericDataProvider, useGenericData } from "./GenericDataContext";
import entityConfigs from "@/config/entityDefinitions";

// Create type-specific hooks for each entity
export function ContactsProvider({ children }: { children: ReactNode }) {
  return (
    <GenericDataProvider entityConfig={entityConfigs.contacts}>
      {children}
    </GenericDataProvider>
  );
}

export function CompaniesProvider({ children }: { children: ReactNode }) {
  return (
    <GenericDataProvider entityConfig={entityConfigs.companies}>
      {children}
    </GenericDataProvider>
  );
}

export function HotelsProvider({ children }: { children: ReactNode }) {
  return (
    <GenericDataProvider entityConfig={entityConfigs.hotels}>
      {children}
    </GenericDataProvider>
  );
}

export function StaysProvider({ children }: { children: ReactNode }) {
  return (
    <GenericDataProvider entityConfig={entityConfigs.stays}>
      {children}
    </GenericDataProvider>
  );
}

// Type-specific hooks
export function useContactsData() {
  return useGenericData();
}

export function useCompaniesData() {
  return useGenericData();
}

export function useHotelsData() {
  return useGenericData();
}

export function useStaysData() {
  return useGenericData();
}