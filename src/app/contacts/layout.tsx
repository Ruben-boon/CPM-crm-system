// app/contacts/layout.tsx
"use client";

import Button from "@/components/Button";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { ContactsProvider, useContactsData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RoleFilter } from "@/components/search/RoleFilter";

function ContactsLayoutContent({ children }) {
  const { items, isLoading, searchItems, roleFilter, setRoleFilter } =
    useContactsData();

  const router = useRouter();

  // Handler for selecting a contact
  const handleSelectContact = (contact, isNew = false) => {
    if (isNew) {
      router.push("/contacts/new");
    } else if (contact && contact._id) {
      router.push(`/contacts/${contact._id}`);
    } else {
      router.push("/contacts");
    }
  };

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
              <Button icon={Plus} onClick={() => handleSelectContact({}, true)}>
                New
              </Button>
            </div>
          </div>

          <SearchResults items={items} onSelect={handleSelectContact} />
        </div>
      </div>

      <div className="details-panel">{children}</div>
    </>
  );
}

export default function ContactsLayout({ children }) {
  return (
    <ContactsProvider>
      <ContactsLayoutContent>{children}</ContactsLayoutContent>
    </ContactsProvider>
  );
}
