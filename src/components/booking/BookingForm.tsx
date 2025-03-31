"use client";
import { useState } from "react";
import { useBookingsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { BookingFields } from "./BookingFields";

export function BookingForm() {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [areAllFieldsLoaded, setAreAllFieldsLoaded] = useState(false);
  const bookingsContext = useBookingsData();

  // Function to get display name for the item
  const getDisplayName = (item: any) => {
    return item.confirmationNo || "this booking";
  };

  return (
    <CommonForm
      dataContext={bookingsContext}
      itemName="Booking"
      entityType="booking"
      basePath="bookings"
      displayName={getDisplayName}
      isFormLoading={isFormLoading}
      isAllFieldsLoaded={() => areAllFieldsLoaded}
    >
      <BookingFields
        selectedItem={bookingsContext.selectedItem}
        isEditing={bookingsContext.isEditing}
        pendingChanges={bookingsContext.pendingChanges}
        setPendingChanges={bookingsContext.setPendingChanges}
        onLoadingChange={setIsFormLoading}
        onAllFieldsLoadedChange={setAreAllFieldsLoaded}
      />
    </CommonForm>
  );
}