// page.tsx
"use client";
import { useState } from "react";
import { Contact } from "@/domain/contacts/contactModel";
import { useContactStore } from "@/store/contactsStore";
import { X } from "lucide-react";
import Button from "@/components/common/Button";
import { ContactSearch } from "@/components/search/ContactSearch";
import { ContactForm } from "@/domain/contacts/ContactForm";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { useContactForm } from "@/hooks/useContactForm";

export default function ContactsPage() {
  const {
    selectedContact,
    setSelectedContact,
    searchContacts,
    searchField,
    searchTerm,
  } = useContactStore();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [changedFields, setChangedFields] = useState<
    Array<{ label: string; oldValue: string; newValue: string }>
  >([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "select" | "create" | "close" | "cancel-edit";
    contact?: Contact | null;
  } | null>(null);

  const { handleSubmit, resetForm, ...formProps } =
    useContactForm(selectedContact);

  const handleSave = async () => {
    try {
      await handleSubmit();
      await searchContacts(searchField, searchTerm);

      handleCloseDialog();
      setIsFormDirty(false);
      setChangedFields([]);
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  const handleCloseDialog = () => {
    setShowSaveDialog(false);
    if (pendingAction) {
      executePendingAction(pendingAction);
    }
    setPendingAction(null);
  };

  const executePendingAction = (action: NonNullable<typeof pendingAction>) => {
    switch (action.type) {
      case "select":
        setSelectedContact(action.contact);
        break;
      case "create":
        setSelectedContact({
          _id: "",
          general: { firstName: "", lastName: "", email: "", phone: "" },
          currency: "EUR",
        });
        break;
      case "close":
        setSelectedContact(null);
        break;
      case "close":
        setSelectedContact(null);
        break;
    }
    setPendingAction(null);
    resetForm();
  };

  const handleContactAction = (
    action: typeof pendingAction,
    skipDirtyCheck = false
  ) => {
    if (isFormDirty && !skipDirtyCheck) {
      setPendingAction(action);
      setShowSaveDialog(true);
    } else {
      executePendingAction(action!);
    }
  };

  return (
    <div className="contacts-page">
      <div className="search-area">
        <ContactSearch
          handleSelectContact={(contact) => {
            handleContactAction({ type: "select", contact });
          }}
          handleCopyContact={(contact) => {
            const newContact = {
              ...contact,
              _id: "",
              createdAt: undefined,
              updatedAt: undefined,
            };
            handleContactAction({ type: "select", contact: newContact }, true);
          }}
          handleCreateContact={() => {
            handleContactAction({ type: "create" });
          }}
        />
      </div>

      {selectedContact && (
        <div className="details-panel">
          <div className="details-panel__close">
            <Button
              icon={X}
              intent="secondary"
              variant="sm"
              onClick={() => handleContactAction({ type: "close" })}
            >
              Close
            </Button>
          </div>
          <ContactForm
            {...formProps}
            onDirtyChange={setIsFormDirty}
            onChangedFieldsUpdate={setChangedFields}
            onSave={handleSave}
            onCancel={() => {
              resetForm();
            }}
          />
        </div>
      )}

      {showSaveDialog && (
        <ConfirmationDialog
          isOpen={showSaveDialog}
          title="Save Changes"
          message="You have unsaved changes. Do you want to save them?"
          changes={changedFields}
          onConfirm={handleSave}
          onCancel={handleCloseDialog}
        />
      )}
    </div>
  );
}
