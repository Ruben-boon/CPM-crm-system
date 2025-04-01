"use client";
import { CompanyForm } from "@/components/company/CompanyForm";
import { useCompaniesData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect } from "react";


export default function CompanyDetailPage() {
  const { selectItem } = useCompaniesData();
  const params = useParams();
  const companyId = params.id;

  useEffect(() => {
    const loadContact = async () => {

      try {
        // Handle "new" contact case
        if (companyId === "new") {
          selectItem({}, true); // Empty object + start editing mode
        } else {
          const result = await searchDocuments(
            "companies",
            companyId as string,
            "_id"
          );
          if (Array.isArray(result) && result.length > 0) {
            selectItem(result[0]);
          } else {
            // Handle case where contact isn't found
            console.error("Company not found");
          }
        }
      } catch (error) {
        console.error("Error loading contact:", error);
      } finally {
      }
    };

    loadContact();
  }, [companyId]);

  return <CompanyForm />;
}