"use client";

import Button from "@/components/Button";
import { ContactForm } from "@/components/contact/ContactForm";
import { RoleFilter } from "@/components/search/RoleFilter";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { ContactsProvider, useContactsData } from "@/context/DataContext";
import { Plus } from "lucide-react";

import { useEffect } from "react";

function PageContent() {
  const {
    selectItem,
    items,
    isLoading,
    searchItems,
    roleFilter,
    setRoleFilter,
  } = useContactsData();

  // Re-run search when role filters change
  useEffect(() => {
    searchItems();
  }, [roleFilter.bookerChecked, roleFilter.guestChecked]);

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar onSearch={searchItems} isLoading={isLoading} />

          <div className="filter-search-container">
            <RoleFilter
              bookerChecked={roleFilter.bookerChecked}
              guestChecked={roleFilter.guestChecked}
              onBookerChange={(checked) =>
                setRoleFilter({ bookerChecked: checked })
              }
              onGuestChange={(checked) =>
                setRoleFilter({ guestChecked: checked })
              }
            />

            <div className="button-container">
              <Button icon={Plus} onClick={() => selectItem({}, true)}>
              </Button>
            </div>
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
    <ContactsProvider>
      <PageContent />
    </ContactsProvider>
  );
}
