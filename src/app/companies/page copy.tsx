"use client";

import Button from "@/components/Button";
import { ContactForm } from "@/components/contact/ContactForm";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { ContactsProvider, useContactsData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useState } from "react";

// import { useState } from "react";
// import { Contact } from "@/domain_old/contacts/contactModel";
// import { useContactStore } from "@/store/contactsStore";
// import { X } from "lucide-react";
// import { ContactSearch } from "@/components/search/ContactSearch";
// import { ContactForm } from "@/domain_old/contacts/ContactForm";
// import { useContactForm } from "@/hooks_old/useContactForm";
// import Button from "@/components/common/Button";
// import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";

function PageContent() {
  const {
    selectedItem,
    selectItem,
    items,
    isLoading,
    isEditing,
    pendingChanges,
    searchItems,
    createItem,
    updateItem,
    setIsEditing,
    setPendingChanges,
  } = useContactsData();
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar onSearch={searchItems} isLoading={isLoading} />
          <div className="button-container">
          <Button icon={Plus} onClick={() => selectItem({}, true)}>
              New Contact
          </Button>
          </div>
          {/* 
          <SearchResults
            passSelectContact={handleSelectContact}
            passCopyContact={handleCopyContact}
          /> */}
          <SearchResults items={items} onSelect={selectItem} />
        </div>
      </div>

      <div className="details-panel">

        {/* <ContactForm
          {...formProps}
          onDirtyChange={setIsFormDirty}
          onChangedFieldsUpdate={setChangedFields}
          onSave={handleSave}
          onCancel={() => {
            // todo fix the cancel bug after saving
            resetForm();
          }}
        /> */}
        <ContactForm></ContactForm>
      </div>
    </>
  );
  // const {
  //   selectedContact,
  //   setSelectedContact,
  //   searchContacts,
  //   searchField,
  //   searchTerm,
  // } = useContactStore();
  // const [isFormDirty, setIsFormDirty] = useState(false);
  // const [changedFields, setChangedFields] = useState<
  //   Array<{ label: string; oldValue: string; newValue: string }>
  // >([]);
  // const [showSaveDialog, setShowSaveDialog] = useState(false);
  // const [pendingAction, setPendingAction] = useState<{
  //   type: "select" | "create" | "close" | "cancel-edit";
  //   contact?: Contact | null;
  // } | null>(null);

  // const { handleSubmit, resetForm, ...formProps } =
  //   useContactForm(selectedContact);

  // const handleSave = async () => {
  //   try {
  //     await handleSubmit();
  //     await searchContacts(searchField, searchTerm);

  //     handleCloseDialog();
  //     setIsFormDirty(false);
  //     setChangedFields([]);
  //   } catch (error) {
  //     console.error("Error saving contact:", error);
  //   }
  // };

  // const handleCloseDialog = () => {
  //   setShowSaveDialog(false);
  //   if (pendingAction) {
  //     executePendingAction(pendingAction);
  //   }
  //   setPendingAction(null);
  // };

  // const executePendingAction = (action: NonNullable<typeof pendingAction>) => {
  //   switch (action.type) {
  //     case "select":
  //       setSelectedContact(action.contact);
  //       break;
  //     case "create":
  //       setSelectedContact({
  //         _id: "",
  //         general: { firstName: "", lastName: "", email: "", phone: "" },
  //         currency: "EUR",
  //       });
  //       break;
  //     case "close":
  //       setSelectedContact(null);
  //       break;
  //     case "close":
  //       setSelectedContact(null);
  //       break;
  //   }
  //   setPendingAction(null);
  //   resetForm();
  // };

  // const handleContactAction = (
  //   action: typeof pendingAction,
  //   skipDirtyCheck = false
  // ) => {
  //   if (isFormDirty && !skipDirtyCheck) {
  //     setPendingAction(action);
  //     setShowSaveDialog(true);
  //   } else {
  //     executePendingAction(action!);
  //   }
  // };

  // return (
  //   <div className="contacts-page">
  //     <div className="search-area">
  //       <ContactSearch
  //         handleSelectContact={(contact) => {
  //           handleContactAction({ type: "select", contact });
  //         }}
  //         handleCopyContact={(contact) => {
  //           const newContact = {
  //             ...contact,
  //             _id: "",
  //             createdAt: undefined,
  //             updatedAt: undefined,
  //           };
  //           handleContactAction({ type: "select", contact: newContact }, true);
  //         }}
  //         handleCreateContact={() => {
  //           handleContactAction({ type: "create" });
  //         }}
  //       />
  //     </div>

  //     {selectedContact && (
  //       <div className="details-panel">
  //         <div className="details-panel__close">
  //           <Button
  //             icon={X}
  //             intent="secondary"
  //             variant="sm"
  //             onClick={() => handleContactAction({ type: "close" })}
  //           >
  //             Close
  //           </Button>
  //         </div>
  //         <ContactForm
  //           {...formProps}
  //           onDirtyChange={setIsFormDirty}
  //           onChangedFieldsUpdate={setChangedFields}
  //           onSave={handleSave}
  //           onCancel={() => {
  //             // todo fix the cancel bug after saving
  //             resetForm();
  //           }}
  //         />
  //       </div>
  //     )}

  //     {showSaveDialog && (
  //       <ConfirmationDialog
  //         isOpen={showSaveDialog}
  //         title="Save Changes"
  //         message="You have unsaved changes. Do you want to save them?"
  //         changes={changedFields}
  //         onConfirm={handleSave}
  //         onCancel={handleCloseDialog}
  //       />
  //     )}
  //   </div>
  // );
}

export default function Page() {
  return (
    <ContactsProvider>
      <PageContent />
    </ContactsProvider>
  );
}
