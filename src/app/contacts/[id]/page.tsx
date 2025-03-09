"use client";

import { useCompaniesData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CompanyForm } from "@/components/company/CompanyForm";

export default function CompanyDetailPage() {
  const { selectItem } = useCompaniesData();
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = params.id;
  const isCopy = searchParams.get("copy") === "true";
  const sourceId = searchParams.get("sourceId");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCompany = async () => {
      setIsLoading(true);
      
      // Handle "new" company case
      if (companyId === "new") {
        // If it's a copy operation, load the source company
        if (isCopy && sourceId) {
          try {
            const result = await searchDocuments("companies", sourceId as string, "_id");
            if (Array.isArray(result) && result.length > 0) {
              // Clone the source company data
              const sourceCompany = { ...result[0] };
              
              // Remove the _id to create a new company
              delete sourceCompany._id;
              
              // Set any other fields that should be reset for a new copy
              // For example, you might want to modify the name to indicate it's a copy
              if (sourceCompany.name) {
                sourceCompany.name = `${sourceCompany.name} (Copy)`;
              }
              
              // Select the company with edit mode enabled
              selectItem(sourceCompany, true);
            }
          } catch (error) {
            console.error("Error loading source company for copy:", error);
            // Fallback to empty object if there's an error
            selectItem({}, true);
          }
        } else {
          // Regular new company
          selectItem({}, true); // Empty object + start editing mode
        }
      } else {
        // Regular company load
        try {
          const result = await searchDocuments("companies", companyId as string, "_id");
          if (Array.isArray(result) && result.length > 0) {
            selectItem(result[0]);
          }
        } catch (error) {
          console.error("Error loading company:", error);
        }
      }
      
      setIsLoading(false);
    };
   
    loadCompany();
  }, [companyId, isCopy, sourceId, selectItem]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <CompanyForm />;
}