"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, Plus, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useCompaniesData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { RefField } from "../fields/RefField";
import { updateCompanyRelationship } from "@/app/actions/updateCompanyRelations";
import { searchDocuments } from "@/app/actions/crudActions";
import { useNavigation } from "@/app/layout"; // Import the navigation hook

interface CompanyFormData {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  parentCompany: string;
  childCompany: string;
}

const INITIAL_FORM_STATE: CompanyFormData = {
  name: "",
  address: "",
  postal_code: "",
  city: "",
  country: "",
  parentCompany: "",
  childCompany: ""
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
    searchItems
  } = useCompaniesData();
  
  // Get the navigation context
  const { navigateTo } = useNavigation();

  const [formData, setFormData] = useState<CompanyFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [originalParentCompany, setOriginalParentCompany] = useState<string>("");
  
  // State for current company names
  const [parentCompanyName, setParentCompanyName] = useState<string>("");
  const [childCompanyName, setChildCompanyName] = useState<string>("");

  const showForm = selectedItem || isCreating;
  
  // Handle click on child company to navigate to it
  const handleChildCompanyClick = () => {
    if (formData.childCompany) {
      navigateTo('/companies', formData.childCompany);
    }
  };

  // Load company names when needed
  useEffect(() => {
    const loadRelatedCompanyNames = async () => {
      // Load parent company name
      if (formData.parentCompany) {
        try {
          const results = await searchDocuments("companies", formData.parentCompany, "_id");
          if (Array.isArray(results) && results.length > 0) {
            setParentCompanyName(results[0].name || "");
          }
        } catch (error) {
          console.error("Error loading parent company:", error);
        }
      } else {
        setParentCompanyName("");
      }
      
      // Load child company name
      if (formData.childCompany) {
        try {
          const results = await searchDocuments("companies", formData.childCompany, "_id");
          if (Array.isArray(results) && results.length > 0) {
            setChildCompanyName(results[0].name || "");
          }
        } catch (error) {
          console.error("Error loading child company:", error);
        }
      } else {
        setChildCompanyName("");
      }
    };
    
    loadRelatedCompanyNames();
  }, [formData.parentCompany, formData.childCompany]);

  useEffect(() => {
    if (selectedItem) {
      setIsCreating(false);
      setOriginalParentCompany(selectedItem.parentCompany || "");
    }
  }, [selectedItem]);

  const handleChange = (field: keyof CompanyFormData, value: string, displayValue?: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Immediately update display name state for responsive UI
    if (field === "parentCompany" && displayValue) {
      setParentCompanyName(displayValue);
    }

    setPendingChanges((prev) => ({
      ...prev,
      [field]: {
        oldValue: selectedItem?.[field] || "",
        newValue: value,
      },
    }));
  };

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name || "",
        address: selectedItem.address || "",
        postal_code: selectedItem.postal_code || "",
        city: selectedItem.city || "",
        country: selectedItem.country || "",
        parentCompany: selectedItem.parentCompany || "",
        childCompany: selectedItem.childCompany || ""
      });
    }
  }, [selectedItem]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemData = {
        ...selectedItem,
        ...formData
      };

      const success = selectedItem?._id
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        // After successfully saving, update relationship if parent company has changed
        if (selectedItem?._id && formData.parentCompany !== originalParentCompany) {
          
          const relationshipResult = await updateCompanyRelationship(
            selectedItem._id,
            formData.parentCompany || null
          );
          
          if (!relationshipResult.success) {
            toast.error(`Company saved but relationship update failed: ${relationshipResult.error}`);
          } else {
            // Show specific success message based on whether adding or removing relationship
            if (formData.parentCompany) {
              if (originalParentCompany) {
                toast.success(`Successfully changed parent company relationship`);
              } else {
                toast.success(`Successfully set parent company relationship`);
              }
            } else if (originalParentCompany) {
              toast.success(`Successfully removed parent company relationship`);
            }
            
            // Refresh the data to get the updated relationships
            await searchItems();
          }
        }
        
        toast.success(
          `Company ${selectedItem?._id ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});
      } else {
        toast.error(
          `Failed to ${selectedItem?._id ? "update" : "create"} company`
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
        name: selectedItem.name || "",
        address: selectedItem.address || "",
        postal_code: selectedItem.postal_code || "",
        city: selectedItem.city || "",
        country: selectedItem.country || "",
        parentCompany: selectedItem.parentCompany || "",
        childCompany: selectedItem.childCompany || ""
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);
  };

  if (!showForm) {
    return (
      <div className="company-form-empty">
        {/* <Button icon={Plus} onClick={() => setIsCreating(true)}>
          New Company
        </Button> */}
      </div>
    );
  }

  // Create a clickable link component for the child company
  const ChildCompanyLink = () => {
    if (!formData.childCompany || !childCompanyName) {
      return <span className="empty-reference">-</span>;
    }
    
    return (
      <div 
        className="company-link" 
        onClick={handleChildCompanyClick}
      >
        <span>{childCompanyName}</span>
        <ExternalLink size={14} className="company-link-icon" />
      </div>
    );
  };

  return (
    <form onSubmit={handleSave} className="company-form">
      <div className="top-bar">
        <div className="top-bar__title">
          {selectedItem?._id ? "Company Details" : "New Company"}
        </div>
        <div className="top-bar__edit">
          {!isEditing && selectedItem?._id && (
            <Button icon={Edit} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
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
                  isSubmitting || (!isCreating && Object.keys(pendingChanges).length === 0)
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
            label="Parent Company"
            value={formData.parentCompany}
            onChange={(value, displayValue) => handleChange("parentCompany", value, displayValue)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["parentCompany"] ? "field-changed" : ""}
            collectionName="companies"
            displayFields={["name"]}
            selectedLabel={parentCompanyName}
          />
          
          {/* Custom field with clickable child company link */}
          <div className="ref-field">
            <label className="field-label">
              Child Company
            </label>
            <div className="ref-field-container">
              <div className="ref-field-single">
                <div className={`read-only flex-1 ${pendingChanges["childCompany"] ? "field-changed" : ""}`}>
                  <ChildCompanyLink />
                </div>
                {isEditing && (
                  <span><i>This field is automatically set and cannot be edited.</i></span>
                )}
              </div>
            </div>
          </div>
          
          <TextField
            label="Name"
            value={formData.name}
            onChange={(value) => handleChange("name", value)}
            required
            isEditing={isEditing || isCreating}
            className={pendingChanges["name"] ? "field-changed" : ""}
          />
          <TextField
            label="Address"
            value={formData.address}
            onChange={(value) => handleChange("address", value)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["address"] ? "field-changed" : ""}
          />
          <TextField
            label="Postal Code"
            value={formData.postal_code}
            onChange={(value) => handleChange("postal_code", value)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["postal_code"] ? "field-changed" : ""}
          />
          <TextField
            label="City"
            value={formData.city}
            onChange={(value) => handleChange("city", value)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["city"] ? "field-changed" : ""}
          />
          <TextField
            label="Country"
            value={formData.country}
            onChange={(value) => handleChange("country", value)}
            isEditing={isEditing || isCreating}
            className={pendingChanges["country"] ? "field-changed" : ""}
          />
        </div>
        <div className="col">
       
        </div>
      </div>
    </form>
  );
}