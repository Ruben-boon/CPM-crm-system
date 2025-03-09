"use client";

import { useCompaniesData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { CompanyForm } from "@/components/company/CompanyForm";

export default function CompanyDetailPage() {
  const { selectItem } = useCompaniesData();
  const params = useParams();
  const companyId = params.id;

  useEffect(() => {
    const loadCompany = async () => {
      // Handle "new" contact case
      if (companyId === "new") {
        selectItem({}, true); // Empty object + start editing mode
        return;
      }
      try {
        const result = await searchDocuments("companies", companyId as string, "_id");
        if (Array.isArray(result) && result.length > 0) {
          selectItem(result[0]);
        }
      } catch (error) {
        console.error("Error loading contact:", error);
      }
    };
   
    loadCompany();
  }, [companyId]);

  return <CompanyForm />;
}