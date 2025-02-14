"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactsData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { MultiRefField } from "../fields/MultiRefField";
import { RefField } from "../fields/RefField";

interface ContactFormData {
  general: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: string;
    companyId: string;
    companyName: string;
    bookerId: string;
    bookerName: string;
    bookingIds: string[];
    bookingNames: string[];
    contactIds: string[];
    relatedContacts: string[];
  };
}

const INITIAL_FORM_STATE: ContactFormData = {
  general: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "",
    companyId: "",
    companyName: "",
    bookerId: "",
    bookerName: "",
    bookingIds: [],
    bookingNames: [],
    contactIds: [],
    relatedContacts: [],
  },
};

const TYPE_OPTIONS = [
  { value: "a", label: "Contact" },
  { value: "b", label: "Client" },
  { value: "c", label: "Booker?" },
];

const BOOKING_DISPLAY_FIELDS = ["name", "lastName"];

export function ContactForm() {
  const {
    selectedItem,
    updateItem,
    createItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
  } = useContactsData();

  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    section: keyof ContactFormData,
    field: string,
    value: string | string[],
    displayValue?: string | string[]
  ) => {
    if (section === "general") {
      setFormData((prev) => ({
        ...prev,
        general: {
          ...prev.general,
          [field]: value,
          ...(displayValue && field === "companyId"
            ? { companyName: displayValue }
            : {}),
          ...(displayValue && field === "bookerId"
            ? { bookerName: displayValue }
            : {}),
          ...(displayValue && field === "bookingIds"
            ? { bookingNames: displayValue }
            : {}),
          ...(displayValue && field === "contactIds"
            ? { relatedContacts: displayValue }
            : {}),
        },
      }));
    }

    setPendingChanges((prev) => ({
      ...prev,
      [`${section}.${field}`]: {
        oldValue: selectedItem?.[section]?.[field] || "",
        newValue: value,
      },
    }));
  };

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        general: {
          firstName: selectedItem.general?.firstName || "",
          lastName: selectedItem.general?.lastName || "",
          email: selectedItem.general?.email || "",
          phone: selectedItem.general?.phone || "",
          type: selectedItem.general?.type || "",
          companyId: selectedItem.general?.companyId || "",
          companyName: "",
          bookerId: selectedItem.general?.bookerId || "",
          bookerName: "",
          bookingIds: selectedItem.general?.bookingIds || [],
          bookingNames: [],
          contactIds: selectedItem.general?.contactIds || [],
          relatedContacts: [],
        },
      });
    }
  }, [selectedItem]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemData = {
        ...selectedItem,
        general: {
          ...formData.general,
          companyName: undefined,
          bookerName: undefined,
          bookingNames: undefined,
          relatedContacts: undefined,
        },
      };

      const success = selectedItem?._id
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(
          `Contact ${selectedItem?._id ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setPendingChanges({});
      } else {
        toast.error(
          `Failed to ${selectedItem?._id ? "update" : "create"} contact`
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (selectedItem) {
      setFormData({
        general: {
          firstName: selectedItem.general?.firstName || "",
          lastName: selectedItem.general?.lastName || "",
          email: selectedItem.general?.email || "",
          phone: selectedItem.general?.phone || "",
          type: selectedItem.general?.type || "",
          companyId: selectedItem.general?.companyId || "",
          companyName: selectedItem.general?.companyName || "",
          bookerId: selectedItem.general?.bookerId || "",
          bookerName: selectedItem.general?.bookerName || "",
          bookingIds: selectedItem.general?.bookingIds || [],
          bookingNames: selectedItem.general?.bookingNames || [],
          contactIds: selectedItem.general?.contactIds || [],
          relatedContacts: selectedItem.general?.relatedContacts || [],
        },
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
  };

  return (
    <>
      <form onSubmit={handleSave} className="contact-form">
        <div className="top-bar">
          <div className="top-bar__title">
            {selectedItem?._id ? "Contact Details" : "New Contact"}
          </div>
          <div className="top-bar__edit">
            {!isEditing && selectedItem?._id && (
              <Button icon={Edit} onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}

            {isEditing && (
              <>
                <Button
                  intent="secondary"
                  icon={X}
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  icon={Save}
                  type="submit"
                  disabled={
                    isSubmitting || Object.keys(pendingChanges).length === 0
                  }
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex">
          <div className="col">
            <RefField
              label="Company"
              value={formData.general.companyId}
              onChange={(value, displayValue) =>
                handleChange("general", "companyId", value, displayValue)
              }
              isEditing={isEditing}
              className={
                pendingChanges[`general.companyId`] ? "field-changed" : ""
              }
              collectionName="companies"
              displayFields={["name"]}
              selectedLabel={formData.general.companyName}
            />
            <TextField
              label="First Name"
              value={formData.general.firstName}
              onChange={(value) => handleChange("general", "firstName", value)}
              required
              isEditing={isEditing}
              className={
                pendingChanges[`general.firstName`] ? "field-changed" : ""
              }
            />
            <TextField
              label="Last Name"
              value={formData.general.lastName}
              onChange={(value) => handleChange("general", "lastName", value)}
              required
              isEditing={isEditing}
              className={
                pendingChanges[`general.lastName`] ? "field-changed" : ""
              }
            />
            <TextField
              label="E-mail"
              value={formData.general.email}
              onChange={(value) => handleChange("general", "email", value)}
              type="email"
              isEditing={isEditing}
              className={pendingChanges[`general.email`] ? "field-changed" : ""}
            />
            <TextField
              label="Phone"
              value={formData.general.phone}
              onChange={(value) => handleChange("general", "phone", value)}
              type="tel"
              isEditing={isEditing}
              className={pendingChanges[`general.phone`] ? "field-changed" : ""}
            />
            <DropdownField
              label="Type"
              value={formData.general.type}
              onChange={(value) => handleChange("general", "type", value)}
              options={TYPE_OPTIONS}
              required
              isEditing={isEditing}
            />

            <MultiRefField
              label="Related contacts"
              value={formData.general.contactIds}
              onChange={(values, displayValues) =>
                handleChange("general", "contactIds", values, displayValues)
              }
              required
              isEditing={isEditing}
              className={
                pendingChanges[`general.contactIds`] ? "field-changed" : ""
              }
              collectionName="contacts"
              displayFields={["general.firstName", "general.lastName"]}
              selectedLabels={formData.general.relatedContacts}
            />
            <p>Bookings work in progress should fetch the other way around*</p>
            <MultiRefField
              label="Bookings"
              value={formData.general.bookingIds}
              onChange={(values, displayValues) =>
                handleChange("general", "bookingIds", values, displayValues)
              }
              required
              isEditing={isEditing}
              className={
                pendingChanges[`general.bookingIds`] ? "field-changed" : ""
              }
              collectionName="bookings"
              displayFields={BOOKING_DISPLAY_FIELDS}
              selectedLabels={formData.general.bookingNames}
            />
          </div>
          <div className="col"></div>
        </div>
      </form>
    </>
  );
}
