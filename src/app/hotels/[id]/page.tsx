"use client";

import { HotelForm } from "@/components/hotel/HotelForm";
import { useHotelsData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HotelDetailPage() {
  const { selectItem } = useHotelsData();
  const params = useParams();
  const hotelId = params.id;
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<string | null>(null);

  useEffect(() => {
    // Skip if the hotel ID hasn't changed
    if (currentHotel === hotelId) {
      return;
    }

    // Reset state and mark as loading a new hotel
    setIsLoaded(false);
    
    const loadHotel = async () => {
      try {
        console.log(`Loading hotel: ${hotelId}`);
        
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
            // Clear any previous hotel data first
            selectItem(null);
            
            // Then set the new hotel
            setTimeout(() => {
              selectItem(result[0]);
            }, 0);
          } else {
            console.error("Hotel not found");
          }
        }
      } catch (error) {
        console.error("Error loading hotel:", error);
      } finally {
        setCurrentHotel(hotelId as string);
        setIsLoaded(true);
      }
    };

    loadHotel();
  }, [hotelId, selectItem]);

  return (
    <>
      {isLoaded && <HotelForm key={hotelId} />}
    </>
  );
}