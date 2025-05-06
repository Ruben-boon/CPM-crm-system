// CommonForm.tsx
"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { LoadingSpinner } from "../loadingSpinner";

export interface DataContextState<T> {
  selectedItem: T | null;
  originalItem: T | null;
  updateItem: (item: T) => Promise<boolean>;
  createItem: (item: T) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  resetForm: () => void;
  setIsEditing: (isEditing: boolean) => void;
  isEditing: boolean;
  pendingChanges: Record<string, { oldValue: any; newValue: any }>;
  isDirty: boolean;
  cancelCopy?: () => void;
}

export interface CommonFormProps<T> {
  dataContext: DataContextState<T>;
  children: React.ReactNode;
  itemName: string;
  entityType: string;
  basePath: string;
  displayName: (item: T) => string;
}

export function CommonForm<T extends { _id?: string }>({
  dataContext,
  children,
  itemName,
  entityType,
  basePath,
  displayName,
}: CommonFormProps<T>) {
  const {
    selectedItem,
    updateItem,
    createItem,
    deleteItem,
    resetForm,
    setIsEditing,
    isEditing,
    isDirty,
  } = dataContext;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<any>(null);

  useEffect(() => {
    if (selectedItem) {
      const isNewItem = !selectedItem._id;
      setIsCreating(isNewItem);
      // Auto-enable editing for new items
      if (isNewItem && !isEditing) {
        setIsEditing(true);
      }
      
      // Update last saved state when item loads (but not during editing)
      if (!isEditing) {
        setLastSavedState(JSON.stringify(selectedItem));
      }
    }
  }, [selectedItem, isEditing, setIsEditing]);

  const handleClose = () => {
    router.push(`/${basePath}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedItem) {
      return;
    }

    setIsSubmitting(true);

    try {
      const isUpdate = !!selectedItem._id;
      const success = isUpdate
        ? await updateItem(selectedItem as T)
        : await createItem(selectedItem as T);

      if (success) {
        toast.success(
          `${itemName} ${isUpdate ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setIsCreating(false);
        // Update last saved state after successful save
        setLastSavedState(JSON.stringify(selectedItem));

        // For new items, navigate to the detail view with the new ID
        if (!isUpdate && (selectedItem as any)?._id) {
          router.push(`/${basePath}/${(selectedItem as any)._id}`);
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
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      // If we have a cancelCopy method, use that for better cleanup
      if (dataContext.cancelCopy) {
        dataContext.cancelCopy();
      } else {
        resetForm();
        setIsEditing(false);
      }

      // Navigate after state is reset
      router.push(`/${basePath}`);
    } else {
      resetForm();
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    // Exit edit mode before deletion
    if (isEditing) {
      setIsEditing(false);
      resetForm();
    }

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

  // Only show Save button if truly dirty (comparing with last saved state)
  const isReallyDirty = isCreating || 
    (isEditing && selectedItem && lastSavedState !== JSON.stringify(selectedItem));

  return (
    <>
      <div className="detail-wrapper relative">
        <DeleteConfirmationDialog
          isOpen={showDeleteConfirmation}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={itemDisplayName}
        />

        <form onSubmit={handleSave} className={`${entityType}-form`}>
          <div className="top-bar">
            <div className="top-bar__title">
              {selectedItem?._id ? `${itemName}` : `New ${itemName}`}
            </div>

            <div className="top-bar__edit">
              {!isEditing && selectedItem?._id && (
                <>
                  <Button
                    intent="outline"
                    icon={Edit}
                    onClick={() => setIsEditing(true)}
                  >
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

              {isEditing && (
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
                    disabled={isSubmitting || !isReallyDirty}
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
    </>
  );
}