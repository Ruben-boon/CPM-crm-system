"use client";

import { useStaysData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StayForm } from "@/components/stay/StayForm";

export default function StayDetailPage() {
  const { selectItem } = useStaysData();
  const params = useParams();
  const stayId = params.id;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStay = async () => {
      setIsLoading(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    loadStay();
  }, [stayId]);

  return (
    <>
      {isLoading ? (
        <div className="gray-screen">
          {/* Loading indicator */}
        </div>
      ) : (
        <StayForm />
      )}
    </>
  );
}