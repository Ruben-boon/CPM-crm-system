"use client";

import { ContactForm } from "@/components/contact/ContactForm";
import { useContactsData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContactDetailPage() {
  const { selectItem } = useContactsData();
  const params = useParams();
  const contactId = params.id;
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentContact, setCurrentContact] = useState<string | null>(null);

  useEffect(() => {
    if (currentContact === contactId) {
      return;
    }

    setIsLoaded(false);
    
    const loadContact = async () => {
      try {
        console.log(`Loading contact: ${contactId}`);
        
        // Handle "new" contact case
        if (contactId === "new") {
          selectItem({}, true); 
        } else {
          const result = await searchDocuments(
            "contacts",
            contactId as string,
            "_id"
          );
          
          if (Array.isArray(result) && result.length > 0) {

            selectItem(null);
            
     
            setTimeout(() => {
              selectItem(result[0]);
            }, 0);
          } else {
            console.error("Contact not found");
          }
        }
      } catch (error) {
        console.error("Error loading contact:", error);
      } finally {
        setCurrentContact(contactId as string);
        setIsLoaded(true);
      }
    };

    loadContact();
  }, [contactId, selectItem]);

  return (
    <>
      {isLoaded && <ContactForm key={contactId} />}
    </>
  );
}