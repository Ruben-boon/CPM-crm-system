"use client";

import { ContactForm } from "@/components/contact/ContactForm";
import { useContactsData } from "@/context/DataContext";
import { searchDocuments } from "@/app/actions/crudActions";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ContactDetailPage() {
  const { selectItem } = useContactsData();
  const params = useParams();
  const contactId = params.id;

  useEffect(() => {
    const loadContact = async () => {
      // Handle "new" contact case
      if (contactId === "new") {
        selectItem({}, true); // Empty object + start editing mode
        return;
      }
      try {
        const result = await searchDocuments("contacts", contactId as string, "_id");
        if (Array.isArray(result) && result.length > 0) {
          selectItem(result[0]);
        }
      } catch (error) {
        console.error("Error loading contact:", error);
      }
    };
   
    loadContact();
  }, [contactId]);

  return <ContactForm />;
}