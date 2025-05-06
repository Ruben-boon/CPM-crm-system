"use client";
import { CompanyForm } from "@/components/company/CompanyForm";
import { useCompaniesData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompanyDetailPage() {
  const { selectItem } = useCompaniesData();
  const params = useParams();
  const companyId = params.id;
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<string | null>(null);

  useEffect(() => {
    // Skip if the company ID hasn't changed
    if (currentCompany === companyId) {
      return;
    }

    // Reset state and mark as loading a new company
    setIsLoaded(false);
    
    const loadCompany = async () => {
      try {
        console.log(`Loading company: ${companyId}`);
        
        // Handle "new" company case
        if (companyId === "new") {
          selectItem({}, true); // Empty object + start editing mode
        } else {
          const result = await searchDocuments(
            "companies",
            companyId as string,
            "_id"
          );
          
          if (Array.isArray(result) && result.length > 0) {
            // Clear any previous company data first
            selectItem(null);
            
            // Then set the new company
            setTimeout(() => {
              selectItem(result[0]);
            }, 0);
          } else {
            console.error("Company not found");
          }
        }
      } catch (error) {
        console.error("Error loading company:", error);
      } finally {
        setCurrentCompany(companyId as string);
        setIsLoaded(true);
      }
    };

    loadCompany();
  }, [companyId, selectItem]);

  return (
    <>
      {isLoaded && <CompanyForm key={companyId} />}
    </>
  );
}