"use client";

import { useStaysData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { StayForm } from "@/components/stay/StayForm";

export default function StayDetailPage() {
  const { selectItem } = useStaysData();
  const params = useParams();
  const stayId = params.id;

  useEffect(() => {
    const loadStay = async () => {
      try {
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
            selectItem(result[0]);
          } else {
            // Handle case where stay isn't found
            console.error("Stay not found");
          }
        }
      } catch (error) {
        console.error("Error loading stay:", error);
      }
    };

    loadStay();
  }, [stayId, selectItem]);

  return <StayForm />;
}