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
import { RadioField } from "../fields/RadioField";

interface ContactFormData {
  entityName: string;
  entityLabel: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  bookerId: string;
  bookerName: string;
  bookingIds: string[];
  bookingNames: string[];
  contactIds: string[];
  relatedContacts: string[];
}

const INITIAL_FORM_STATE: ContactFormData = {
  entityName: "", entityLabel: "", title: "", firstName: "", lastName: "",
  email: "", phone: "", role: "", bookerId: "", bookerName: "",
  bookingIds: [], bookingNames: [], contactIds: [], relatedContacts: []
};

const OPTIONS = {
  title: [
    { value: "mr", label: "Mr." },
    { value: "ms", label: "Ms." },
  ],
  role: [
    { value: "booker", label: "Booker" },
    { value: "guest", label: "Guest" },
    { value: "both", label: "Both" },
  ]
};

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
  const [isCreating, setIsCreating] = useState(false);

  const showForm = selectedItem || isCreating;

  // Reset creating state when selected item changes
  useEffect(() => {
    if (selectedItem) setIsCreating(false);
  }, [selectedItem]);

  // Load form data when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        entityName: selectedItem.entityName || "",
        entityLabel: selectedItem.entityLabel || "",
        title: selectedItem.general?.title || "",
        firstName: selectedItem.general?.firstName || "",
        lastName: selectedItem.general?.lastName || "",
        email: selectedItem.general?.email || "",
        phone: selectedItem.general?.phone || "",
        role: selectedItem.general?.role || "",
        bookerId: selectedItem.general?.bookerId || "",
        bookerName: "",
        bookingIds: selectedItem.general?.bookingIds || [],
        bookingNames: [],
        contactIds: selectedItem.general?.contactIds || [],
        relatedContacts: [],
      });
    }
  }, [selectedItem]);

  const handleChange = (field: keyof ContactFormData, value: string | string[], displayValue?: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "entityName" ? { entityLabel: displayValue } : {}),
      ...(displayValue && field === "bookerId" ? { bookerName: displayValue } : {}),
      ...(displayValue && field === "bookingIds" ? { bookingNames: displayValue } : {}),
      ...(displayValue && field === "contactIds" ? { relatedContacts: displayValue } : {}),
    }));

    setPendingChanges(prev => ({
      ...prev,
      [field]: {
        oldValue: selectedItem?.[field] || "",
        newValue: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemData = {
        ...selectedItem,
        entityName: formData.entityName,
        general: {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          bookerId: formData.bookerId,
          bookingIds: formData.bookingIds,
          contactIds: formData.contactIds,
        },
      };

      const isUpdate = !!selectedItem?._id;
      const success = isUpdate 
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(`Contact ${isUpdate ? "updated" : "created"} successfully`);
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});
      } else {
        toast.error(`Failed to ${isUpdate ? "update" : "create"} contact`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (selectedItem) {
      // Reset to current item data
      setFormData({
        entityName: selectedItem.entityName || "",
        entityLabel: selectedItem.entityLabel || "",
        title: selectedItem.general?.title || "",
        firstName: selectedItem.general?.firstName || "",
        lastName: selectedItem.general?.lastName || "",
        email: selectedItem.general?.email || "",
        phone: selectedItem.general?.phone || "",
        role: selectedItem.general?.role || "",
        bookerId: selectedItem.general?.bookerId || "",
        bookerName: selectedItem.general?.bookerName || "",
        bookingIds: selectedItem.general?.bookingIds || [],
        bookingNames: selectedItem.general?.bookingNames || [],
        contactIds: selectedItem.general?.contactIds || [],
        relatedContacts: selectedItem.general?.relatedContacts || [],
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);
  };

  if (!showForm) {
    return <div className="contact-form-empty"></div>;
  }

  // Helper function to create field props
  const fieldProps = (field: keyof ContactFormData, required = false) => ({
    value: formData[field] as string,
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing || isCreating,
    className: pendingChanges[field] ? "field-changed" : "",
    required
  });

  return (
    <form onSubmit={handleSave} className="contact-form">
      <div className="top-bar">
        <div className="top-bar__title">
          {selectedItem?._id ? "Contact Details" : "New Contact"}
        </div>
        <div className="top-bar__edit">
          {!isEditing && selectedItem?._id && (
            <Button icon={Edit} onClick={() => setIsEditing(true)}>Edit</Button>
          )}

          {(isEditing || isCreating) && (
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
                disabled={isSubmitting || (!isCreating && Object.keys(pendingChanges).length === 0)}
              >
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex">
        <div className="col">
          {/* <RefField
            label="Company"
            value={formData.entityName}
            onChange={(value, displayValue) => handleChange("entityName", value, displayValue)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["entityName"] ? "field-changed" : ""}
            collectionName="companies"
            displayFields={["entityName"]}
            selectedLabel={formData.entityLabel}
          /> */}
               <RadioField
            label="Role"
            options={OPTIONS.role}
            {...fieldProps("role", true)}
          />
          <DropdownField
            label="Title"
            options={OPTIONS.title}
            {...fieldProps("title")}
          />
          <TextField
            label="First Name"
            {...fieldProps("firstName", true)}
          />
          <TextField
            label="Last Name"
            {...fieldProps("lastName", true)}
          />
          <TextField
            label="E-mail"
            type="email"
            {...fieldProps("email")}
          />
          <TextField
            label="Phone"
            type="tel"
            {...fieldProps("phone")}
          />
     

          {/* <MultiRefField
            label="Related contacts"
            value={formData.contactIds}
            onChange={(values, displayValues) => handleChange("contactIds", values, displayValues)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["contactIds"] ? "field-changed" : ""}
            collectionName="contacts"
            displayFields={["general.firstName", "general.lastName"]}
            selectedLabels={formData.relatedContacts}
          /> */}
          {/* <MultiRefField
            label="Bookings"
            value={formData.bookingIds}
            onChange={(values, displayValues) => handleChange("bookingIds", values, displayValues)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["bookingIds"] ? "field-changed" : ""}
            collectionName="bookings"
            displayFields={BOOKING_DISPLAY_FIELDS}
            selectedLabels={formData.bookingNames}
          /> */}
        </div>
        <div className="col"></div>
      </div>
    </form>
  );
}