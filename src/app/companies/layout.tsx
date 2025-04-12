"use client";

import Button from "@/components/common/Button";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { CompaniesProvider, useCompaniesData } from "@/context/DataContext";
import { Plus, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchDocuments } from "@/app/actions/crudActions";

function CompaniesLayoutContent({ children }) {
  const { items, isLoading, searchItems, selectItem } = useCompaniesData();
  const router = useRouter();

  // Handle selecting a company to view
  const handleSelectCompany = (company, isNew = false) => {
    if (isNew) {
      router.push("/companies/new");
    } else if (company && company._id) {
      router.push(`/companies/${company._id}`);
    } else {
      router.push("/companies");
    }
  };

  // Handle copying a company - directly fetch and set the data
  const handleCopyCompany = async (company) => {
    try {
      // First navigate to the new page
      router.push("/companies/new");
      
      // Then fetch the full company data to ensure we have all fields
      const result = await searchDocuments("companies", company._id.toString(), "_id");
      
      if (Array.isArray(result) && result.length > 0) {
        // Make a deep clone of the source company
        const sourceCompany = JSON.parse(JSON.stringify(result[0]));
        
        // Remove the _id to create a new company
        delete sourceCompany._id;
        
        // Update the name to indicate it's a copy
        if (sourceCompany.name) {
          sourceCompany.name = `${sourceCompany.name} (Copy)`;
        }
        
        // Use setTimeout to ensure this runs after navigation is complete
        setTimeout(() => {
          // Select the company with edit mode enabled
          selectItem(sourceCompany, true);
        }, 100);
      }
    } catch (error) {
      console.error("Error creating company copy:", error);
    }
  };

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar
            onSearch={searchItems}
            isLoading={isLoading}
            type="companies"
          />
          <div className="button-container">
            <Button intent="outline" icon={Plus} onClick={() => handleSelectCompany({}, true)}>
              New Company
            </Button>
          </div>
          <SearchResults
            items={items}
            onSelect={handleSelectCompany}
            onCopy={handleCopyCompany}
            type="companies"
          />
        </div>
      </div>

      <div className="details-panel">
        {children}
      </div>
    </>
  );
}

export default function CompaniesLayout({ children }) {
  return (
    <CompaniesProvider>
      <CompaniesLayoutContent>{children}</CompaniesLayoutContent>
    </CompaniesProvider>
  );
}