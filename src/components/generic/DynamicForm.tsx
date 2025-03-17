"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X, Edit, Trash2 } from "lucide-react";
import Button from "@/components/common/Button";
import { TextField } from "@/components/fields/TextField";
import { DropdownField } from "@/components/fields/DropdownField";
import { RefField } from "@/components/fields/RefField";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { RelatedItems } from "@/components/fields/RelatedItems";
import { GenericDataContextType } from "@/context/GenericDataContext";
import { EntityConfig, FieldConfig, getFieldValue, setFieldValue } from "@/types/entityConfig";

// Delete confirmation dialog
function DeleteConfirmationDialog({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-dialog">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete {itemName || "this item"}?</p>
        <p className="warning-text">This action cannot be undone.</p>
        <div className="dialog-buttons">
          <Button intent="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button intent="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>

      <style jsx>{`
        .delete-confirmation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .delete-confirmation-dialog {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          width: 400px;
          max-width: 90vw;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }

        p {
          margin-bottom: 16px;
        }

        .warning-text {
          color: #e11d48;
          font-weight: 500;
        }

        .dialog-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

interface FieldLoadingState {
  [key: string]: boolean;
}

interface DynamicFormProps {
  context: GenericDataContextType;
}

export function DynamicForm({ context }: DynamicFormProps) {
  const {
    selectedItem,
    updateItem,
    createItem,
    deleteItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
    entityConfig
  } = context;

  const router = useRouter();

  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>({});
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isRelatedItemsLoading, setIsRelatedItemsLoading] = useState(false);
  
  // Delete functionality
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    const referenceFields = entityConfig.fields.filter(field => field.type === 'reference');
    
    return referenceFields.every(field => {
      const fieldName = field.path || field.name;
      const fieldValue = getFieldValue(formData, field);
      return !fieldValue || fieldsLoaded[fieldName];
    });
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    const referenceFields = entityConfig.fields.filter(field => field.type === 'reference');
    const isAnyFieldLoading = referenceFields.some(field => {
      const fieldName = field.path || field.name;
      const fieldValue = getFieldValue(formData, field);
      return fieldValue && !fieldsLoaded[fieldName];
    });
    
    setIsFormLoading(isAnyFieldLoading);
  }, [formData, fieldsLoaded, entityConfig.fields]);

  // Load item data when component mounts or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(false);
      if (!selectedItem._id) {
        setIsCreating(true);
        setIsEditing(true);
      }

      // Reset fields loaded state
      const newFieldsLoaded: FieldLoadingState = {};
      entityConfig.fields.forEach(field => {
        const fieldName = field.path || field.name;
        newFieldsLoaded[fieldName] = false;
      });
      setFieldsLoaded(newFieldsLoaded);
      
      // Initialize form data from selected item
      const newFormData: any = {};
      entityConfig.fields.forEach(field => {
        const value = getFieldValue(selectedItem, field);
        newFormData[field.path || field.name] = value || '';
      });
      
      setFormData(newFormData);

      // Check if we need to show form loading
      const referenceFields = entityConfig.fields.filter(field => field.type === 'reference');
      const isAnyFieldLoading = referenceFields.some(field => {
        const fieldName = field.path || field.name;
        return !!getFieldValue(selectedItem, field);
      });
      
      setIsFormLoading(isAnyFieldLoading);
    }
  }, [selectedItem, entityConfig.fields]);

  const handleChange = (
    field: FieldConfig,
    value: string | string[],
    displayValue?: string
  ) => {
    const fieldName = field.path || field.name;
    
    setFormData(prev => {
      // For nested fields
      if (field.nested && field.path) {
        const parts = field.path.split('.');
        const newData = { ...prev };
        let current = newData;
        
        // Create nested objects if they don't exist
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        // Set the value on the innermost object
        current[parts[parts.length - 1]] = value;
        return newData;
      }
      
      // For regular fields
      return { ...prev, [fieldName]: value };
    });

    // Handle reference field loading state
    if (field.type === 'reference') {
      setFieldsLoaded(prev => ({
        ...prev,
        [fieldName]: false
      }));
      setIsFormLoading(!!value);
    }

    // Track changes
    setPendingChanges(prev => {
      const oldValue = getFieldValue(selectedItem, field) || '';
      
      return {
        ...prev,
        [fieldName]: {
          oldValue,
          newValue: value,
        },
      };
    });
  };

  const handleReferenceLoadComplete = (field: FieldConfig, loaded: boolean, error?: string) => {
    const fieldName = field.path || field.name;
    
    if (error) {
      console.error(`${field.label} field load error:`, error);
      toast.error(`Error loading ${field.label.toLowerCase()} information`);
    }

    setFieldsLoaded(prev => ({
      ...prev,
      [fieldName]: loaded,
    }));
  };

  const handleClose = () => {
    // Reset state
    setPendingChanges({});
    if (isEditing) {
      setIsEditing(false);
    }

    // Navigate
    router.push(`/${entityConfig.name}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build the item data by combining existing data with form data
      const itemData = { ...selectedItem };
      
      // Update values from form data
      entityConfig.fields.forEach(field => {
        const fieldName = field.path || field.name;
        const fieldValue = formData[fieldName];
        
        if (field.nested && field.path) {
          const parts = field.path.split('.');
          let current = itemData;
          
          // Create nested objects if they don't exist
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
          
          // Set the value on the innermost object
          current[parts[parts.length - 1]] = fieldValue;
        } else {
          itemData[fieldName] = fieldValue;
        }
      });

      const isUpdate = !!selectedItem?._id;
      const success = isUpdate
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(
          `${entityConfig.displayName} ${isUpdate ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});

        // For new items, navigate to the detail view with the new ID
        if (!isUpdate && itemData._id) {
          router.push(`/${entityConfig.name}/${itemData._id}`);
        }
      } else {
        toast.error(`Failed to ${isUpdate ? "update" : "create"} ${entityConfig.displayName.toLowerCase()}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (selectedItem) {
      // Reset form data to current item
      const newFormData: any = {};
      entityConfig.fields.forEach(field => {
        const value = getFieldValue(selectedItem, field);
        newFormData[field.path || field.name] = value || '';
      });
      setFormData(newFormData);
    }
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);

    if (isCreating) {
      router.push(`/${entityConfig.name}`);
    }
  };

  const handleDeleteClick = (e) => {
    // If there's an event, prevent default behavior (like form submission)
    if (e) e.preventDefault();
    
    // Cancel editing mode first to avoid update conflict
    if (isEditing) {
      setIsEditing(false);
      setPendingChanges({});
    }
    
    // Show confirmation dialog
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem?._id) {
      toast.error("No item selected to delete");
      setShowDeleteConfirmation(false);
      return;
    }
  
    setIsDeleting(true);
    try {
      const success = await deleteItem(selectedItem._id);
      
      if (success) {
        toast.success(`${entityConfig.displayName} deleted successfully`);
        router.push(`/${entityConfig.name}`);
      } else {
        toast.error(`Failed to delete ${entityConfig.displayName.toLowerCase()}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Handle navigation to related items
  const handleRelationClick = (itemId: string, collection: string) => {
    router.push(`/${collection}/${itemId}`);
  };

  // Render specific field type 
  const renderField = (field: FieldConfig) => {
    const fieldName = field.path || field.name;
    const fieldValue = formData[fieldName] || '';
    const isFieldChanged = !!pendingChanges[fieldName];
    const className = isFieldChanged ? "field-changed" : "";
    
    const commonProps = {
      value: fieldValue,
      onChange: (value: string) => handleChange(field, value),
      isEditing: isEditing || isCreating,
      className,
      required: field.required,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <TextField
            key={fieldName}
            label={field.label}
            type={field.type}
            {...commonProps}
          />
        );
      
      case 'dropdown':
        if (!field.options) return null;
        return (
          <DropdownField
            key={fieldName}
            label={field.label}
            options={field.options}
            {...commonProps}
          />
        );
      
      case 'reference':
        if (!field.referenceConfig) return null;
        return (
          <RefField
            key={fieldName}
            label={field.label}
            value={fieldValue}
            onChange={(value, displayValue) => handleChange(field, value, displayValue)}
            isEditing={isEditing || isCreating}
            className={className}
            collectionName={field.referenceConfig.collection}
            displayFields={field.referenceConfig.displayFields}
            onLoadComplete={(loaded, error) => 
              handleReferenceLoadComplete(field, loaded, error)
            }
          />
        );
      
      default:
        return null;
    }
  };

  // Get item name/identifier for confirmation dialog
  const getItemName = () => {
    // Try to get a meaningful name from the item
    const nameField = entityConfig.fields.find(f => 
      f.name === 'name' || 
      f.name === 'firstName' ||
      f.path === 'general.firstName'
    );
    
    if (nameField) {
      const name = getFieldValue(formData, nameField);
      if (name) return name;
    }
    
    return `this ${entityConfig.displayName.toLowerCase()}`;
  };

  // Render related items sections
  const renderRelatedItems = () => {
    if (!entityConfig.relationFields || !selectedItem?._id || isCreating) {
      return null;
    }

    return Object.entries(entityConfig.relationFields).map(([key, config]) => (
      <div className="related-section" key={key}>
        <RelatedItems
          id={selectedItem._id}
          referenceField={config.field}
          collectionName={config.collection}
          displayFields={config.displayFields}
          title={config.title}
          emptyMessage={config.emptyMessage}
          onItemClick={handleRelationClick}
          onLoadingChange={(loading) => setIsRelatedItemsLoading(loading)}
        />
      </div>
    ));
  };

  return (
    <div className="detail-wrapper">
      {!isEditing && <LoadingSpinner isLoading={isRelatedItemsLoading} />}
      <LoadingSpinner isLoading={isFormLoading || isDeleting} />
      
      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={getItemName()}
      />
      
      <form
        onSubmit={handleSave}
        className={`${entityConfig.name}-form ${!isFormLoading ? "done-loading" : ""}`}
      >
        <div className="top-bar">
          <div className="top-bar__title">
            {selectedItem?._id 
              ? `${entityConfig.displayName} Details` 
              : `New ${entityConfig.displayName}`}
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
            {entityConfig.fields.map(field => renderField(field))}
            {renderRelatedItems()}
          </div>
          <div className="col-third">
            {/* Additional content section */}
          </div>
        </div>
        <div className="bottom-bar">
          {isEditing && !isCreating && selectedItem?._id && (
            <Button
              intent="danger"
              icon={Trash2}
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              Delete
            </Button>
          )}
        </div>
      </form>

      <style jsx>{`
        .related-section {
          margin-top: 2rem;
        }
        .bottom-bar {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-start;
        }
      `}</style>
    </div>
  );
}