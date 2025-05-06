"use client";

import { StayForm } from "@/components/stay/StayForm";
import { useStaysData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StayDetailPage() {
  const { selectItem } = useStaysData();
  const params = useParams();
  const stayId = params.id;
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStay, setCurrentStay] = useState<string | null>(null);

  useEffect(() => {
    // Skip if the stay ID hasn't changed
    if (currentStay === stayId) {
      return;
    }

    // Reset state and mark as loading a new stay
    setIsLoaded(false);
    
    const loadStay = async () => {
      try {
        console.log(`Loading stay: ${stayId}`);
        
        // Handle "new" stay case
        if (stayId === "new") {
          selectItem({}, true); // Empty object + start editing mode
        } else {
          const result = await searchDocuments(
            "stays",
            stayId as string,
            "_id"
          );
          
          if (Array.isArray(result) && result.length > 0) {
            // Clear any previous stay data first
            selectItem(null);
            
            // Then set the new stay
            setTimeout(() => {
              selectItem(result[0]);
            }, 0);
          } else {
            console.error("Stay not found");
          }
        }
      } catch (error) {
        console.error("Error loading stay:", error);
      } finally {
        setCurrentStay(stayId as string);
        setIsLoaded(true);
      }
    };

    loadStay();
  }, [stayId, selectItem]);

  return (
    <>
      {isLoaded && <StayForm key={stayId} />}
    </>
  );
}