"use client";
import { useState } from "react";
import DetailsPanel from "./details/DetailPanel";
import Search from "./search/Search";
import { FormField } from "@/types";
import SearchPanel from "./search/SearchPanel";

interface ExplorerProps {
  schemaLayout: FormField[];
  type: string;
}

export default function Explorer({ schemaLayout, type }: ExplorerProps) {
  //   const [selectedContact, setSelectedContact] = useState<FormField[] | null>(
  //     null
  //   );
  //   const [newContact, setNewContact] = useState<FormField[] | null>(null);

  //   const handleSelectResult = (contact: any) => {
  //     setSelectedContact(contact ? mapContactToFormField(contact) : null);
  //   };

  //   const handleCreateContact = (contactCopy: FormField[]) => {
  //     if (contactCopy) {
  //       setNewContact(contactCopy);
  //     } else {
  //       setNewContact(emptyContactFields);
  //     }
  //     setSelectedContact(null);
  //   };

//   console.log(schemaLayout, type);
  return (
    <>
      <SearchPanel type="contacts"/>

      {/* <Search
        onSelectContact={handleSelectResult}
        onCreateContact={handleCreateContact}
      /> */}
      {/*
      {newContact ? (
        <DetailsPanel
          isNew={true}
          initialFormFields={mapContactToFormFields(newContact)}
        />
      ) : selectedContact ? (
        <>
          <DetailsPanel
            isNew={false}
            initialFormFields={mapContactToFormFields(selectedContact)}
          />
        </>
      ) : (
        <p>No contact selected</p>
      )} */}
    </>
  );
}
