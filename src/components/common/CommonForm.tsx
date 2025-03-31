"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, Trash2 } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

export interface DataContextState<T> {
  selectedItem: T | null;
  updateItem: (item: T) => Promise<boolean>;
  createItem: (item: T) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  setIsEditing: (isEditing: boolean) => void;
  isEditing: boolean;
  pendingChanges: Record<string, { oldValue: any; newValue: any }>;
  setPendingChanges: (
    changes: Record<string, { oldValue: any; newValue: any }>
  ) => void;
  selectItem?: (item: Partial<T> | null, startEditing?: boolean) => void;
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
  onFormReset,
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
    selectItem,
  } = dataContext;
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  //start as new contact
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(!selectedItem._id);
      if (!selectedItem._id) {
        setIsEditing(true);
      }
    }
  }, [selectedItem, setIsEditing]);

  const handleClose = () => {
    setPendingChanges({});
    if (isEditing) {
      setIsEditing(false);
    }
    router.push(`/${basePath}`);
  };
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
        toast.success(
          `${itemName} ${isUpdate ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});

        // For new items, navigate to the detail view with the new ID
        if (!isUpdate && (itemData as any)._id) {
          router.push(`/${basePath}/${(itemData as any)._id}`);
        }
      } else {
        toast.error(
          `Failed to ${
            isUpdate ? "update" : "create"
          } ${itemName.toLowerCase()}`
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    // Clear pending changes first
    setPendingChanges({});
    
    // For existing items, just exit edit mode
    if (!isCreating && selectedItem?._id) {
      setIsEditing(false);
      
      // Call the optional onFormReset callback if provided
      if (onFormReset) {
        onFormReset();
      }
      return;
    }
    
    // For new items, navigate back to list view
    if (isCreating) {
      setIsEditing(false);
      setIsCreating(false);
      
      // Call the optional onFormReset callback if provided
      if (onFormReset) {
        onFormReset();
      }
      
      router.push(`/${basePath}`);
    }
  };
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
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };
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
  const itemDisplayName = selectedItem
    ? displayName(selectedItem)
    : `this ${itemName.toLowerCase()}`;

  return (
    <div className="detail-wrapper">
      <LoadingSpinner isLoading={isFormLoading || isDeleting} />
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
        <div className="detail-content">{children}</div>
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
    </div>
  );
}