"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useBookingsData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { MultiRefField } from "../fields/MultiRefField";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";

//delete confirmation
function DeleteConfirmationDialog({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-dialog">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete {itemName || "this booking"}?</p>
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

interface BookingFormData {
  confirmationNo: string;
  confirmationDate: string;
  travelPeriodStart: string;
  travelPeriodEnd: string;
  costCentre: string;
  status: string;
  notes: string;
  companyId: string;
  companyName: string;
  bookerId: string;
  bookerName: string;
  stayIds: string[];
  stayNames: string[];
}

interface FieldLoadingState {
  companyId: boolean;
  bookerId: boolean;
}

const INITIAL_FORM_STATE: BookingFormData = {
  confirmationNo: "",
  confirmationDate: new Date().toISOString().split('T')[0],
  travelPeriodStart: "",
  travelPeriodEnd: "",
  costCentre: "",
  status: "",
  notes: "",
  companyId: "",
  companyName: "",
  bookerId: "",
  bookerName: "",
  stayIds: [],
  stayNames: [],
};

const INITIAL_LOADING_STATE: FieldLoadingState = {
  companyId: false,
  bookerId: false,
};

const COST_CENTRE_OPTIONS = [
  { value: "CC1", label: "Cost Centre 1" },
  { value: "CC2", label: "Cost Centre 2" },
  { value: "CC3", label: "Cost Centre 3" },
] as const;

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
] as const;

export function BookingForm() {
  const {
    selectedItem,
    updateItem,
    createItem,
    deleteItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
  } = useBookingsData();

  const router = useRouter();

  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(
    INITIAL_LOADING_STATE
  );
  const [isFormLoading, setIsFormLoading] = useState(true);

  // Add these for delete functionality
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    const isCompanyLoaded = !formData.companyId || fieldsLoaded.companyId;
    const isBookerLoaded = !formData.bookerId || fieldsLoaded.bookerId;
    return isCompanyLoaded && isBookerLoaded;
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    const shouldShowLoading = 
      (formData.companyId && !fieldsLoaded.companyId) || 
      (formData.bookerId && !fieldsLoaded.bookerId);
    setIsFormLoading(shouldShowLoading);
  }, [formData.companyId, formData.bookerId, fieldsLoaded.companyId, fieldsLoaded.bookerId]);

  // Calculate days between travel period dates
  useEffect(() => {
    if (formData.travelPeriodStart && formData.travelPeriodEnd) {
      const start = new Date(formData.travelPeriodStart);
      const end = new Date(formData.travelPeriodEnd);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // You could add this to form data if needed
      // setFormData(prev => ({
      //   ...prev,
      //   travelDays: days > 0 ? days : 0
      // }));
    }
  }, [formData.travelPeriodStart, formData.travelPeriodEnd]);

  // Load booking data when component mounts or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(false);
      if (!selectedItem._id) {
        setIsCreating(true);
        setIsEditing(true);
      }

      setFieldsLoaded(INITIAL_LOADING_STATE);
      setIsFormLoading(!!selectedItem.companyId || !!selectedItem.bookerId);

      // Set form data from selected item
      setFormData({
        confirmationNo: selectedItem.confirmationNo || "",
        confirmationDate: selectedItem.confirmationDate || new Date().toISOString().split('T')[0],
        travelPeriodStart: selectedItem.travelPeriodStart || "",
        travelPeriodEnd: selectedItem.travelPeriodEnd || "",
        costCentre: selectedItem.costCentre || "",
        status: selectedItem.status || "",
        notes: selectedItem.notes || "",
        companyId: selectedItem.companyId || "",
        companyName: selectedItem.companyName || "",
        bookerId: selectedItem.bookerId || "",
        bookerName: selectedItem.bookerName || "",
        stayIds: selectedItem.stayIds || [],
        stayNames: selectedItem.stayNames || [],
      });
    }
  }, [selectedItem]);

  const handleChange = (
    field: keyof BookingFormData,
    value: string | string[],
    displayValue?: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "companyId" ? { companyName: displayValue } : {}),
      ...(displayValue && field === "bookerId" ? { bookerName: displayValue } : {}),
      ...(displayValue && field === "stayIds" ? { stayNames: displayValue } : {}),
    }));

    if (field === "companyId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        companyId: false,
      }));
      setIsFormLoading(!!value);
    } else if (field === "bookerId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        bookerId: false,
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

  const handleCompanyLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Company field load error:", error);
      toast.error(`Error loading company information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      companyId: loaded,
    }));
  };

  const handleBookerLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Booker field load error:", error);
      toast.error(`Error loading booker information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      bookerId: loaded,
    }));
  };

  const handleClose = () => {
    // Reset state
    setPendingChanges({});
    if (isEditing) {
      setIsEditing(false);
    }

    // Navigate back to bookings list
    router.push("/bookings");
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
        toast.success(`Booking ${isUpdate ? "updated" : "created"} successfully`);
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});

        // For new bookings, navigate to the detail view with the new ID
        if (!isUpdate && itemData._id) {
          router.push(`/bookings/${itemData._id}`);
        }
      } else {
        toast.error(`Failed to ${isUpdate ? "update" : "create"} booking`);
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
        confirmationNo: selectedItem.confirmationNo || "",
        confirmationDate: selectedItem.confirmationDate || new Date().toISOString().split('T')[0],
        travelPeriodStart: selectedItem.travelPeriodStart || "",
        travelPeriodEnd: selectedItem.travelPeriodEnd || "",
        costCentre: selectedItem.costCentre || "",
        status: selectedItem.status || "",
        notes: selectedItem.notes || "",
        companyId: selectedItem.companyId || "",
        companyName: selectedItem.companyName || "",
        bookerId: selectedItem.bookerId || "",
        bookerName: selectedItem.bookerName || "",
        stayIds: selectedItem.stayIds || [],
        stayNames: selectedItem.stayNames || [],
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);

    if (isCreating) {
      router.push("/bookings");
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
        toast.success("Booking deleted successfully");
        router.push("/bookings");
      } else {
        toast.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Helper function to create field props
  const fieldProps = (field: keyof BookingFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing || isCreating,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  // Get booking confirmation for confirmation dialog
  const bookingName = formData.confirmationNo || "this booking";

  return (
    <div className="detail-wrapper">
      <LoadingSpinner isLoading={isFormLoading || isDeleting} />

      {/* Add delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={bookingName}
      />

      <form
        onSubmit={handleSave}
        className={`booking-form ${!isFormLoading ? "done-loading" : ""}`}
      >
        <div className="top-bar">
          <div className="top-bar__title">
            {selectedItem?._id ? "Booking Details" : "New Booking"}
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
          <div className="col-half">
            <TextField label="Confirmation No." {...fieldProps("confirmationNo", true)} />
            <TextField label="Confirmation Date" type="date" {...fieldProps("confirmationDate")} />
            <TextField label="Travel Period Start" type="date" {...fieldProps("travelPeriodStart", true)} />
            <TextField label="Travel Period End" type="date" {...fieldProps("travelPeriodEnd", true)} />
            <DropdownField
              label="Cost Centre"
              options={COST_CENTRE_OPTIONS}
              {...fieldProps("costCentre")}
            />
            <DropdownField
              label="Status"
              options={STATUS_OPTIONS}
              {...fieldProps("status", true)}
            />
            <TextField 
              label="Notes" 
              {...fieldProps("notes")}
              multiline={true}
              rows={4}
            />
          </div>
          <div className="col-half">
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
            <RefField
              label="Booker"
              value={formData.bookerId}
              onChange={(value, displayValue) =>
                handleChange("bookerId", value, displayValue)
              }
              isEditing={isEditing || isCreating}
              className={pendingChanges["bookerId"] ? "field-changed" : ""}
              collectionName="contacts"
              displayFields={["general.firstName", "general.lastName"]}
              onLoadComplete={handleBookerLoadComplete}
            />
            {selectedItem?._id && (
              <div className="related-section">
                <h3 className="related-title">Related Stays</h3>
                {/* Could show related stays here once booking is saved */}
              </div>
            )}
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
        .related-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
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