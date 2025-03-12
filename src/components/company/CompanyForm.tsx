"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useCompaniesData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { RefField } from "../fields/RefField";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";
import { RelatedItems } from "../fields/RelatedItems";

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

export function CompanyForm() {
  const {
    selectedItem,
    updateItem,
    createItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
  } = useCompaniesData();

  const router = useRouter();

  const [formData, setFormData] = useState<CompanyFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRelatedItemsLoading, setIsRelatedItemsLoading] = useState(false);



  // Load company data when component mounts or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(false);
      if (!selectedItem._id) {
        setIsCreating(true);
        setIsEditing(true);
      }

      // Set form data
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

  const handleChange = (
    field: keyof CompanyFormData,
    value: string | string[],
    displayValue?: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPendingChanges((prev) => ({
      ...prev,
      [field]: {
        oldValue: selectedItem?.[field] || "",
        newValue: value,
      },
    }));
  };

  const handleClose = () => {
    // Reset state
    setPendingChanges({});
    if (isEditing) {
      setIsEditing(false);
    }

    // Navigate
    router.push("/companies");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemData = {
        ...selectedItem,
        ...formData,
      };

      const isUpdate = !!selectedItem?._id;
      const success = isUpdate
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(
          `Company ${isUpdate ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});

        // For new companies, navigate to the detail view with the new ID
        if (!isUpdate && itemData._id) {
          router.push(`/companies/${itemData._id}`);
        }
      } else {
        toast.error(`Failed to ${isUpdate ? "update" : "create"} company`);
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
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);

    if (isCreating) {
      router.push("/companies");
    }
  };

  // Handle navigation to child company
  const handleRelationClick = (companyId: string, collection:string) => {
    router.push(`/${collection}/${companyId}`);
  };



  // Helper function to create field props
  const fieldProps = (field: keyof CompanyFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing || isCreating,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  return (
    <div className="detail-wrapper">
      {!isEditing && <LoadingSpinner isLoading={isRelatedItemsLoading} />}
    {/* this is reallllly janky atm if you double click it get stuck for example make this better */}
      <form onSubmit={handleSave} className="company-form">
        <div className="top-bar">
          <div className="top-bar__title">
            {selectedItem?._id ? "Company Details" : "New Company"}
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
                    (!isCreating && Object.keys(pendingChanges).length === 0) 
                  }
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="detail-content">
          <div className="col-third">
            <TextField label="Name" {...fieldProps("name", true)} />
            <TextField label="Address" {...fieldProps("address")} />
            <TextField label="Postal Code" {...fieldProps("postal_code")} />
            <TextField label="City" {...fieldProps("city")} />
            <TextField label="Country" {...fieldProps("country")} />
            <RefField
              label="Parent Company"
              value={formData.parentCompanyId}
              onChange={(value, displayValue) =>
                handleChange("parentCompanyId", value, displayValue)
              }
              isEditing={isEditing || isCreating}
              className={
                pendingChanges["parentCompanyId"] ? "field-changed" : ""
              }
              collectionName="companies"
              displayFields={["name"]}
            />

            {/* Child Companies - only show when there's a company selected and we're not creating a new one */}
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
            {selectedItem?._id && !isCreating && (
              <div className="related-section">
                <RelatedItems
                  id={selectedItem._id}
                  referenceField="general.companyId"
                  collectionName="contacts"
                  displayFields={[{ path: "general.title" },{ path: "general.firstName" }, { path: "general.lastName"}]}
                  title="Contacts"
                  emptyMessage="No child companies found"
                  onItemClick={handleRelationClick}
                />
              </div>
            )}
          </div>
          <div className="col-third">
            {/* You can add additional fields or sections here */}
          </div>
        </div>
      </form>

      <style jsx>{`
        .related-section {
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
