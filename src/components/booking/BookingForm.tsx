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

  const getDisplayName = (item) => {
    return item.confirmationNo || "this booking";
  };

  const handleFieldChange = (fieldPath, value, displayValue) => {
    bookingsContext.updateField(fieldPath, value);
  };

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

  const handleEditStay = (stay) => {
    setSelectedStay(stay);
    setIsCopyMode(false);
    setIsModalOpen(true);
  };

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

  const handleViewStay = (stayId) => {
    window.open(`/stays/${stayId}`, "_blank");
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[date.getMonth()];

      return `${day} ${month}`;
    } catch (error) {
      return dateString;
    }
  };

  const getGuestCountText = (guestIds: any[] | undefined) => {
    if (!guestIds || !Array.isArray(guestIds)) return "0 guests";

    const count = guestIds.length;
    return count === 1 ? "1 guest" : `${count} guests`;
  };

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
                    <div className="stay-hotel">{stay.hotelName}</div>
                    <div className="stay-dates">
                      {formatDate(stay.checkInDate)} -{" "}
                      {formatDate(stay.checkOutDate)}
                    </div>
                    <div className="stay-guests">
                      {getGuestCountText(stay.guestIds) ? (
                        <span>{getGuestCountText(stay.guestIds)}</span>
                      ) : (
                        <span className="no-guests">No guests assigned</span>
                      )}
                    </div>
                    <div className="stay-details">
                      <div>
                        {stay.roomCurrency} {stay.roomPrice}
                      </div>
                    </div>
                    <span className="stay-status">
                      Status: {getStatusLabel(stay.status)}
                    </span>
                  </div>
                  <div className="stay-actions">
                    <div className="edit-button-group">
                      {!bookingsContext.isEditing && (
                        <Button
                          icon={ExternalLink}
                          onClick={() => handleViewStay(stay._id)}
                          size="sm"
                          intent="ghost"
                          title="View in new tab"
                        >
                          View
                        </Button>
                      )}
                      {bookingsContext.isEditing && (
                        <>
                          <Button
                            icon={Copy}
                            onClick={() => handleCopyStay(stay)}
                            size="sm"
                            intent="outline"
                            title="Copy stay"
                          ></Button>
                          <Button
                            icon={Edit}
                            onClick={() => handleEditStay(stay)}
                            size="sm"
                            intent="outline"
                            title="Edit stay"
                          >
                            Edit
                          </Button>
                        </>
                      )}
                    </div>

                    {bookingsContext.isEditing && (
                      <>
                        <Button
                          icon={X}
                          onClick={() => handleRemoveStay(stay, index)}
                          size="sm"
                          className="button--danger"
                          intent="outline"
                          title="Remove stay from booking"
                        >
                          Remove
                        </Button>
                      </>
                    )}
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
          <DropdownField
            label="Cost Centre"
            fieldPath="costCentre"
            value={bookingsContext.selectedItem?.costCentre || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            options={COST_CENTRE_OPTIONS}
            isChanged={isFieldChanged("costCentre")}
          />
          <TextField
            label="Arrival date"
            fieldPath="travelPeriodStart"
            value={bookingsContext.selectedItem?.travelPeriodStart || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            type="date"
            required={true}
            isChanged={isFieldChanged("travelPeriodStart")}
          />
          <TextField
            label="Departure date"
            fieldPath="travelPeriodEnd"
            value={bookingsContext.selectedItem?.travelPeriodEnd || ""}
            onChange={handleFieldChange}
            isEditing={bookingsContext.isEditing}
            type="date"
            required={true}
            isChanged={isFieldChanged("travelPeriodEnd")}
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
            displayFields={["name", "address", "postal_code"]}
            isChanged={isFieldChanged("companyId")}
            setFieldLoading={bookingsContext.setFieldLoading}
            displaySeparator="<br>" 
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
          <DownloadPDFButton
            bookingData={bookingsContext.selectedItem}
            stays={stays}
            disabled={bookingsContext.isEditing}
          />
        </div>
        <div className="col-full">{renderRelatedStays()}</div>
      </CommonForm>
    </>
  );
}
