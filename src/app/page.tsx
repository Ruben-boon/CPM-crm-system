"use client";
import { useState } from "react";
import DetailsPanel from "./modules/details/DetailPanel";
import Header from "./modules/header/Header";
import Search from "./modules/search/Search";
import { FormField } from "./types";

export default function Home() {
  const mapContactToFormFields = (contact: any): FormField[] => {
    if (!contact) return [];

    const labelMap: Record<string, string> = {
      firstName: "Voornaam",
      lastName: "Achternaam",
      email: "Email",
      phone: "Telefoon",
      birthday: "Geboortedatum",
    };

    const fields: FormField[] = [
      {
        id: "firstName",
        label: labelMap["firstName"] || "Voornaam",
        value: contact.firstName || "",
        required: true,
        type: "text",
      },
      {
        id: "lastName",
        label: labelMap["lastName"] || "Achternaam",
        value: contact.lastName || "",
        required: true,
        type: "text",
      },
      {
        id: "email",
        label: labelMap["email"] || "Email",
        value: contact.email || "",
        type: "email",
      },
      {
        id: "phone",
        label: labelMap["phone"] || "Telefoon",
        value: contact.phone || "",
        type: "tel",
      },
      {
        id: "company.name",
        label: labelMap["company.name"] || "Bedrijfsnaam",
        value: contact.company?.name || "",
      },
      {
        id: "address.street",
        label: labelMap["address.street"] || "Straat",
        value: contact.address?.street || "",
      },
      {
        id: "address.houseNumber",
        label: labelMap["address.houseNumber"] || "Huisnummer",
        value: contact.address?.houseNumber || "",
      },
      {
        id: "address.zipCode",
        label: labelMap["address.zipCode"] || "Postcode",
        value: contact.address?.zipCode || "",
      },
      {
        id: "address.country",
        label: labelMap["address.country"] || "Land",
        value: contact.address?.country || "",
      },
      {
        id: "birthday",
        label: labelMap["birthday"] || "Geboortedatum",
        value: contact.birthday
          ? new Date(contact.birthday).toISOString().split("T")[0]
          : "",
        type: "date",
      },
    ];

    return fields;
  };

  const emptyContactFields: FormField[] = [
    {
      id: "firstName",
      label: "Voornaam",
      value: "",
      required: true,
    },
    {
      id: "lastName",
      label: "Achternaam",
      value: "",
      required: true,
    },
    {
      id: "email",
      label: "Email",
      value: "",
      type: "email",
      required: true,
    },
    {
      id: "phone",
      label: "Telefoonnummer",
      value: "",
      type: "tel",
    },
    {
      id: "street",
      label: "Straat",
      value: "",
    },
    {
      id: "houseNumber",
      label: "Huisnummer",
      value: "",
    },
    {
      id: "zipCode",
      label: "Postcode",
      value: "",
    },
    {
      id: "country",
      label: "Land",
      value: "",
    },
    {
      id: "companyName",
      label: "Bedrijfsnaam",
      value: "",
    },
    {
      id: "vatNumber",
      label: "BTW Nummer",
      value: "",
    },
    {
      id: "entityAddress",
      label: "Bedrijfsadres",
      value: "",
    },
  ];

  const [selectedContact, setSelectedContact] = useState<FormField[] | null>(
    null
  );
  const [newContact, setNewContact] = useState<FormField[] | null>(null);

  const handleSelectResult = (contact: any) => {
    setSelectedContact(contact ? mapContactToFormFields(contact) : null);
  };

  const handleCreateContact = (contactCopy: FormField[]) => {
    if (contactCopy) {
      setNewContact(contactCopy);
    } else {
      setNewContact(emptyContactFields);
    }
    setSelectedContact(null);
  };


  return (
    <>
      <Header />
      <main>
        <Search
          onSelectContact={handleSelectResult}
          onCreateContact={handleCreateContact}
        />
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
        )}
      </main>
    </>
  );
}
