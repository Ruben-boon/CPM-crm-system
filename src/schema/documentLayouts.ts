import { FormField } from "../types/types";

export const contactsDocumentLayout: FormField[] = [
  {
    id: "firstName",
    label: "Voornaam",
    value: "",
    required: true,
    type: "text",
  },
  {
    id: "lastName",
    label: "Achternaam",
    value: "",
    required: true,
    type: "text",
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

