"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactsData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";

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
}

interface FieldLoadingState {
  companyId: boolean;
  // Add other ref fields here as needed
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

  const router = useRouter();

  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(
    INITIAL_LOADING_STATE
  );
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    // Only check if loading if there's a value that needs to be loaded
    const isCompanyLoaded = !formData.companyId || fieldsLoaded.companyId;
    return isCompanyLoaded;
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    // If we have a companyId value but it's not loaded yet
    const shouldShowLoading = formData.companyId && !fieldsLoaded.companyId;
    setIsFormLoading(shouldShowLoading);
  }, [formData.companyId, fieldsLoaded.companyId]);

  // Load form data when selected item changes
  useEffect(() => {
    console.log("useEffect fired");
    if (selectedItem) {
      // Handle creating/editing state
      setIsCreating(false);
      if (!selectedItem._id) {
        setIsCreating(true);
        setIsEditing(true);
      }

      // Reset loading state when selected item changes
      setFieldsLoaded(INITIAL_LOADING_STATE);

      // Show loading if the selected item has a companyId
      setIsFormLoading(!!selectedItem.general?.companyId);

      // Set form data
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
      });
    }
  }, [selectedItem]);

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

    console.log("handleChange fired");

    // If changing a reference field, update loading state
    if (field === "companyId") {
      // Reset the loaded state and show loading if there's a new value
      setFieldsLoaded((prev) => ({
        ...prev,
        companyId: false,
      }));
      setIsFormLoading(!!value);
    }

    // This is creating a pendingChanges record but not comparing against the right path
    setPendingChanges((prev) => {
      // Determine the correct path to check in selectedItem
      const oldValue =
        field === "companyId" ||
        field === "title" ||
        field === "firstName" ||
        field === "lastName" ||
        field === "email" ||
        field === "phone" ||
        field === "role"
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

    // Update form loading state after company is loaded
    setIsFormLoading(false);
  };

  const handleClose = () => {
    console.log("handleClose fired");

    // Reset state
    setPendingChanges({});
    if (isEditing) {
      setIsEditing(false);
    }

    // Navigate
    router.push("/contacts");
  };

  const handleSave = async (e: React.FormEvent) => {
    console.log("handleSave fired");

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
        },
      };

      const isUpdate = !!selectedItem?._id;
      const success = isUpdate
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(
          `Contact ${isUpdate ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});

        // For new contacts, navigate to the detail view with the new ID
        if (!isUpdate && itemData._id) {
          router.push(`/contacts/${itemData._id}`);
        }
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
    console.log("handleCancel fired");

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
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);

    if (isCreating) {
      router.push("/contacts");
    }
  };

  // Helper function to create field props
  const fieldProps = (field: keyof ContactFormData, required = false) => ({
    value: formData[field] as string,
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing || isCreating,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  return (
    <div className="detail-wrapper">
      {isFormLoading && <LoadingSpinner isLoading />}
      <form
        onSubmit={handleSave}
        className={`contact-form ${!isFormLoading ? "done-loading" : ""}`}
      >
        <div className="top-bar">
          <div className="top-bar__title">
            {selectedItem?._id ? "Contact Details" : "New Contact"}
          </div>
          <div className="top-bar__edit">
            {!isEditing && selectedItem?._id && (
              <>
                <Button icon={Edit} onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button
                  intent="ghost"
                  icon={X}
                  type="button"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </>
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
                  disabled={
                    isSubmitting ||
                    (!isCreating && Object.keys(pendingChanges).length === 0) ||
                    isFormLoading ||
                    !checkAllFieldsLoaded()
                  }
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="details-content">
          <div className="col-third">
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
              isEditing={isEditing || isCreating}
              className={pendingChanges["companyId"] ? "field-changed" : ""}
              collectionName="companies"
              displayFields={["name"]}
              onLoadComplete={handleCompanyLoadComplete}
            />
          </div>
          <div className="col-third"></div>
        </div>
      </form>
    </div>
  );
}
