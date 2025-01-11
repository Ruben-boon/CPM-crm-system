"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import DetailContainer from "@/modules/details/DetailContainer";
import { Contact, ChangeRecord } from "@/types/types";
import SearchContainer from "@/modules/search/SearchContainer";
import DetailConfirmation from "@/modules/details/DetailConfirmation";
import { mapContactDetailsToFormFields } from "@/utils/fieldsToDocuments";

export default function ContactPage() {
  const [contactData, setContactData] = useState<any | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<{
    isNew: boolean;
    detailData: Contact;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, ChangeRecord>>({});
  const detailHandlerRef = useRef<{
    handleSave: () => Promise<void>;
    handleDiscard: () => void;
  }>();

  // Function to safely update contact data
  const updateContactData = useCallback((isNew: boolean, detailData: Contact) => {
    setContactData({
      isNew,
      detailData,
      // Add a key to force re-render of DetailContainer
      key: Date.now()
    });
    setHasPendingChanges(false);
    setPendingChanges({});
  }, []);

  const handleOpenContact = useCallback((isNew: boolean, detailData: Contact) => {
    if (hasPendingChanges) {
      setPendingOperation({ isNew, detailData });
      setShowConfirmation(true);
    } else {
      updateContactData(isNew, detailData);
    }
  }, [hasPendingChanges, updateContactData]);

  const handlePendingChanges = useCallback((hasPending: boolean, changes?: Record<string, ChangeRecord>) => {
    setHasPendingChanges(hasPending);
    if (changes) {
      setPendingChanges(changes);
    }
  }, []);

  const handleConfirmNavigation = async () => {
    if (pendingOperation) {
      if (detailHandlerRef.current?.handleSave) {
        await detailHandlerRef.current.handleSave();
      }
      updateContactData(pendingOperation.isNew, pendingOperation.detailData);
      setPendingOperation(null);
    }
    setShowConfirmation(false);
  };

  const handleCancelNavigation = () => {
    if (pendingOperation) {
      if (detailHandlerRef.current?.handleDiscard) {
        detailHandlerRef.current.handleDiscard();
      }
      updateContactData(pendingOperation.isNew, pendingOperation.detailData);
      setPendingOperation(null);
    }
    setShowConfirmation(false);
  };

  // Reset state when contactData changes
  useEffect(() => {
    if (contactData === null) {
      setHasPendingChanges(false);
      setPendingChanges({});
      setPendingOperation(null);
      setShowConfirmation(false);
    }
  }, [contactData]);

  return (
    <>
      <div className="search-area">
        <SearchContainer
          onOpenDetail={handleOpenContact}
          type="contacts"
        />
      </div>
      
      {contactData && (
        <DetailContainer
          key={contactData.key} // Add key to force re-render
          isNew={contactData.isNew}
          initialFormFields={mapContactDetailsToFormFields(contactData.detailData)}
          type="contacts"
          onPendingChanges={handlePendingChanges}
          ref={detailHandlerRef}
        />
      )}

      {showConfirmation && (
        <DetailConfirmation
          title="Unsaved Changes"
          message="You have unsaved changes. Would you like to save them before continuing?"
          confirm="Save and Continue"
          cancel="Discard Changes"
          changes={pendingChanges}
          onConfirm={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
        />
      )}
    </>
  );
}