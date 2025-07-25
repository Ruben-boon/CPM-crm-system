"use client";

import { useBookingsData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookingForm } from "@/components/booking/BookingForm";

export default function BookingDetailPage() {
  const { selectItem, selectedItem } = useBookingsData();
  const params = useParams();
  const bookingId = params.id;
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<string | null>(null);

  useEffect(() => {
    if (currentBooking === bookingId) {
      return;
    }

    setIsLoaded(false);

    const loadBooking = async () => {
      try {
        if (bookingId === "new") {
          console.log('[DEBUG] New booking page - checking existing selectedItem:', {
            hasSelectedItem: !!selectedItem,
            selectedItemId: selectedItem?._id,
            confirmationNo: selectedItem?.confirmationNo,
            isEditing: selectedItem && !selectedItem._id // This indicates a copy operation
          });

          // Only clear selectedItem if there's no data (not a copy operation)
          if (!selectedItem || selectedItem._id) {
            console.log('[DEBUG] No existing data or has ID, setting empty item');
            selectItem({}, true);
          } else {
            console.log('[DEBUG] Existing data found (likely from copy), keeping it');
            // Data already exists (from copy operation), don't clear it
            // Just ensure we're in editing mode
            if (!selectedItem._id) {
              // This is a copied item without an ID, make sure we're editing
              selectItem(selectedItem, true);
            }
          }
        } else {
          const result = await searchDocuments(
            "bookings",
            bookingId as string,
            "_id"
          );
          if (Array.isArray(result) && result.length > 0) {
            selectItem(null);

            setTimeout(() => {
              selectItem(result[0]);
            }, 0);
          } else {
            console.error("Booking not found");
          }
        }
      } catch (error) {
        console.error("Error loading booking:", error);
      } finally {
        setCurrentBooking(bookingId as string);
        setIsLoaded(true);
      }
    };

    loadBooking();
  }, [bookingId, selectItem]); // Remove selectedItem from dependencies to prevent infinite loops

  return <>{isLoaded && <BookingForm key={bookingId} />}</>;
}