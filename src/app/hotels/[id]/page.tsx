"use client";

import { useHotelsData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { HotelForm } from "@/components/hotel/HotelForm";

export default function HotelDetailPage() {
  const { selectItem } = useHotelsData();
  const params = useParams();
  const hotelId = params.id;

  useEffect(() => {
    const loadHotel = async () => {
      try {
        // Handle "new" hotel case
        if (hotelId === "new") {
          selectItem({}, true); // Empty object + start editing mode
        } else {
          const result = await searchDocuments(
            "hotels",
            hotelId as string,
            "_id"
          );
          if (Array.isArray(result) && result.length > 0) {
            selectItem(result[0]);
          } else {
            // Handle case where hotel isn't found
            console.error("Hotel not found");
          }
        }
      } catch (error) {
        console.error("Error loading hotel:", error);
      }
    };

    loadHotel();
  }, [hotelId, selectItem]);

  return <HotelForm />;
}