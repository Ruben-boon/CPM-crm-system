"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactsData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefFields";
import { MultiRefField } from "../fields/MultiRefField";
import { searchDocuments } from "@/app/actions/crudActions";

interface SearchResult {
  _id: string;
  [key: string]: any;
}

interface ContactFormData {
  general: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: string;
    bookerId: string;
    bookerName: string; // UI only
    bookingIds: string[]; // Saved to DB
    bookingNames: string[]; // UI only
    contactIds: string[]; // Saved to DB
    relatedContacts: string[]; // UI only
  };
}

const INITIAL_FORM_STATE: ContactFormData = {
  general: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "",
    bookerId: "",
    bookerName: "",
    bookingIds: [],
    bookingNames: [],
    contactIds: [],
    relatedContacts: [],
  },
};

const TYPE_OPTIONS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
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

  const getNestedValue = (obj: any, path: string) => {
    const parts = path.split(".");
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  };

  const formatDisplayValue = (result: SearchResult) => {
    return BOOKING_DISPLAY_FIELDS.map((field) => result[field])
      .filter(Boolean)
      .join(" ");
  };

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
      const loadReferenceDetails = async () => {
        const updates: Partial<typeof formData.general> = {};

        // Load single booking details
        if (selectedItem.general?.bookerId) {
          try {
            const results = await searchDocuments<SearchResult>(
              "bookings",
              selectedItem.general.bookerId,
              "_id"
            );
            if (results.length > 0) {
              updates.bookerName = formatDisplayValue(results[0]);
            }
          } catch (error) {
            console.error("Failed to load booking details:", error);
          }
        }

        // Load multiple bookings details
        if (selectedItem.general?.bookingIds?.length) {
          try {
            const loadPromises = selectedItem.general.bookingIds.map((id) =>
              searchDocuments<SearchResult>("bookings", id, "_id")
            );
            const results = await Promise.all(loadPromises);
            updates.bookingNames = results
              .map((result) => result[0])
              .filter(Boolean)
              .map((booking) => formatDisplayValue(booking));
          } catch (error) {
            console.error("Failed to load bookings details:", error);
          }
        }

        // Load related contacts details
        if (selectedItem.general?.contactIds?.length) {
          try {
            const loadPromises = selectedItem.general.contactIds.map((id) =>
              searchDocuments<SearchResult>("contacts", id, "_id")
            );
            const results = await Promise.all(loadPromises);
            updates.relatedContacts = results
              .map((result) => result[0])
              .filter(Boolean)
              .map((contact) =>
                ["general.firstName", "general.lastName"]
                  .map((field) => getNestedValue(contact, field))
                  .filter(Boolean)
                  .join(" ")
              );
          } catch (error) {
            console.error("Failed to load contact details:", error);
          }
        }

        if (Object.keys(updates).length) {
          setFormData((prev) => ({
            ...prev,
            general: {
              ...prev.general,
              ...updates,
            },
          }));
        }
      };

      setFormData({
        general: {
          firstName: selectedItem.general?.firstName || "",
          lastName: selectedItem.general?.lastName || "",
          email: selectedItem.general?.email || "",
          phone: selectedItem.general?.phone || "",
          type: selectedItem.general?.type || "",
          bookerId: selectedItem.general?.bookerId || "",
          bookerName: "",
          bookingIds: selectedItem.general?.bookingIds || [],
          bookingNames: [],
          contactIds: selectedItem.general?.contactIds || [],
          relatedContacts: [],
        },
      });

      loadReferenceDetails();
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
              label="Email"
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
              label="type"
              value={formData.general.type}
              onChange={(value) => handleChange("general", "type", value)}
              options={TYPE_OPTIONS}
              required
              isEditing={isEditing}
              className={pendingChanges[`general.type`] ? "field-changed" : ""}
            />
            <RefField
              label="Booking"
              value={formData.general.bookerId}
              onChange={(value, displayValue) =>
                handleChange("general", "bookerId", value, displayValue)
              }
              required
              isEditing={isEditing}
              className={
                pendingChanges[`general.bookerId`] ? "field-changed" : ""
              }
              collectionName="bookings"
              displayFields={BOOKING_DISPLAY_FIELDS}
              selectedLabel={formData.general.bookerName}
            />
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
          </div>
          <div className="col"></div>
        </div>
      </form>
    </>
  );
}
