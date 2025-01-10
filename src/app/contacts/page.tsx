"use client";

import { useState } from "react";
import { Contact } from "@/types/types";
import { mapContactDetailsToFormFields } from "@/utils/mapFormFields.ts";
import SearchContainer from "@/modules/search/SearchContainer";
import DetailContainer from "@/modules/details/DetailContainer";

export default function ContactPage() {
  const [contactData, setContactData] = useState<any | null>(null);

  const handleOpenContact = (isNew: boolean, detailData: Contact) => {
    setContactData({ isNew, detailData });
    // console.log("Detail Opened:", { isNew, detailData });
  };

  return (
    <>
      <div className="search-area">
        <SearchContainer onOpenDetail={handleOpenContact} type="contacts" />
      </div>
      {contactData && (
        <DetailContainer
          isNew={contactData.isNew}
          initialFormFields={mapContactDetailsToFormFields(
            contactData.detailData
          )}
          type="contacts"
        />
      )}
    </>
  );
}
