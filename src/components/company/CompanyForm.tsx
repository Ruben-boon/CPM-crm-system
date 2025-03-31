"use client";
import { useState } from "react";
import { useCompaniesData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { CompanyFields } from "./CompanyFields";

export function CompanyForm() {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [areAllFieldsLoaded, setAreAllFieldsLoaded] = useState(true);
  const companiesContext = useCompaniesData();

  // Function to get display name for the item
  const getDisplayName = (item: any) => {
    return item.name || "this company";
  };

  return (
    <CommonForm
      dataContext={companiesContext}
      itemName="Company"
      entityType="company"
      basePath="companies"
      displayName={getDisplayName}
      isFormLoading={isFormLoading}
      isAllFieldsLoaded={() => areAllFieldsLoaded}
    >
      <CompanyFields
        selectedItem={companiesContext.selectedItem}
        isEditing={companiesContext.isEditing}
        pendingChanges={companiesContext.pendingChanges}
        setPendingChanges={companiesContext.setPendingChanges}
        onLoadingChange={setIsFormLoading}
        onAllFieldsLoadedChange={setAreAllFieldsLoaded}
      />
    </CommonForm>
  );
}