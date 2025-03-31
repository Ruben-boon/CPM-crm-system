"use client";
import { useState } from "react";
import { useStaysData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { StayFields } from "./StayFields";

export function StayForm() {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [areAllFieldsLoaded, setAreAllFieldsLoaded] = useState(false);
  const staysContext = useStaysData();

  // Function to get display name for the item
  const getDisplayName = (item: any) => {
    return item.reference || "this stay";
  };

  return (
    <CommonForm
      dataContext={staysContext}
      itemName="Stay"
      entityType="stay"
      basePath="stays"
      displayName={getDisplayName}
      isFormLoading={isFormLoading}
      isAllFieldsLoaded={() => areAllFieldsLoaded}
    >
      <StayFields
        selectedItem={staysContext.selectedItem}
        isEditing={staysContext.isEditing}
        pendingChanges={staysContext.pendingChanges}
        setPendingChanges={staysContext.setPendingChanges}
        onLoadingChange={setIsFormLoading}
        onAllFieldsLoadedChange={setAreAllFieldsLoaded}
      />
    </CommonForm>
  );
}