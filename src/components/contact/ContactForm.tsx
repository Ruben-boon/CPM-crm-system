"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactsData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { MultiRefField } from "../fields/MultiRefField";
import { RefField } from "../fields/RefField";
import { searchDocuments } from "@/app/actions/crudActions";
import { useNavigation } from "@/app/layout";

interface ContactFormData {
  entityName: string;
  entityLabel: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  companyId: string;
  companyName: string;
  bookerId: string;
  bookerName: string;
  bookingIds: string[];
  bookingNames: string[];
  contactIds: string[];
  relatedContacts: string[];
}

const INITIAL_FORM_STATE: ContactFormData = {
  entityName: "", entityLabel: "", title: "", firstName: "", lastName: "",
  email: "", phone: "", role: "", companyId: "", companyName: "", 
  bookerId: "", bookerName: "", bookingIds: [], bookingNames: [], 
  contactIds: [], relatedContacts: []
};

const OPTIONS = {
  role: [
    { value: "booker", label: "Booker" },
    { value: "guest", label: "Guest" },
  ],
  title: [
    { value: "mr", label: "Mr." },
    { value: "ms", label: "Ms." },
  ]
};

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
  
  // Get the navigation context
  const { navigateTo } = useNavigation();

  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [companyName, setCompanyName] = useState<string>("");

  const showForm = selectedItem || isCreating;
  
  // Handle click on company to navigate to it
  const handleCompanyClick = () => {
    if (formData.companyId) {
      navigateTo('/companies', formData.companyId);
    }
  };

  // Reset creating state when selected item changes
  useEffect(() => {
    if (selectedItem) setIsCreating(false);
  }, [selectedItem]);
  
  // Load company name when needed
  useEffect(() => {
    const loadCompanyName = async () => {
      if (formData.companyId) {
        try {
          const results = await searchDocuments("companies", formData.companyId, "_id");
          if (Array.isArray(results) && results.length > 0) {
            setCompanyName(results[0].name || "");
          }
        } catch (error) {
          console.error("Error loading company:", error);
        }
      } else {
        setCompanyName("");
      }
    };
    
    loadCompanyName();
  }, [formData.companyId]);

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
        companyId: selectedItem.general?.companyId || "",
        companyName: "",
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
      ...(displayValue && field === "companyId" ? { companyName: displayValue } : {}),
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
          companyId: formData.companyId,
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
        companyId: selectedItem.general?.companyId || "",
        companyName: selectedItem.general?.companyName || "",
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
          <DropdownField
            label="Role"
            options={OPTIONS.role}
            {...fieldProps("role", true)}
          />
          
          <RefField
            label="Company"
            value={formData.companyId}
            onChange={(value, displayValue) => handleChange("companyId", value, displayValue)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["companyId"] ? "field-changed" : ""}
            collectionName="companies"
            displayFields={["name"]}
            selectedLabel={companyName}
          />
        </div>
        <div className="col">
          {/* Custom field with clickable company link when in view mode */}
          {!isEditing && !isCreating && formData.companyId && companyName && (
            <div className="company-link-container">
              <div 
                className="company-link" 
                onClick={handleCompanyClick}
              >
                <span>{companyName}</span>
                <ExternalLink size={14} className="company-link-icon" />
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}