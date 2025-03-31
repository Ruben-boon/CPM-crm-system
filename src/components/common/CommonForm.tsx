"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, Trash2 } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";

// Delete confirmation dialog component
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

export interface DataContextState<T> {
  selectedItem: T | null;
  updateItem: (item: T) => Promise<boolean>;
  createItem: (item: T) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  setIsEditing: (isEditing: boolean) => void;
  isEditing: boolean;
  pendingChanges: Record<string, { oldValue: any; newValue: any }>;
  setPendingChanges: (changes: Record<string, { oldValue: any; newValue: any }>) => void;
}

export interface CommonFormProps<T> {
  dataContext: DataContextState<T>;
  children: ReactNode;
  itemName: string;
  entityType: string;
  basePath: string;
  displayName: (item: T) => string;
  isFormLoading?: boolean;
  isAllFieldsLoaded?: () => boolean;
  onFormReset?: () => void;
}

export function CommonForm<T extends { _id?: string }>({
  dataContext,
  children,
  itemName,
  entityType,
  basePath,
  displayName,
  isFormLoading = false,
  isAllFieldsLoaded = () => true,
  onFormReset
}: CommonFormProps<T>) {
  const {
    selectedItem,
    updateItem,
    createItem,
    deleteItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
  } = dataContext;

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Initialize creating state when component mounts
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(!selectedItem._id);
      // If it's a new item, set editing mode
      if (!selectedItem._id) {
        setIsEditing(true);
      }
    }
  }, [selectedItem, setIsEditing]);

  // Handler for closing the form
  const handleClose = () => {
    // Reset state
    setPendingChanges({});
    if (isEditing) {
      setIsEditing(false);
    }

    // Navigate back to list view
    router.push(`/${basePath}`);
  };

  // Handler for saving the form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the current selectedItem combined with any pending changes
      const itemData = {
        ...selectedItem,
      } as T;

      const isUpdate = !!selectedItem?._id;
      const success = isUpdate
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(`${itemName} ${isUpdate ? "updated" : "created"} successfully`);
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});

        // For new items, navigate to the detail view with the new ID
        if (!isUpdate && (itemData as any)._id) {
          router.push(`/${basePath}/${(itemData as any)._id}`);
        }
      } else {
        toast.error(`Failed to ${isUpdate ? "update" : "create"} ${itemName.toLowerCase()}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for canceling edits
  const handleCancel = () => {
    // Reset form state
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);

    // If custom reset handler is provided, call it
    if (onFormReset) {
      onFormReset();
    }

    // If creating a new item, navigate back to list view
    if (isCreating) {
      router.push(`/${basePath}`);
    }
  };

  // Handler for clicking delete button
  const handleDeleteClick = (e?: React.MouseEvent) => {
    // If there's an event, prevent default behavior
    if (e) e.preventDefault();
    
    // Cancel editing mode first to avoid update conflict
    if (isEditing) {
      setIsEditing(false);
      setPendingChanges({});
    }
    
    // Show confirmation dialog
    setShowDeleteConfirmation(true);
  };

  // Handler for canceling delete
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Handler for confirming delete
  const handleConfirmDelete = async () => {
    if (!selectedItem?._id) {
      toast.error(`No ${itemName.toLowerCase()} selected to delete`);
      setShowDeleteConfirmation(false);
      return;
    }
  
    setIsDeleting(true);
    try {
      const success = await deleteItem(selectedItem._id);
      
      if (success) {
        toast.success(`${itemName} deleted successfully`);
        router.push(`/${basePath}`);
      } else {
        toast.error(`Failed to delete ${itemName.toLowerCase()}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Get display name for confirmation dialog
  const itemDisplayName = selectedItem ? displayName(selectedItem) : `this ${itemName.toLowerCase()}`;

  return (
    <div className="detail-wrapper">
      <LoadingSpinner isLoading={isFormLoading || isDeleting} />
      
      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={itemDisplayName}
      />
      
      <form 
        onSubmit={handleSave} 
        className={`${entityType}-form ${!isFormLoading ? "done-loading" : ""}`}
      >
        <div className="top-bar">
          <div className="top-bar__title">
            {selectedItem?._id ? `${itemName} Details` : `New ${itemName}`}
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
                    !isAllFieldsLoaded()
                  }
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="detail-content">
          {children}
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
        .bottom-bar {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-start;
        }
      `}</style>
    </div>
  );
}