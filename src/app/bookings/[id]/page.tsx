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
  const [currentBooking, setCurrentBooking] = useState<string | null>(null);

  useEffect(() => {
    if (currentBooking === bookingId) {
      return;
    }

    setIsLoaded(false);

    const loadBooking = async () => {
      try {

        if (bookingId === "new") {
          selectItem({}, true);
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
  }, [bookingId, selectItem]);

  return <>{isLoaded && <BookingForm key={bookingId} />}</>;
}
