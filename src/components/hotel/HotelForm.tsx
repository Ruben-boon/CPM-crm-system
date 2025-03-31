"use client";
import { useState } from "react";
import { useHotelsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { HotelFields } from "./HotelFields";

export function HotelForm() {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [areAllFieldsLoaded, setAreAllFieldsLoaded] = useState(true);
  const hotelsContext = useHotelsData();

  // Function to get display name for the item
  const getDisplayName = (item: any) => {
    return item.name || "this hotel";
  };

  return (
    <CommonForm
      dataContext={hotelsContext}
      itemName="Hotel"
      entityType="hotel"
      basePath="hotels"
      displayName={getDisplayName}
      isFormLoading={isFormLoading}
      isAllFieldsLoaded={() => areAllFieldsLoaded}
    >
      <HotelFields
        selectedItem={hotelsContext.selectedItem}
        isEditing={hotelsContext.isEditing}
        pendingChanges={hotelsContext.pendingChanges}
        setPendingChanges={hotelsContext.setPendingChanges}
        onLoadingChange={setIsFormLoading}
        onAllFieldsLoadedChange={setAreAllFieldsLoaded}
      />
    </CommonForm>
  );
}