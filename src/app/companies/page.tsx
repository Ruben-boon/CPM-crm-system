"use client";

import Button from "@/components/Button";
import { CompanyForm } from "@/components/company/CompanyForm";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { CompaniesProvider, useCompaniesData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useNavigation } from "@/app/layout"; // Import the navigation hook

function PageContent() {
  const {
    selectItem,
    items,
    isLoading,
    searchItems,
  } = useCompaniesData();
  
  const { currentId, navigateTo } = useNavigation();
  
  // When a company is selected, update the URL
  const handleSelectCompany = (company) => {
    // Update URL when a company is selected
    if (company && company._id) {
      navigateTo('/companies', company._id);
    } else {
      navigateTo('/companies', null);
    }
    
    // Call the original selectItem function
    selectItem(company);
  };
  
  // Load company from URL parameter on initial load or when it changes
  useEffect(() => {
    const loadCompanyFromUrl = async () => {
      if (currentId) {
        console.log("Loading company from URL param:", currentId);
        
        // Check if the company is already in our items
        const existingCompany = items.find(item => item._id === currentId);
        if (existingCompany) {
          selectItem(existingCompany);
          return;
        }
        
        // If not found in current items, search for it
        await searchItems(currentId, "_id");
        
        // Check if it was found in the search results
        const company = items.find(item => item._id === currentId);
        if (company) {
          selectItem(company);
        }
      }
    };
    
    if (currentId) {
      loadCompanyFromUrl();
    }
  }, [currentId, items.length === 0]);

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
            <Button icon={Plus} onClick={() => handleSelectCompany({}, true)}>
              New Company
            </Button>
          </div>
          <SearchResults 
            items={items} 
            onSelect={handleSelectCompany} 
            type="companies"
          />
        </div>
      </div>

      <div className="details-panel">
        <CompanyForm />
      </div>
    </>
  );
}

export default function Page() {
  return (
    <CompaniesProvider>
      <PageContent />
    </CompaniesProvider>
  );
}