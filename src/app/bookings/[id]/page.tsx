"use client";

import { useBookingsData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookingForm } from "@/components/booking/BookingForm";

export default function BookingDetailPage() {
  const { selectItem } = useBookingsData();
  const params = useParams();
  const bookingId = params.id;
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentContact, setCurrentContact] = useState<string | null>(null);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        // Handle "new" booking case
        if (bookingId === "new") {
          selectItem({}, true); // Empty object + start editing mode
        } else {
          const result = await searchDocuments(
            "bookings",
            bookingId as string,
            "_id"
          );
          if (Array.isArray(result) && result.length > 0) {
            // Clear any previous contact data first
            selectItem(null);
            
            // Then set the new contact
            setTimeout(() => {
              selectItem(result[0]);
            }, 0);
          } else {
            // Handle case where booking isn't found
            console.error("Booking not found");
          }
        }
      } catch (error) {
        console.error("Error loading booking:", error);
      } finally {
        setCurrentContact(bookingId as string);
        setIsLoaded(true);
      }
      
    };

    loadBooking();
  }, [bookingId, selectItem]);

  return (
    <>
     {isLoaded && <BookingForm key={bookingId} />}

    </>
  );
}
