"use client";

import Explorer from "@/modules/Explorer";
import { contactsDocumentLayout } from "../../documentLayouts";
import { useState } from "react";
import DetailsPanel from "@/modules/details/DetailPanel";
import { FormField } from "@/types";

export default function ContactPage() {
  const [panelData, setDetailData] = useState<any | null>(null);

  const handleOpenDetails = (isNew: boolean, detailData: any) => {
    setDetailData({ isNew, detailData });
    console.log("Detail Opened:", { isNew, detailData });
  };

  const detailDataToInputFields = (detailData: any) => {
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
        value: detailData.firstName || "",
        required: true,
        type: "text",
      },
      {
        id: "lastName",
        label: labelMap["lastName"] || "Achternaam",
        value: detailData.lastName || "",
        required: true,
        type: "text",
      },
      {
        id: "email",
        label: labelMap["email"] || "Email",
        value: detailData.email || "",
        type: "email",
      },
      {
        id: "phone",
        label: labelMap["phone"] || "Telefoon",
        value: detailData.phone || "",
        type: "tel",
      },
      {
        id: "company.name",
        label: labelMap["company.name"] || "Bedrijfsnaam",
        value: detailData.company?.name || "",
      },
      {
        id: "address.street",
        label: labelMap["address.street"] || "Straat",
        value: detailData.address?.street || "",
      },
      {
        id: "address.houseNumber",
        label: labelMap["address.houseNumber"] || "Huisnummer",
        value: detailData.address?.houseNumber || "",
      },
      {
        id: "address.zipCode",
        label: labelMap["address.zipCode"] || "Postcode",
        value: detailData.address?.zipCode || "",
      },
      {
        id: "address.country",
        label: labelMap["address.country"] || "Land",
        value: detailData.address?.country || "",
      },
      {
        id: "birthday",
        label: labelMap["birthday"] || "Geboortedatum",
        value: detailData.birthday
          ? new Date(detailData.birthday).toISOString().split("T")[0]
          : "",
        type: "date",
      },
    ];

    return fields;
  };

  return (
    <>
      <div className="search-area">
        <Explorer
          onOpenDetail={handleOpenDetails}
          schemaLayout={contactsDocumentLayout}
          type="contact"
        />
      </div>
      {panelData && (
        <DetailsPanel
          isNew={panelData.isNew}
          schemaLayout={contactsDocumentLayout}
          initialFormFields={detailDataToInputFields(panelData.detailData)}
        />
      )}
    </>
  );
}
