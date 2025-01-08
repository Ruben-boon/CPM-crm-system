"use client";

import Explorer from "@/modules/Explorer";
import { contactsDocumentLayout } from "../../schema/documentLayouts";
import { useState } from "react";
import DetailsPanel from "@/modules/details/DetailPanel";
import { FormField } from "@/types/types";
import { fDetailDataToInputFields } from "@/lib/formatData";

export default function ContactPage() {
  const [panelData, setDetailData] = useState<any | null>(null);

  const handleOpenDetails = (isNew: boolean, detailData: any) => {
    setDetailData({ isNew, detailData });
    console.log("Detail Opened:", { isNew, detailData });
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
          initialFormFields={fDetailDataToInputFields(panelData.detailData)}
        />
      )}
    </>
  );
}
