"use client";
import { useState, useEffect, useRef } from "react";
import { useBookingsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { Plus, Edit, ExternalLink, Copy, X } from "lucide-react";
import Button from "@/components/common/Button";
import { searchDocuments } from "@/app/actions/crudActions";
import { toast } from "sonner";
import { StayModal } from "../stay/StayModal";
import { DownloadPDFButton } from "../pdf/DownloadPDFButton";

// Define constants for dropdown options
const COST_CENTRE_OPTIONS = [
  { value: "CC1", label: "Cost Centre 1" },
  { value: "CC2", label: "Cost Centre 2" },
  { value: "CC3", label: "Cost Centre 3" },
];

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

export function BookingForm() {
  const bookingsContext = useBookingsData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStay, setSelectedStay] = useState(null);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [stays, setStays] = useState([]);
  const previousStayIdsRef = useRef([]); // For tracking changes to stayIds

  console.log("loaded stays:", stays);
  console.log("booking context:", bookingsContext.selectedItem);

  // Function to get display name for the booking
  const getDisplayName = (item) => {
    return item.confirmationNo || "this booking";
  };

  // Handle field changes
  const handleFieldChange = (fieldPath, value, displayValue) => {
    bookingsContext.updateField(fieldPath, value);
  };

  // Check if a field has pending changes
  const isFieldChanged = (fieldPath) => {
    return !!bookingsContext.pendingChanges[fieldPath];
  };

  // Improved effect to load related stays only when stayIds actually change
  useEffect(() => {
    const currentStayIds = bookingsContext.selectedItem?.stayIds || [];
    const previousStayIds = previousStayIdsRef.current;

    // Check if the arrays are different (different length or content)
    const haveStayIdsChanged =
      currentStayIds.length !== previousStayIds.length ||
      currentStayIds.some((id, index) => id !== previousStayIds[index]);

    // Only reload stays if there's an actual change to stayIds
    if (
      bookingsContext.selectedItem?._id &&
      currentStayIds.length > 0 &&
      haveStayIdsChanged
    ) {
      loadRelatedStays(currentStayIds);
      // Update the reference to current stayIds
      previousStayIdsRef.current = [...currentStayIds];
    } else if (currentStayIds.length === 0 && previousStayIds.length > 0) {
      // Clear stays if stayIds was cleared
      setStays([]);
      previousStayIdsRef.current = [];
    }
  }, [
    bookingsContext.selectedItem?._id,
    bookingsContext.selectedItem?.stayIds,
  ]);

  // Load stays data without loading state
  const loadRelatedStays = async (stayIds) => {
    if (!stayIds || stayIds.length === 0) {
      setStays([]);
      return;
    }

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
      toast.error("Failed to load stays");
    }
  };

  // Handle adding a new stay
  const handleAddStay = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newStay = {
      checkInDate: bookingsContext.selectedItem?.travelPeriodStart || "",
      checkOutDate: bookingsContext.selectedItem?.travelPeriodEnd || "",
      status: "confirmed",
    };

    setSelectedStay(newStay);
    setIsCopyMode(false);
    setIsModalOpen(true);
  };

  // Handle editing an existing stay
  const handleEditStay = (stay) => {
    setSelectedStay(stay);
    setIsCopyMode(false);
    setIsModalOpen(true);
  };

  // Handle copying a stay
  const handleCopyStay = (stay) => {
    // Create a deep copy of the stay
    const stayCopy = JSON.parse(JSON.stringify(stay));

    // Remove the _id to ensure it creates a new stay
    delete stayCopy._id;

    // Modify the reference to indicate it's a copy
    if (stayCopy.reference) {
      stayCopy.reference = `${stayCopy.reference} (Copy)`;
    }

    setSelectedStay(stayCopy);
    setIsCopyMode(true);
    setIsModalOpen(true);
  };

  // Handle viewing a stay in a new tab
  const handleViewStay = (stayId) => {
    window.open(`/stays/${stayId}`, "_blank");
  };

  // Handle removing a stay from the booking
  const handleRemoveStay = (stay, index) => {
    // Ask for confirmation before removing
    if (
      confirm(
        `Are you sure you want to remove this stay from the booking? This will not delete the stay itself.`
      )
    ) {
      // Create new arrays without the removed stay
      const newStayIds = [...bookingsContext.selectedItem.stayIds];
      newStayIds.splice(index, 1);

      const newStays = [...stays];
      newStays.splice(index, 1);

      // Update the form data
      bookingsContext.updateField("stayIds", newStayIds);

      // Update the stays list locally for immediate UI feedback
      setStays(newStays);

      // Update our reference to prevent unnecessary reloading
      previousStayIdsRef.current = [...newStayIds];

      // Show success message
      toast.success("Stay removed from booking");
    }
  };

  // Handle saving a stay from the modal
  const handleStaySaved = (savedStay) => {
    if (!savedStay || !savedStay._id) {
      return; // Something went wrong with saving
    }

    // Check if this is a new stay or an update
    const existingIndex =
      bookingsContext.selectedItem.stayIds?.indexOf(savedStay._id) ?? -1;
    let newStayIds;

    if (existingIndex === -1) {
      // This is a new stay - add it to our arrays
      newStayIds = [
        ...(bookingsContext.selectedItem.stayIds || []),
        savedStay._id,
      ];

      // Update the booking with the new stay
      bookingsContext.updateField("stayIds", newStayIds);

      // Add the new stay to our local state for immediate UI feedback
      setStays((prevStays) => [...prevStays, savedStay]);
    } else {
      // This is an existing stay that's been updated
      newStayIds = [...bookingsContext.selectedItem.stayIds];

      // Update the stay in our local state
      setStays((prevStays) => {
        const newStays = [...prevStays];
        newStays[existingIndex] = savedStay;
        return newStays;
      });
    }

    // Update our reference to prevent unnecessary reloading
    previousStayIdsRef.current = newStayIds || [];

    // Close the modal
    setIsModalOpen(false);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "checked_in":
        return "Checked In";
      case "checked_out":
        return "Checked Out";
      case "cancelled":
        return "Cancelled";
      case "no_show":
        return "No Show";
      default:
        return status || "-";
    }
  };

  // Get stay display name
  const getStayDisplayName = (stay) => {
    if (!stay) return "New Stay";

    let name = "";

    // Add check-in/check-out dates if available
    if (stay.checkInDate) {
      name += formatDate(stay.checkInDate);

      if (stay.checkOutDate) {
        name += ` - ${formatDate(stay.checkOutDate)}`;
      }
    }

    // Add hotel name if available
    if (stay.hotelName) {
      name += stay.hotelName ? ` at ${stay.hotelName}` : "";
    }

    // Add room info if available
    if (stay.roomNumber) {
      name += ` (Room ${stay.roomNumber})`;
    } else if (stay.roomType) {
      name += ` (${stay.roomType})`;
    }

    return name.trim() || `Stay ${formatDate(new Date().toISOString())}`;
  };

  // Function to render the related stays section
  const renderRelatedStays = () => {
    if (!bookingsContext.selectedItem?._id) return null;

    return (
      <div className="related-stays-container">
        <div className="related-stays">
          <div className="related-stays-header">
            <h4 className="related-title">Stays</h4>
            {bookingsContext.isEditing && (
              <Button icon={Plus} onClick={handleAddStay} size="sm">
                Add Stay
              </Button>
            )}
          </div>

          {stays.length === 0 ? (
            <div className="no-stays-message">
              No stays found for this booking
            </div>
          ) : (
            <div className="stays-list">
              {stays.map((stay, index) => (
                <div key={stay._id} className="stay-item">
                  <div className="stay-info">
                    <div className="stay-dates">
                      {formatDate(stay.checkInDate)} -{" "}
                      {formatDate(stay.checkOutDate)}
                    </div>
                    <div className="stay-details">
                      <span className="stay-hotel">
                        {stay.hotelName || "Unknown hotel"}
                      </span>
                      {stay.roomNumber && (
                        <span className="stay-room">
                          Room: {stay.roomNumber}
                        </span>
                      )}
                      <span className="stay-status">
                        Status: {getStatusLabel(stay.status)}
                      </span>
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
                    {bookingsContext.isEditing && (
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
      {isModalOpen && (
        <StayModal
          stay={selectedStay}
          isCopyMode={isCopyMode}
          onSave={handleStaySaved}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <CommonForm
        dataContext={bookingsContext}
        itemName="Booking"
        entityType="booking"
        basePath="bookings"
        displayName={getDisplayName}
      >
        <div className="col-half">
          <TextField
            label="Confirmation No."
            fieldPath="confirmationNo"
            value={bookingsContext.selectedItem?.confirmationNo || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            required={true}
            isChanged={isFieldChanged("confirmationNo")}
          />
          <TextField
            label="Confirmation Date"
            fieldPath="confirmationDate"
            value={
              bookingsContext.selectedItem?.confirmationDate ||
              new Date().toISOString().split("T")[0]
            }
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            type="date"
            isChanged={isFieldChanged("confirmationDate")}
          />
          <TextField
            label="Travel Period Start"
            fieldPath="travelPeriodStart"
            value={bookingsContext.selectedItem?.travelPeriodStart || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            type="date"
            required={true}
            isChanged={isFieldChanged("travelPeriodStart")}
          />
          <TextField
            label="Travel Period End"
            fieldPath="travelPeriodEnd"
            value={bookingsContext.selectedItem?.travelPeriodEnd || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            type="date"
            required={true}
            isChanged={isFieldChanged("travelPeriodEnd")}
          />
          <DropdownField
            label="Cost Centre"
            fieldPath="costCentre"
            value={bookingsContext.selectedItem?.costCentre || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            options={COST_CENTRE_OPTIONS}
            isChanged={isFieldChanged("costCentre")}
          />
          <DropdownField
            label="Status"
            fieldPath="status"
            value={bookingsContext.selectedItem?.status || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            options={STATUS_OPTIONS}
            required={true}
            isChanged={isFieldChanged("status")}
          />
          <TextField
            label="Notes"
            fieldPath="notes"
            value={bookingsContext.selectedItem?.notes || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            multiline={true}
            rows={4}
            isChanged={isFieldChanged("notes")}
          />
        </div>
        <div className="col-half">
          <RefField
            label="Company"
            fieldPath="companyId"
            value={bookingsContext.selectedItem?.companyId || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            collectionName="companies"
            displayFields={["name"]}
            isChanged={isFieldChanged("companyId")}
            setFieldLoading={bookingsContext.setFieldLoading}
          />
          <RefField
            label="Booker"
            fieldPath="bookerId"
            value={bookingsContext.selectedItem?.bookerId || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            collectionName="contacts"
            displayFields={["general.firstName", "general.lastName"]}
            isChanged={isFieldChanged("bookerId")}
            setFieldLoading={bookingsContext.setFieldLoading}
          />
        </div>
        <div className="col-full">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "1rem",
            }}
          >
            <DownloadPDFButton
              bookingData={bookingsContext.selectedItem}
              stays={stays}
            />
          </div>
          {renderRelatedStays()}
        </div>
      </CommonForm>

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

        .stay-room,
        .stay-status {
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
