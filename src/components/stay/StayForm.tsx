"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useStaysData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { RefField } from "../fields/RefField";
import { MultiRefField } from "../fields/MultiRefField";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";
import { DropdownField } from "../fields/DropdownField";
import { searchDocuments } from "@/app/actions/crudActions";

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
  guestIds: string[];
  hotelId: string;
  roomNumber: string;
  roomType: string;
  roomPrice: string;
  roomNotes: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  specialRequests: string;
}

interface FieldLoadingState {
  bookingId: boolean;
  guestIds: boolean;
  hotelId: boolean;
}

const INITIAL_FORM_STATE: StayFormData = {
  reference: "",
  bookingId: "",
  guestIds: [],
  hotelId: "",
  roomNumber: "",
  roomType: "",
  roomPrice: "",
  roomNotes: "",
  checkInDate: "",
  checkOutDate: "",
  status: "",
  specialRequests: ""
};

const INITIAL_LOADING_STATE: FieldLoadingState = {
  bookingId: false,
  guestIds: false,
  hotelId: false
};

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" }
];

// Fallback room types if hotel doesn't have any defined
const DEFAULT_ROOM_TYPE_OPTIONS = [
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
  
  // Room types from the selected hotel
  const [roomTypeOptions, setRoomTypeOptions] = useState(DEFAULT_ROOM_TYPE_OPTIONS);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    const isBookingLoaded = !formData.bookingId || fieldsLoaded.bookingId;
    const isGuestLoaded = !formData.guestIds.length || fieldsLoaded.guestIds;
    const isHotelLoaded = !formData.hotelId || fieldsLoaded.hotelId;
    return isBookingLoaded && isGuestLoaded && isHotelLoaded;
  };

  // Update form loading state when fields load status changes - more restrictive
  useEffect(() => {
    // Only consider reference fields that actually require loading
    const shouldShowLoading = 
      (formData.bookingId && !fieldsLoaded.bookingId) || 
      (formData.hotelId && !fieldsLoaded.hotelId);
    
    // Only set loading state for actual loading operations, not text field edits
    setIsFormLoading(shouldShowLoading || loadingRoomTypes);
  }, [
    // Only dependencies related to loading states, not all form values
    fieldsLoaded.bookingId, fieldsLoaded.hotelId,
    loadingRoomTypes,
    // Only include formData fields that are reference fields
    formData.bookingId, formData.hotelId
    // Removed guestIds since MultiRefField handles its own loading
  ]);

  // Load room types from the selected hotel
  useEffect(() => {
    const fetchRoomTypes = async () => {
      if (!formData.hotelId) {
        setRoomTypeOptions(DEFAULT_ROOM_TYPE_OPTIONS);
        return;
      }

      try {
        setLoadingRoomTypes(true);
        const result = await searchDocuments("hotels", formData.hotelId, "_id");
        
        if (Array.isArray(result) && result.length > 0 && result[0].roomTypes?.length > 0) {
          // Convert hotel roomTypes array to dropdown options format
          const hotelRoomTypes = result[0].roomTypes.map(type => ({
            value: type,
            label: type
          }));
          setRoomTypeOptions(hotelRoomTypes);
          
          // If current roomType is not in the new options list, clear it
          if (formData.roomType && !result[0].roomTypes.includes(formData.roomType)) {
            setFormData(prev => ({
              ...prev,
              roomType: ""
            }));
            
            // Also update pendingChanges if needed
            if (pendingChanges["roomType"]) {
              setPendingChanges(prev => {
                const updated = { ...prev };
                delete updated["roomType"];
                return updated;
              });
            }
          }
        } else {
          setRoomTypeOptions(DEFAULT_ROOM_TYPE_OPTIONS);
        }
      } catch (error) {
        console.error("Error loading room types:", error);
        toast.error("Could not load room types from the selected hotel");
        setRoomTypeOptions(DEFAULT_ROOM_TYPE_OPTIONS);
      } finally {
        setLoadingRoomTypes(false);
      }
    };

    fetchRoomTypes();
  }, [formData.hotelId]); // Remove pendingChanges from dependency

  // Load stay data when component mounts or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(false);
      if (!selectedItem._id) {
        setIsCreating(true);
        setIsEditing(true);
      }

      setFieldsLoaded(INITIAL_LOADING_STATE);
      setIsFormLoading(!!selectedItem.bookingId || !!selectedItem.guestId || !!selectedItem.hotelId);

      // Set form data
      // Set form data
      // Set form data
      setFormData({
        reference: selectedItem.reference || "",
        bookingId: selectedItem.bookingId || "",
        guestIds: selectedItem.guestIds || [],
        hotelId: selectedItem.hotelId || "",
        roomNumber: selectedItem.roomNumber || "",
        roomType: selectedItem.roomType || "",
        roomPrice: selectedItem.roomPrice || "",
        roomNotes: selectedItem.roomNotes || "",
        checkInDate: selectedItem.checkInDate || "",
        checkOutDate: selectedItem.checkOutDate || "",
        status: selectedItem.status || "",
        specialRequests: selectedItem.specialRequests || ""
      });
    }
  }, [selectedItem]);

  // Update the pendingChanges to include displayValues for array fields
  const handleChange = (
    field: keyof StayFormData,
    value: string | string[],
    displayValue?: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Only set loading states for reference fields that need to fetch data
    // This prevents loading screen from appearing when typing in regular text fields
    const refFields = ["bookingId", "guestIds", "hotelId"];
    
    if (refFields.includes(field as string)) {
      if (field === "bookingId") {
        setFieldsLoaded((prev) => ({
          ...prev,
          bookingId: false,
        }));
        setIsFormLoading(!!value);
      } else if (field === "guestIds") {
        // For guestIds, we'll handle loading in the onChange callback of MultiRefField
        // so we don't need to set loading state here
        // The MultiRefField handles its own loading state internally
      } else if (field === "hotelId") {
        setFieldsLoaded((prev) => ({
          ...prev,
          hotelId: false,
        }));
        setIsFormLoading(!!value);
      }
    }

    // For array fields like guestIds, store both the array value and display values
    if (field === "guestIds" && displayValue) {
      setPendingChanges((prev) => ({
        ...prev,
        [field]: {
          oldValue: selectedItem?.[field] || [],
          newValue: value,
          displayValues: displayValue.split(", ") // Convert back to array for selectedLabels
        },
      }));
    } else {
      setPendingChanges((prev) => ({
        ...prev,
        [field]: {
          oldValue: selectedItem?.[field] || (field === "guestIds" ? [] : ""),
          newValue: value,
        },
      }));
    }
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
      guestIds: loaded,
    }));
  };

  const handleHotelLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Hotel field load error:", error);
      toast.error(`Error loading hotel information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      hotelId: loaded,
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
        guestIds: selectedItem.guestIds || [],
        hotelId: selectedItem.hotelId || "",
        roomNumber: selectedItem.roomNumber || "",
        roomType: selectedItem.roomType || "",
        roomPrice: selectedItem.roomPrice || "",
        roomNotes: selectedItem.roomNotes || "",
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
    setIsFormLoading(false); // Ensure loading is explicitly cleared

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
            <MultiRefField
              label="Guests"
              value={formData.guestIds}
              onChange={(value, displayValues) => {
                handleChange("guestIds", value, displayValues?.join(", "));
                // Immediately set as loaded since MultiRefField handles its own loading
                setFieldsLoaded(prev => ({
                  ...prev,
                  guestIds: true
                }));
              }}
              isEditing={isEditing || isCreating}
              className={pendingChanges["guestIds"] ? "field-changed" : ""}
              collectionName="contacts"
              displayFields={["general.firstName", "general.lastName"]}
              selectedLabels={formData.guestIds.length > 0 ? pendingChanges["guestIds"]?.displayValues || [] : []}
              showQuickAdd={true} // Enable quick add functionality
            />
            {/* <TextField label="Room Number" {...fieldProps("roomNumber")} /> */}
            <RefField
              label="Hotel"
              value={formData.hotelId}
              onChange={(value, displayValue) =>
                handleChange("hotelId", value, displayValue)
              }
              isEditing={isEditing || isCreating}
              className={pendingChanges["hotelId"] ? "field-changed" : ""}
              collectionName="hotels"
              displayFields={["name", "address"]}
              onLoadComplete={handleHotelLoadComplete}
            />
            <DropdownField
              label="Room Type"
              options={roomTypeOptions}
              {...fieldProps("roomType")}
              placeholder={loadingRoomTypes ? "Loading room types..." : "Select a room type"}
              disabled={loadingRoomTypes || !formData.hotelId}
            />
            <TextField 
              label="Room Price" 
              type="number" 
              {...fieldProps("roomPrice")} 
            />
            <TextField 
              label="Room Notes" 
              {...fieldProps("roomNotes")} 
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