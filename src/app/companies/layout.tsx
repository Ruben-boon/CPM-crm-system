"use client";

import Button from "@/components/Button";
import { CompanyForm } from "@/components/company/CompanyForm";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { CompaniesProvider, useCompaniesData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";


function CompaniesLayoutContent({ children }) {
  const { items, isLoading, searchItems } = useCompaniesData();

  const router = useRouter();

  const handleSelectCompany = (company, isNew = false) => {
    if (isNew) {
      router.push("/companies/new");
    } else if (company && company._id) {
      router.push(`/companies/${company._id}`);
    } else {
      router.push("/companies");
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
