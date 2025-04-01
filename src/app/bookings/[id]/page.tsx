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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      setIsLoading(true);

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
            selectItem(result[0]);
          } else {
            // Handle case where booking isn't found
            console.error("Booking not found");
          }
        }
      } catch (error) {
        console.error("Error loading booking:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, selectItem]);

  return (
    <>
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <BookingForm />
      )}

      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          min-height: 300px;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid var(--accent-color, #7c3aed);
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}