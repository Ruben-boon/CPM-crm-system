"use client";

import Button from "@/components/Button";
import { ContactForm } from "@/components/contact/ContactForm";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { CompaniesProvider, useContactsData } from "@/context/DataContext";
import { Plus } from "lucide-react";

function PageContent() {
  const {
    selectItem,
    items,
    isLoading,

    searchItems,
  } = useContactsData();

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar onSearch={searchItems} isLoading={isLoading} />
          <div className="button-container">
            <Button icon={Plus} onClick={() => selectItem({}, true)}>
              New Contact
            </Button>
          </div>
          <SearchResults items={items} onSelect={selectItem} />
        </div>
      </div>

      <div className="details-panel">
        <ContactForm></ContactForm>
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
