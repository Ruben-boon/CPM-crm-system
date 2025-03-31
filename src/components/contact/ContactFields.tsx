
"use client";
import { useState, useEffect } from "react";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { toast } from "sonner";

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
  remarks: string;
}

interface FieldLoadingState {
  companyId: boolean;
}

const INITIAL_FORM_STATE: ContactFormData = {
  entityName: "",
  entityLabel: "",
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  companyId: "",
  remarks: "",
};

const INITIAL_LOADING_STATE: FieldLoadingState = {
  companyId: false,
};

const OPTIONS = {
  role: [
    { value: "booker", label: "Booker" },
    { value: "guest", label: "Guest" },
  ],
  title: [
    { value: "mr", label: "Mr." },
    { value: "ms", label: "Ms." },
  ],
};

interface ContactFieldsProps {
  selectedItem: any;
  isEditing: boolean;
  pendingChanges: Record<string, { oldValue: any; newValue: any }>;
  setPendingChanges: (changes: Record<string, { oldValue: any; newValue: any }>) => void;
  onFormReset?: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  onAllFieldsLoadedChange: (allLoaded: boolean) => void;
}

export function ContactFields({
  selectedItem,
  isEditing,
  pendingChanges,
  setPendingChanges,
  onFormReset,
  onLoadingChange,
  onAllFieldsLoadedChange
}: ContactFieldsProps) {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(INITIAL_LOADING_STATE);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    const isCompanyLoaded = !formData.companyId || fieldsLoaded.companyId;
    return isCompanyLoaded;
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    const shouldShowLoading = formData.companyId && !fieldsLoaded.companyId;
    setIsFormLoading(shouldShowLoading);
    onLoadingChange(shouldShowLoading);
    onAllFieldsLoadedChange(checkAllFieldsLoaded());
  }, [formData.companyId, fieldsLoaded.companyId]);

  // Load form data when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setFieldsLoaded(INITIAL_LOADING_STATE);
      setIsFormLoading(!!selectedItem.general?.companyId);
      onLoadingChange(!!selectedItem.general?.companyId);

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
        remarks: selectedItem.general?.remarks || "",
      });
    }
  }, [selectedItem]);

  // Provide method to reset form data
  useEffect(() => {
    if (onFormReset) {
      // Define and expose the reset function
      const resetForm = () => {
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
            remarks: selectedItem.general?.remarks || "",
          });
        } else {
          setFormData(INITIAL_FORM_STATE);
        }
      };

      // Make it available to parent
      onFormReset = resetForm;
    }
  }, [selectedItem, onFormReset]);

  // Update the parent context's selectedItem with our form data changes
  useEffect(() => {
    if (selectedItem) {
      selectedItem.entityName = formData.entityName;
      selectedItem.entityLabel = formData.entityLabel;
      
      if (!selectedItem.general) {
        selectedItem.general = {};
      }
      
      selectedItem.general.title = formData.title;
      selectedItem.general.firstName = formData.firstName;
      selectedItem.general.lastName = formData.lastName;
      selectedItem.general.email = formData.email;
      selectedItem.general.phone = formData.phone;
      selectedItem.general.role = formData.role;
      selectedItem.general.companyId = formData.companyId;
      selectedItem.general.remarks = formData.remarks;
    }
  }, [formData, selectedItem]);

  const handleChange = (
    field: keyof ContactFormData,
    value: string | string[],
    displayValue?: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "entityName"
        ? { entityLabel: displayValue }
        : {}),
    }));

    if (field === "companyId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        companyId: false,
      }));
      setIsFormLoading(!!value);
      onLoadingChange(!!value);
    }

    setPendingChanges((prev) => {
      const oldValue =
        field === "companyId" ||
        field === "title" ||
        field === "firstName" ||
        field === "lastName" ||
        field === "email" ||
        field === "phone" ||
        field === "role" ||
        field === "remarks"
          ? selectedItem?.general?.[field] || ""
          : selectedItem?.[field] || "";

      return {
        ...prev,
        [field]: {
          oldValue,
          newValue: value,
        },
      };
    });
  };

  const handleCompanyLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Company field load error:", error);
      toast.error(`Error loading company information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      companyId: loaded,
    }));

    setIsFormLoading(false);
    onLoadingChange(false);
    onAllFieldsLoadedChange(checkAllFieldsLoaded());
  };

  // Helper function to create field props
  const fieldProps = (field: keyof ContactFormData, required = false) => ({
    value: formData[field] as string,
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  return (
    <>
      <div className="col-half">
        <DropdownField
          label="Title"
          options={OPTIONS.title}
          {...fieldProps("title")}
        />
        <TextField label="First Name" {...fieldProps("firstName", true)} />
        <TextField label="Last Name" {...fieldProps("lastName", true)} />
        <TextField label="E-mail" type="email" {...fieldProps("email")} />
        <TextField label="Phone" type="tel" {...fieldProps("phone")} />
        <DropdownField
          label="Role"
          options={OPTIONS.role}
          {...fieldProps("role", true)}
        />
        <RefField
          label="Company"
          value={formData.companyId}
          onChange={(value, displayValue) =>
            handleChange("companyId", value, displayValue)
          }
          isEditing={isEditing}
          className={pendingChanges["companyId"] ? "field-changed" : ""}
          collectionName="companies"
          displayFields={["name"]}
          onLoadComplete={handleCompanyLoadComplete}
        />
      </div>
      <div className="col-half">
        <TextField 
          label="Remarks" 
          multiline 
          rows={4} 
          {...fieldProps("remarks")} 
        />
      </div>
    </>
  );
}