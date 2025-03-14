"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useStaysData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { RefField } from "../fields/RefField";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";
import { DropdownField } from "../fields/DropdownField";

//delete confirmation
function DeleteConfirmationDialog({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-dialog">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete {itemName || "this stay"}?</p>
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

interface StayFormData {
  reference: string;
  bookingId: string;
  guestId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  specialRequests: string;
}

interface FieldLoadingState {
  bookingId: boolean;
  guestId: boolean;
}

const INITIAL_FORM_STATE: StayFormData = {
  reference: "",
  bookingId: "",
  guestId: "",
  roomNumber: "",
  roomType: "",
  checkInDate: "",
  checkOutDate: "",
  status: "",
  specialRequests: ""
};

const INITIAL_LOADING_STATE: FieldLoadingState = {
  bookingId: false,
  guestId: false
};

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" }
];

const ROOM_TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "suite", label: "Suite" },
  { value: "deluxe", label: "Deluxe" }
];

export function StayForm() {
  const {
    selectedItem,
    updateItem,
    createItem,
    deleteItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
  } = useStaysData();

  const router = useRouter();

  const [formData, setFormData] = useState<StayFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(
    INITIAL_LOADING_STATE
  );
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  // Add these for delete functionality
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    const isBookingLoaded = !formData.bookingId || fieldsLoaded.bookingId;
    const isGuestLoaded = !formData.guestId || fieldsLoaded.guestId;
    return isBookingLoaded && isGuestLoaded;
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    const shouldShowLoading = 
      (formData.bookingId && !fieldsLoaded.bookingId) || 
      (formData.guestId && !fieldsLoaded.guestId);
    setIsFormLoading(shouldShowLoading);
  }, [formData.bookingId, formData.guestId, fieldsLoaded.bookingId, fieldsLoaded.guestId]);

  // Load stay data when component mounts or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(false);
      if (!selectedItem._id) {
        setIsCreating(true);
        setIsEditing(true);
      }

      setFieldsLoaded(INITIAL_LOADING_STATE);
      setIsFormLoading(!!selectedItem.bookingId || !!selectedItem.guestId);

      // Set form data
      setFormData({
        reference: selectedItem.reference || "",
        bookingId: selectedItem.bookingId || "",
        guestId: selectedItem.guestId || "",
        roomNumber: selectedItem.roomNumber || "",
        roomType: selectedItem.roomType || "",
        checkInDate: selectedItem.checkInDate || "",
        checkOutDate: selectedItem.checkOutDate || "",
        status: selectedItem.status || "",
        specialRequests: selectedItem.specialRequests || ""
      });
    }
  }, [selectedItem]);

  const handleChange = (
    field: keyof StayFormData,
    value: string | string[],
    displayValue?: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "bookingId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        bookingId: false,
      }));
      setIsFormLoading(!!value);
    } else if (field === "guestId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        guestId: false,
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

  const handleBookingLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Booking field load error:", error);
      toast.error(`Error loading booking information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      bookingId: loaded,
    }));
  };

  const handleGuestLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Guest field load error:", error);
      toast.error(`Error loading guest information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      guestId: loaded,
    }));
  };

  const handleClose = () => {
    // Reset state
    setPendingChanges({});
    if (isEditing) {
      setIsEditing(false);
    }

    // Navigate
    router.push("/stays");
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
          `Stay ${isUpdate ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});

        // For new stays, navigate to the detail view with the new ID
        if (!isUpdate && itemData._id) {
          router.push(`/stays/${itemData._id}`);
        }
      } else {
        toast.error(`Failed to ${isUpdate ? "update" : "create"} stay`);
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
        reference: selectedItem.reference || "",
        bookingId: selectedItem.bookingId || "",
        guestId: selectedItem.guestId || "",
        roomNumber: selectedItem.roomNumber || "",
        roomType: selectedItem.roomType || "",
        checkInDate: selectedItem.checkInDate || "",
        checkOutDate: selectedItem.checkOutDate || "",
        status: selectedItem.status || "",
        specialRequests: selectedItem.specialRequests || ""
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);

    if (isCreating) {
      router.push("/stays");
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
        toast.success("Stay deleted successfully");
        router.push("/stays");
      } else {
        toast.error("Failed to delete stay");
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
  const fieldProps = (field: keyof StayFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing || isCreating,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  // Get stay reference for confirmation dialog
  const stayReference = formData.reference || "this stay";

  return (
    <div className="detail-wrapper">
      <LoadingSpinner isLoading={isFormLoading || isDeleting} />
      
      {/* Add delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={stayReference}
      />
      
      <form
        onSubmit={handleSave}
        className={`stay-form ${!isFormLoading ? "done-loading" : ""}`}
      >
        <div className="top-bar">
          <div className="top-bar__title">
            {selectedItem?._id ? "Stay Details" : "New Stay"}
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
            <TextField label="Reference" {...fieldProps("reference", true)} />
            <RefField
              label="Booking"
              value={formData.bookingId}
              onChange={(value, displayValue) =>
                handleChange("bookingId", value, displayValue)
              }
              isEditing={isEditing || isCreating}
              className={pendingChanges["bookingId"] ? "field-changed" : ""}
              collectionName="bookings"
              displayFields={["hotelConfirmationNo", "arrivalDate"]}
              onLoadComplete={handleBookingLoadComplete}
            />
            <RefField
              label="Guest"
              value={formData.guestId}
              onChange={(value, displayValue) =>
                handleChange("guestId", value, displayValue)
              }
              isEditing={isEditing || isCreating}
              className={pendingChanges["guestId"] ? "field-changed" : ""}
              collectionName="contacts"
              displayFields={["general.firstName", "general.lastName"]}
              onLoadComplete={handleGuestLoadComplete}
            />
            <TextField label="Room Number" {...fieldProps("roomNumber")} />
            <DropdownField
              label="Room Type"
              options={ROOM_TYPE_OPTIONS}
              {...fieldProps("roomType")}
            />
            <TextField 
              label="Check-in Date" 
              type="date" 
              {...fieldProps("checkInDate", true)} 
            />
            <TextField 
              label="Check-out Date" 
              type="date" 
              {...fieldProps("checkOutDate", true)} 
            />
            <DropdownField
              label="Status"
              options={STATUS_OPTIONS}
              {...fieldProps("status", true)}
            />
            <TextField 
              label="Special Requests" 
              {...fieldProps("specialRequests")} 
            />
          </div>
          <div className="col-third">
            {/* You can add additional fields or sections here */}
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
        .bottom-bar {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-start;
        }
      `}</style>
    </div>
  );
}