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
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";

interface CompanyFormData {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  parentCompanyId: string;
  childCompaniesIds: string[];
  contactIds: string[];
}

interface Contact {
  _id: string;
  general: {
    firstName: string;
    lastName: string;
    email?: string;
    type?: string;
  };
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
  childCompaniesIds: [],
  contactIds: [],
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
    searchItems,
    selectItem,
  } = useCompaniesData();

  const router = useRouter();

  const [formData, setFormData] = useState<CompanyFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [originalParentCompanyId, setOriginalParentCompanyId] =
    useState<string>("");
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(
    INITIAL_LOADING_STATE
  );
  const [isFormLoading, setIsFormLoading] = useState(false);

  // State for current company names
  const [parentCompanyName, setParentCompanyName] = useState<string>("");

  // State for associated contacts
  const [associatedContacts, setAssociatedContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    return !formData.parentCompanyId || fieldsLoaded.parentCompanyId;
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    const shouldShowLoading =
      formData.parentCompanyId && !fieldsLoaded.parentCompanyId;
    setIsFormLoading(shouldShowLoading);
  }, [formData.parentCompanyId, fieldsLoaded]);

  // Handle click on a child company to navigate to it
  const handleChildCompanyClick = async (childId: string) => {
    try {
      const results = await searchDocuments("companies", childId, "_id");
      if (Array.isArray(results) && results.length > 0) {
        selectItem(results[0]);
      }
    } catch (error) {
      console.error("Error selecting child company:", error);
    }
  };

  // Handle click on contact to navigate to it
  const handleContactClick = async (contactId: string) => {
    if (contactId) {
      try {
        const results = await searchDocuments("contacts", contactId, "_id");
        if (Array.isArray(results) && results.length > 0) {
          // Since we can't navigate directly, just show a toast message
          toast.info(
            `Contact: ${results[0].general?.firstName} ${results[0].general?.lastName}`
          );
        }
      } catch (error) {
        console.error("Error loading contact:", error);
      }
    }
  };

  // Load company names when component mounts or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(false);
      if (!selectedItem._id) {
        setIsCreating(true);
        setIsEditing(true);
      }

      // Reset loading state
      setFieldsLoaded(INITIAL_LOADING_STATE);

      // Show loading if item has parent company
      setIsFormLoading(!!selectedItem.parentCompanyId);

      setOriginalParentCompanyId(selectedItem.parentCompanyId || "");

      // Set form data
      setFormData({
        name: selectedItem.name || "",
        address: selectedItem.address || "",
        postal_code: selectedItem.postal_code || "",
        city: selectedItem.city || "",
        country: selectedItem.country || "",
        parentCompanyId: selectedItem.parentCompanyId || "",
        childCompaniesIds: selectedItem.childCompaniesIds || [],
        contactIds: selectedItem.contactIds || [],
      });
    }
  }, [selectedItem]);

  // Load contacts that reference this company
  // Load contacts for the company
  useEffect(() => {
    const loadAssociatedContacts = async () => {
      if (!selectedItem?._id || !selectedItem.contactIds?.length) {
        setAssociatedContacts([]);
        return;
      }

      setIsLoadingContacts(true);
      try {
        // Get contact details for each contact ID
        const contactPromises = selectedItem.contactIds.map((id) =>
          searchDocuments<Contact>("contacts", id, "_id")
        );

        const contactResults = await Promise.all(contactPromises);
        const contacts = contactResults
          .flat()
          .filter((contact) => contact && contact._id);

        setAssociatedContacts(contacts);
      } catch (error) {
        console.error("Error loading associated contacts:", error);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    loadAssociatedContacts();
  }, [selectedItem?._id, selectedItem?.contactIds]);

  const handleChange = (
    field: keyof CompanyFormData,
    value: string | string[],
    displayValue?: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Immediately update display name state for responsive UI
    if (field === "parentCompanyId" && typeof displayValue === "string") {
      setParentCompanyName(displayValue);
    }

    // If changing a reference field, update loading state
    if (field === "parentCompanyId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        parentCompanyId: false,
      }));
      setIsFormLoading(!!value);
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

    setIsFormLoading(false);
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
        // After successfully saving, update relationship if parent company has changed
        if (
          selectedItem?._id &&
          formData.parentCompanyId !== originalParentCompanyId
        ) {
          const relationshipResult = await updateCompanyRelationship(
            selectedItem._id,
            formData.parentCompanyId || null
          );

          if (!relationshipResult.success) {
            toast.error(
              `Company saved but relationship update failed: ${relationshipResult.error}`
            );
          } else {
            // Show specific success message based on whether adding or removing relationship
            if (formData.parentCompanyId) {
              if (originalParentCompanyId) {
                toast.success(
                  `Successfully changed parent company relationship`
                );
              } else {
                toast.success(`Successfully set parent company relationship`);
              }
            } else if (originalParentCompanyId) {
              toast.success(`Successfully removed parent company relationship`);
            }

            // Refresh the data to get the updated relationships
            await searchItems();
          }
        }

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
        childCompaniesIds: selectedItem.childCompaniesIds || [],
        contactIds: selectedItem.contactIds || [],
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

  // Helper function to create field props
  const fieldProps = (field: keyof CompanyFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing || isCreating,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  // Create child companies list component
  const ChildCompaniesList = () => {
    const [childCompanyNames, setChildCompanyNames] = useState<{
      [key: string]: string;
    }>({});

    // Load child company names
    useEffect(() => {
      const loadChildCompanyNames = async () => {
        if (!formData.childCompaniesIds?.length) return;

        const companyPromises = formData.childCompaniesIds.map(async (id) => {
          try {
            const results = await searchDocuments("companies", id, "_id");
            if (Array.isArray(results) && results.length > 0) {
              return { id, name: results[0].name || "" };
            }
            return { id, name: "" };
          } catch (error) {
            console.error(`Error loading child company ${id}:`, error);
            return { id, name: "" };
          }
        });

        const companyResults = await Promise.all(companyPromises);
        const namesMap = companyResults.reduce((acc, { id, name }) => {
          if (id && name) acc[id] = name;
          return acc;
        }, {} as { [key: string]: string });

        setChildCompanyNames(namesMap);
      };

      loadChildCompanyNames();
    }, [formData.childCompaniesIds]);

    if (!formData.childCompaniesIds?.length) {
      return <span className="empty-reference">-</span>;
    }

    return (
      <div className="selected-items">
        {formData.childCompaniesIds.map((id) => (
          <div
            key={id}
            className="selected-item company-link"
            onClick={() => handleChildCompanyClick(id)}
          >
            <span>{childCompanyNames[id] || id}</span>
            <ExternalLink size={14} className="company-link-icon" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="detail-wrapper">
      {isFormLoading && <LoadingSpinner isLoading />}
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
        <div className="detail-content">
          <div className="col-third">
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
              selectedLabel={parentCompanyName}
              onLoadComplete={handleParentCompanyLoadComplete}
            />

            {/* Child Companies Field */}
            <div className="ref-field">
              <label className="field-label">Child Companies</label>
              <div className="ref-field-container">
                <div className="ref-field-single">
                  <div
                    className={`read-only flex-1 ${
                      pendingChanges["childCompaniesIds"] ? "field-changed" : ""
                    }`}
                  >
                    <ChildCompaniesList />
                  </div>
                  {isEditing && (
                    <span>
                      <i>
                        This field is automatically set and cannot be edited.
                      </i>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Associated Contacts Section */}
            <div className="ref-field multi-ref-field">
              <label className="field-label">Associated Contacts</label>
              <div className="ref-field-container">
                {isLoadingContacts ? (
                  <div className="loading-indicator">Loading contacts...</div>
                ) : associatedContacts.length > 0 ? (
                  <div className="selected-items">
                    {associatedContacts.map((contact) => (
                      <div
                        key={contact._id}
                        className="selected-item company-link"
                        onClick={() => handleContactClick(contact._id)}
                      >
                        <span>
                          {contact.general.firstName} {contact.general.lastName}
                          {contact.general.email &&
                            ` (${contact.general.email})`}
                        </span>
                        <ExternalLink size={14} className="company-link-icon" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="read-only">
                    <span className="empty-reference">
                      No associated contacts
                    </span>
                  </div>
                )}
                {isEditing && (
                  <span>
                    <i>This field is automatically set and cannot be edited.</i>
                  </span>
                )}
              </div>
            </div>

            <TextField label="Name" {...fieldProps("name", true)} />
            <TextField label="Address" {...fieldProps("address")} />
            <TextField label="Postal Code" {...fieldProps("postal_code")} />
            <TextField label="City" {...fieldProps("city")} />
            <TextField label="Country" {...fieldProps("country")} />
          </div>
          <div className="col">
            {/* Add additional fields here if needed */}
          </div>
        </div>
      </form>
      <style jsx>{`
        .selected-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .selected-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          border-radius: 4px;
          background-color: #f9f9f9;
          border: 1px solid #e0e0e0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .selected-item:hover {
          background-color: #f0f0f0;
        }

        .company-link {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--accent-color);
        }

        .company-link:hover {
          text-decoration: underline;
        }

        .company-link-icon {
          opacity: 0.7;
        }

        .loading-indicator {
          font-style: italic;
          color: #666;
          padding: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
