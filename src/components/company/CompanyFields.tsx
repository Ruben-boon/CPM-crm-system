"use client";
import { useState, useEffect } from "react";
import { TextField } from "../fields/TextField";
import { RefField } from "../fields/RefField";
import { RelatedItems } from "../fields/RelatedItems";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CompanyFormData {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  parentCompanyId: string;
}

interface FieldLoadingState {
  parentCompanyId: boolean;
}

const INITIAL_FORM_STATE: CompanyFormData = {
  name: "",
  address: "",
  postal_code: "",
  city: "",
  country: "",
  parentCompanyId: "",
};

const INITIAL_LOADING_STATE: FieldLoadingState = {
  parentCompanyId: false,
};

interface CompanyFieldsProps {
  selectedItem: any;
  isEditing: boolean;
  pendingChanges: Record<string, { oldValue: any; newValue: any }>;
  setPendingChanges: (
    changes: Record<string, { oldValue: any; newValue: any }>
  ) => void;
  onFormReset?: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  onAllFieldsLoadedChange: (allLoaded: boolean) => void;
}

export function CompanyFields({
  selectedItem,
  isEditing,
  pendingChanges,
  setPendingChanges,
  onFormReset,
  onLoadingChange,
  onAllFieldsLoadedChange,
}: CompanyFieldsProps) {
  const [formData, setFormData] = useState<CompanyFormData>(INITIAL_FORM_STATE);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(
    INITIAL_LOADING_STATE
  );
  const [isRelatedItemsLoading, setIsRelatedItemsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    const isParentCompanyLoaded =
      !formData.parentCompanyId || fieldsLoaded.parentCompanyId;
    return isParentCompanyLoaded;
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    onLoadingChange(isRelatedItemsLoading);
    onAllFieldsLoadedChange(checkAllFieldsLoaded());
  }, [
    isRelatedItemsLoading,
    fieldsLoaded.parentCompanyId,
    formData.parentCompanyId,
  ]);

  // Load form data when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(!selectedItem._id);
      setFieldsLoaded(INITIAL_LOADING_STATE);

      setFormData({
        name: selectedItem.name || "",
        address: selectedItem.address || "",
        postal_code: selectedItem.postal_code || "",
        city: selectedItem.city || "",
        country: selectedItem.country || "",
        parentCompanyId: selectedItem.parentCompanyId || "",
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
            name: selectedItem.name || "",
            address: selectedItem.address || "",
            postal_code: selectedItem.postal_code || "",
            city: selectedItem.city || "",
            country: selectedItem.country || "",
            parentCompanyId: selectedItem.parentCompanyId || "",
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
      selectedItem.name = formData.name;
      selectedItem.address = formData.address;
      selectedItem.postal_code = formData.postal_code;
      selectedItem.city = formData.city;
      selectedItem.country = formData.country;
      selectedItem.parentCompanyId = formData.parentCompanyId;
    }
  }, [formData, selectedItem]);

  const handleChange = (
    field: keyof CompanyFormData,
    value: string,
    displayValue?: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "parentCompanyId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        parentCompanyId: false,
      }));
    }

    setPendingChanges((prev) => ({
      ...prev,
      [field]: {
        oldValue: selectedItem?.[field] || "",
        newValue: value,
      },
    }));
  };

  const handleParentCompanyLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Parent company field load error:", error);
      toast.error(`Error loading parent company information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      parentCompanyId: loaded,
    }));

    onAllFieldsLoadedChange(checkAllFieldsLoaded());
  };

  // Handle navigation to child company
  const handleRelationClick = (companyId: string, collection: string) => {
    router.push(`/${collection}/${companyId}`);
  };

  // Helper function to create field props
  const fieldProps = (field: keyof CompanyFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  return (
    <>
      <div className="col-half">
        <TextField label="Name" {...fieldProps("name", true)} />
        <TextField label="Address" {...fieldProps("address")} />
        <TextField label="Postal Code" {...fieldProps("postal_code")} />
        <TextField label="City" {...fieldProps("city")} />
        <TextField label="Country" {...fieldProps("country")} />
        <RefField
          label="Parent Company"
          value={formData.parentCompanyId}
          onChange={(value, displayValue) =>
            handleChange("parentCompanyId", value, displayValue as string)
          }
          isEditing={isEditing}
          className={pendingChanges["parentCompanyId"] ? "field-changed" : ""}
          collectionName="companies"
          displayFields={["name"]}
          onLoadComplete={handleParentCompanyLoadComplete}
        />
        {selectedItem?._id && !isCreating && (
          <div className="related-section">
            <RelatedItems
              id={selectedItem._id}
              referenceField="general.companyId"
              collectionName="contacts"
              displayFields={[
                { path: "general.title" },
                { path: "general.firstName" },
                { path: "general.lastName" },
              ]}
              title="Contacts"
              emptyMessage="No contacts found"
              onItemClick={handleRelationClick}
            />
          </div>
        )}
      </div>
      <div className="col-half">
        {selectedItem?._id && !isCreating && (
          <div className="related-section">
            <RelatedItems
              id={selectedItem._id}
              referenceField="parentCompanyId"
              collectionName="companies"
              displayFields={[{ path: "name" }, { path: "city" }]}
              title="Child Companies"
              emptyMessage="No child companies found"
              onItemClick={handleRelationClick}
              onLoadingChange={(loading) => setIsRelatedItemsLoading(loading)}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .related-section {
          margin-top: 2rem;
        }
      `}</style>
    </>
  );
}
