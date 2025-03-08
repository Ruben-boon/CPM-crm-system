"use client";

import Button from "@/components/Button";
import { ContactForm } from "@/components/contact/ContactForm";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { ContactsProvider, useContactsData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useNavigation } from "@/app/layout"; // Import the navigation hook
import { RoleFilter } from "@/components/search/RoleFilter";

function PageContent() {
  const {
    selectItem,
    items,
    isLoading,
    searchItems,
    roleFilter,
    setRoleFilter
  } = useContactsData();
  
  const { currentId, navigateTo } = useNavigation();
  
  // When a contact is selected, update the URL
  const handleSelectContact = (contact) => {
    // Update URL when a contact is selected
    if (contact && contact._id) {
      navigateTo('/contacts', contact._id);
    } else {
      navigateTo('/contacts', null);
    }
    
    // Call the original selectItem function
    selectItem(contact);
  };
  
  // Load contact from URL parameter on initial load or when it changes
  useEffect(() => {
    const loadContactFromUrl = async () => {
      if (currentId) {
        console.log("Loading contact from URL param:", currentId);
        
        // Check if the contact is already in our items
        const existingContact = items.find(item => item._id === currentId);
        if (existingContact) {
          selectItem(existingContact);
          return;
        }
        
        // If not found in current items, search for it
        await searchItems(currentId, "_id");
        
        // Check if it was found in the search results
        const contact = items.find(item => item._id === currentId);
        if (contact) {
          selectItem(contact);
        }
      }
    };
    
    if (currentId) {
      loadContactFromUrl();
    }
  }, [currentId, items.length === 0]);
  
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
              onBookerChange={(checked) => setRoleFilter({ bookerChecked: checked })}
              onGuestChange={(checked) => setRoleFilter({ guestChecked: checked })}
            />
            
            <div className="button-container">
              <Button icon={Plus} onClick={() => handleSelectContact({}, true)}>
                New Contact
              </Button>
            </div>
          </div>
          
          <SearchResults items={items} onSelect={handleSelectContact} />
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