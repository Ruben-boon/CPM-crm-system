"use client";

import Button from "@/components/Button";
import { CompanyForm } from "@/components/company/CompanyForm";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { CompaniesProvider, useCompaniesData } from "@/context/DataContext";
import { Plus } from "lucide-react";

function PageContent() {
  const {
    selectItem,
    items,
    isLoading,
    searchItems,
  } = useCompaniesData();

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
            <Button icon={Plus} onClick={() => selectItem({}, true)}>
              New Company
            </Button>
          </div>
          <SearchResults 
            items={items} 
            onSelect={selectItem} 
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