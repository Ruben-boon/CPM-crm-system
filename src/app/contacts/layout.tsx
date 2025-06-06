// app/contacts/layout.tsx
"use client";

import Button from "@/components/common/Button";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { ContactsProvider, useContactsData } from "@/context/DataContext";
import { Plus, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RoleFilter } from "@/components/search/RoleFilter";
import { searchDocuments } from "@/app/actions/crudActions";

function ContactsLayoutContent({ children }) {
  const { items, isLoading, searchItems, roleFilter, setRoleFilter, selectItem } =
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

  // Handle copying a contact - similar to the company copy functionality
  const handleCopyContact = async (contact) => {
    try {
      // First navigate to the new page
      router.push("/contacts/new");
      
      // Then fetch the full contact data to ensure we have all fields
      const result = await searchDocuments("contacts", contact._id.toString(), "_id");
      
      if (Array.isArray(result) && result.length > 0) {
        // Make a deep clone of the source contact
        const sourceContact = JSON.parse(JSON.stringify(result[0]));
        
        // Remove the _id to create a new contact
        delete sourceContact._id;
        
        // Update the name to indicate it's a copy
        if (sourceContact.general?.firstName) {
          sourceContact.general.firstName = `${sourceContact.general.firstName} (Copy)`;
        }
        
        // Use setTimeout to ensure this runs after navigation is complete
        setTimeout(() => {
          // Select the contact with edit mode enabled
          selectItem(sourceContact, true);
        }, 100);
      }
    } catch (error) {
      console.error("Error creating contact copy:", error);
    }
  };

  // Re-run search when role filters change
  useEffect(() => {
    searchItems();
  }, [roleFilter.bookerChecked, roleFilter.guestChecked, roleFilter.supplierContactChecked]);

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar onSearch={searchItems} isLoading={isLoading} type="contacts" />

          <div className="filter-search-container">
            <RoleFilter
              bookerChecked={roleFilter.bookerChecked}
              guestChecked={roleFilter.guestChecked}
              supplierContactChecked={roleFilter.supplierContactChecked}
              onBookerChange={(checked) =>
                setRoleFilter({ bookerChecked: checked })
              }
              onGuestChange={(checked) =>
                setRoleFilter({ guestChecked: checked })
              }
              onSupplierContactChange={(checked) =>
                setRoleFilter({ supplierContactChecked: checked })
              }
            />

            <div className="button-container">
              <Button intent={"outline"} icon={Plus} onClick={() => handleSelectContact({}, true)}>
                New
              </Button>
            </div>
          </div>

          <SearchResults 
            items={items} 
            onSelect={handleSelectContact} 
            onCopy={handleCopyContact}
            type="contacts"
          />
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