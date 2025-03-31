"use client";
import { useState, useEffect } from "react";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { toast } from "sonner";
import { Plus, Edit, ExternalLink, Copy, X } from "lucide-react";
import Button from "@/components/common/Button";
import { LoadingSpinner } from "../loadingSpinner";
import { searchDocuments } from "@/app/actions/crudActions";
import { useModal } from "@/context/ModalContext";

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
  confirmationDate: new Date().toISOString().split("T")[0],
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

interface BookingFieldsProps {
  selectedItem: any;
  isEditing: boolean;
  pendingChanges: Record<string, { oldValue: any; newValue: any }>;
  setPendingChanges: (changes: Record<string, { oldValue: any; newValue: any }>) => void;
  onFormReset?: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  onAllFieldsLoadedChange: (allLoaded: boolean) => void;
}

export function BookingFields({
  selectedItem,
  isEditing,
  pendingChanges,
  setPendingChanges,
  onFormReset,
  onLoadingChange,
  onAllFieldsLoadedChange
}: BookingFieldsProps) {
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM_STATE);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(INITIAL_LOADING_STATE);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [showRelatedStays, setShowRelatedStays] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Related stays state
  const [stays, setStays] = useState<any[]>([]);
  const [isLoadingStays, setIsLoadingStays] = useState(false);
  const [staysError, setStaysError] = useState<string | null>(null);
  
  // Access the modal context
  const { openModal } = useModal();

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
    onLoadingChange(shouldShowLoading);
    onAllFieldsLoadedChange(checkAllFieldsLoaded());
  }, [
    formData.companyId,
    formData.bookerId,
    fieldsLoaded.companyId,
    fieldsLoaded.bookerId,
  ]);

  // Show related stays only when booking has an ID (i.e., it's been saved)
  useEffect(() => {
    setShowRelatedStays(!!selectedItem?._id);
  }, [selectedItem]);

  // Load booking data when component mounts or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(!selectedItem._id);
      setFieldsLoaded(INITIAL_LOADING_STATE);
      setIsFormLoading(!!selectedItem.companyId || !!selectedItem.bookerId);
      onLoadingChange(!!selectedItem.companyId || !!selectedItem.bookerId);

      // Set form data from selected item
      setFormData({
        confirmationNo: selectedItem.confirmationNo || "",
        confirmationDate:
          selectedItem.confirmationDate ||
          new Date().toISOString().split("T")[0],
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
      
      // Load related stays if we have a booking ID and stay IDs
      if (selectedItem._id && selectedItem.stayIds?.length > 0) {
        loadRelatedStays(selectedItem.stayIds);
      }
    }
  }, [selectedItem]);

  // Provide method to reset form data
  useEffect(() => {
    if (onFormReset) {
      // Define and expose the reset function
      const resetForm = () => {
        if (selectedItem) {
          setFormData({
            confirmationNo: selectedItem.confirmationNo || "",
            confirmationDate:
              selectedItem.confirmationDate ||
              new Date().toISOString().split("T")[0],
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
      };

      // Make it available to parent
      onFormReset = resetForm;
    }
  }, [selectedItem, onFormReset]);

  // Update the parent context's selectedItem with our form data changes
  useEffect(() => {
    if (selectedItem) {
      selectedItem.confirmationNo = formData.confirmationNo;
      selectedItem.confirmationDate = formData.confirmationDate;
      selectedItem.travelPeriodStart = formData.travelPeriodStart;
      selectedItem.travelPeriodEnd = formData.travelPeriodEnd;
      selectedItem.costCentre = formData.costCentre;
      selectedItem.status = formData.status;
      selectedItem.notes = formData.notes;
      selectedItem.companyId = formData.companyId;
      selectedItem.companyName = formData.companyName;
      selectedItem.bookerId = formData.bookerId;
      selectedItem.bookerName = formData.bookerName;
      selectedItem.stayIds = formData.stayIds;
      selectedItem.stayNames = formData.stayNames;
    }
  }, [formData, selectedItem]);

  const handleChange = (
    field: keyof BookingFormData,
    value: string | string[],
    displayValue?: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "companyId"
        ? { companyName: displayValue }
        : {}),
      ...(displayValue && field === "bookerId"
        ? { bookerName: displayValue }
        : {}),
    }));

    if (field === "companyId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        companyId: false,
      }));
      setIsFormLoading(!!value);
      onLoadingChange(!!value);
    } else if (field === "bookerId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        bookerId: false,
      }));
      setIsFormLoading(!!value);
      onLoadingChange(!!value);
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
    
    onAllFieldsLoadedChange(checkAllFieldsLoaded());
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
    
    onAllFieldsLoadedChange(checkAllFieldsLoaded());
  };

  // Helper function to create field props
  const fieldProps = (field: keyof BookingFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  // ==========================================
  // Related Stays Functions
  // ==========================================

  const loadRelatedStays = async (stayIds: string[]) => {
    if (!stayIds || stayIds.length === 0) {
      setStays([]);
      setIsLoadingStays(false);
      return;
    }

    setIsLoadingStays(true);
    setStaysError(null);

    try {
      const loadedStays = [];
      
      // Fetch each stay by ID
      for (const stayId of stayIds) {
        const result = await searchDocuments("stays", stayId, "_id");
        if (Array.isArray(result) && result.length > 0) {
          loadedStays.push(result[0]);
        }
      }
      
      setStays(loadedStays);
    } catch (err) {
      console.error("Error loading related stays:", err);
      setStaysError("Failed to load stays");
    } finally {
      setIsLoadingStays(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "checked_in": return "Checked In";
      case "checked_out": return "Checked Out";
      case "cancelled": return "Cancelled";
      case "no_show": return "No Show";
      default: return status || "-";
    }
  };

  const getStayDisplayName = (stay) => {
    if (!stay) return "New Stay";
    
    let name = '';
    
    // Add check-in/check-out dates if available
    if (stay.checkInDate) {
      name += formatDate(stay.checkInDate);
      
      if (stay.checkOutDate) {
        name += ` - ${formatDate(stay.checkOutDate)}`;
      }
    }
    
    // Add hotel name if available
    if (stay.hotelName) {
      name += stay.hotelName ? ` at ${stay.hotelName}` : '';
    }
    
    // Add room info if available
    if (stay.roomNumber) {
      name += ` (Room ${stay.roomNumber})`;
    } else if (stay.roomType) {
      name += ` (${stay.roomType})`;
    }
    
    return name.trim() || `Stay ${formatDate(new Date().toISOString())}`;
  };

  const handleAddStay = () => {
    // Create a new stay with default values from the booking
    const newStay = {
      checkInDate: formData.travelPeriodStart || "",
      checkOutDate: formData.travelPeriodEnd || "",
      status: "confirmed",
    };
    
    // Open the stay modal
    openModal("stay", {
      stay: newStay,
      isCopyMode: false,
      callback: handleStaySaved
    });
  };

  const handleEditStay = (stay: any) => {
    openModal("stay", {
      stay: stay,
      isCopyMode: false,
      callback: handleStaySaved
    });
  };

  const handleCopyStay = (stay: any) => {
    // Create a deep copy of the stay
    const stayCopy = JSON.parse(JSON.stringify(stay));
    
    // Remove the _id to ensure it creates a new stay
    delete stayCopy._id;
    
    // Optionally modify the reference to indicate it's a copy
    if (stayCopy.reference) {
      stayCopy.reference = `${stayCopy.reference} (Copy)`;
    }
    
    openModal("stay", {
      stay: stayCopy,
      isCopyMode: true,
      callback: handleStaySaved
    });
  };

  const handleViewStay = (stayId: string) => {
    window.open(`/stays/${stayId}`, '_blank');
  };

  const handleRemoveStay = (stay: any, index: number) => {
    // Ask for confirmation before removing
    if (confirm(`Are you sure you want to remove ${getStayDisplayName(stay)} from this booking? This will not delete the stay itself.`)) {
      // Create new arrays without the removed stay
      const newStayIds = [...formData.stayIds];
      newStayIds.splice(index, 1);
      
      const newStays = [...stays];
      newStays.splice(index, 1);
      
      // Update the form data
      setFormData(prev => ({
        ...prev,
        stayIds: newStayIds,
        stayNames: newStays.map(stay => getStayDisplayName(stay))
      }));
      
      // Update the stays list
      setStays(newStays);
      
      // Update pendingChanges
      setPendingChanges(prev => ({
        ...prev,
        stayIds: {
          oldValue: selectedItem?.stayIds || [],
          newValue: newStayIds
        }
      }));
      
      // Show success message
      toast.success("Stay removed from booking");
    }
  };

  const handleStaySaved = (savedStay: any) => {
    if (!savedStay || !savedStay._id) {
      return; // Something went wrong with saving
    }
    
    // Check if this is a new stay or an update
    const existingIndex = formData.stayIds.indexOf(savedStay._id);
    
    if (existingIndex === -1) {
      // This is a new stay - add it to our arrays
      const newStayIds = [...formData.stayIds, savedStay._id];
      const newStays = [...stays, savedStay];
      
      // Update the form data
      setFormData(prev => ({
        ...prev,
        stayIds: newStayIds,
        stayNames: newStays.map(stay => getStayDisplayName(stay))
      }));
      
      // Update the stays list
      setStays(newStays);
      
      // Update pendingChanges
      setPendingChanges(prev => ({
        ...prev,
        stayIds: {
          oldValue: selectedItem?.stayIds || [],
          newValue: newStayIds
        }
      }));
    } else {
      // This is an existing stay that's been updated
      const newStays = [...stays];
      newStays[existingIndex] = savedStay;
      
      // Update the form data with new display names
      setFormData(prev => ({
        ...prev,
        stayNames: newStays.map(stay => getStayDisplayName(stay))
      }));
      
      // Update the stays list
      setStays(newStays);
    }
  };

  // Function to render the related stays section
  const renderRelatedStays = () => {
    if (!showRelatedStays || !selectedItem?._id) return null;
    
    return (
      <div className="related-stays-container">
        <div className="related-stays">
          <div className="related-stays-header">
            <h3 className="related-title">Related Stays</h3>
            {isEditing && (
              <Button 
                icon={Plus} 
                onClick={handleAddStay} 
                size="sm"
              >
                Add Stay
              </Button>
            )}
          </div>

          {isLoadingStays ? (
            <div className="loading-container">
              <LoadingSpinner isLoading={true} />
            </div>
          ) : staysError ? (
            <div className="error-message">{staysError}</div>
          ) : stays.length === 0 ? (
            <div className="no-stays-message">No stays found for this booking</div>
          ) : (
            <div className="stays-list">
              {stays.map((stay, index) => (
                <div key={stay._id} className="stay-item">
                  <div className="stay-info">
                    <div className="stay-dates">
                      {formatDate(stay.checkInDate)} - {formatDate(stay.checkOutDate)}
                    </div>
                    <div className="stay-details">
                      <span className="stay-hotel">{stay.hotelName || "Unknown hotel"}</span>
                      {stay.roomNumber && <span className="stay-room">Room: {stay.roomNumber}</span>}
                      <span className="stay-status">Status: {getStatusLabel(stay.status)}</span>
                    </div>
                    <div className="stay-guests">
                      {stay.guestNames && stay.guestNames.length > 0 ? (
                        <span>{stay.guestNames.join(", ")}</span>
                      ) : (
                        <span className="no-guests">No guests assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="stay-actions">
                    {isEditing && (
                      <>
                        <Button 
                          icon={X} 
                          onClick={() => handleRemoveStay(stay, index)} 
                          size="sm" 
                          intent="ghost"
                          title="Remove stay from booking"
                        >
                          Remove
                        </Button>
                        <Button 
                          icon={Copy} 
                          onClick={() => handleCopyStay(stay)} 
                          size="sm" 
                          intent="secondary"
                          title="Copy stay"
                        >
                          Copy
                        </Button>
                        <Button 
                          icon={Edit} 
                          onClick={() => handleEditStay(stay)} 
                          size="sm" 
                          intent="secondary"
                          title="Edit stay"
                        >
                          Edit
                        </Button>
                      </>
                    )}
                    <Button 
                      icon={ExternalLink} 
                      onClick={() => handleViewStay(stay._id)} 
                      size="sm" 
                      intent="ghost"
                      title="View in new tab"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="col-half">
        <TextField
          label="Confirmation No."
          {...fieldProps("confirmationNo", true)}
        />
        <TextField
          label="Confirmation Date"
          type="date"
          {...fieldProps("confirmationDate")}
        />
        <TextField
          label="Travel Period Start"
          type="date"
          {...fieldProps("travelPeriodStart", true)}
        />
        <TextField
          label="Travel Period End"
          type="date"
          {...fieldProps("travelPeriodEnd", true)}
        />
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
          isEditing={isEditing}
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
          isEditing={isEditing}
          className={pendingChanges["bookerId"] ? "field-changed" : ""}
          collectionName="contacts"
          displayFields={["general.firstName", "general.lastName"]}
          onLoadComplete={handleBookerLoadComplete}
        />
      </div>
      
      {/* Render the related stays section */}
      {renderRelatedStays()}
      
      <style jsx>{`
        .related-stays-container {
          margin-top: 2rem;
          width: 100%;
        }
        
        .related-stays {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 1rem;
          background-color: #fafafa;
        }

        .related-stays-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .related-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
          height: 100px;
          position: relative;
        }

        .error-message {
          color: #e53935;
          padding: 1rem;
          text-align: center;
        }

        .no-stays-message {
          color: #757575;
          padding: 2rem 0;
          text-align: center;
          font-style: italic;
        }

        .stays-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .stay-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .stay-info {
          flex: 1;
        }

        .stay-dates {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stay-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .stay-room, .stay-status {
          color: #616161;
        }

        .stay-guests {
          font-size: 0.9rem;
          color: #616161;
        }

        .no-guests {
          font-style: italic;
          color: #9e9e9e;
        }

        .stay-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </>
  );
}