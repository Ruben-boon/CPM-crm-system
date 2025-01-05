"use client";
import { useState } from "react";
import DetailsPanel from "./modules/details/DetailPanel";
import Header from "./modules/header/Header";
import Search from "./modules/search/Search";
import { FormField } from "./types";

export default function Home() {
  const initialFormFields: FormField[] = [
    {
      id: "firstName",
      label: "Voornaam",
      value: "Amina",
      required: true,
    },
    {
      id: "email",
      label: "Email",
      value: "aminaabdi@gmail.com",
      type: "email",
    },
  ];

  const [selectedContact, setSelectedContact] = useState<any>(null);

  const handleSelectResult = (contact: any) => {
    setSelectedContact(contact);
  };

  return (
    <>
      <Header />
      <main>
        <Search onSelectResult={handleSelectResult} />
        {selectedContact ? (
          <DetailsPanel
            isNew={false}
            initialFormFields={[
              { id: "firstName", label: "Voornaam", value: selectedContact.firstName, required: true },
              { id: "email", label: "Email", value: selectedContact.email, type: "email" },
            ]}
          />
        ) : (
          <DetailsPanel isNew={false} initialFormFields={initialFormFields} />
        )}
      </main>
    </>
  );
}
