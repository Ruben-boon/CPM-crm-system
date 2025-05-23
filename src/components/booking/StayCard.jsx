// StayCard.jsx
"use client";
import { useState } from "react";
import { Edit, ExternalLink, Copy, X } from "lucide-react";
import Button from "@/components/common/Button";
import { updateDocument } from "@/app/actions/crudActions";
import { toast } from "sonner";
import {
  STAY_STATUS_OPTIONS,
  PREPAID_OPTIONS,
  formatDate,
  getGuestCountText,
  getStatusLabel,
} from "./bookingConstants";
import { formatConfirmationNumber } from "../fields/AutoGeneratedField";

// ... (keeping the existing StayCardSkeleton as is)

export function StayCard({
  stay,
  index,
  isEditing,
  isLoading = false,
  onEditStay,
  onCopyStay,
  onViewStay,
  onRemoveStay,
}) {
  const [stayUpdate, setStayUpdate] = useState({
    status: stay?.status || "unconfirmed",
    prepaid: stay?.prepaid || "no",
    prepaidDetails: stay?.prepaidDetails || "",
    purchaseInvoice: stay?.purchaseInvoice || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // If stay is loading or missing, show the skeleton
  if (isLoading || !stay) {
    return <StayCardSkeleton />;
  }

  // Handle field changes for stay updates
  const handleStayFieldChange = (field, value) => {
    setStayUpdate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Auto-save when field loses focus or Enter is pressed
  const handleAutoSave = async (fieldPath, value) => {
    // Only save if the value has changed
    if (value !== stay.purchaseInvoice) {
      setIsSaving(true);

      try {
        // Create updated stay with the changed field
        const updatedStay = {
          ...stay,
          purchaseInvoice: value
        };

        const result = await updateDocument("stays", stay._id, updatedStay);

        if (result.success) {
          toast.success("Purchase invoice updated");
        } else {
          toast.error(
            `Failed to update purchase invoice: ${result.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error updating stay:", error);
        toast.error("Failed to update purchase invoice");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Make sure the View button doesn't trigger form updates
  const handleViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onViewStay(stay._id);
  };

  // Make other button handlers also prevent default
  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEditStay(stay);
  };

  const handleCopyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCopyStay(stay);
  };

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveStay(stay, index);
  };

  const stayConfirmationNo = stay.confirmationNo
    ? formatConfirmationNumber(stay.confirmationNo, "stay")
    : null;

  return (
    <div className="stay-item">
      <div className="stay-info">
        <div className="stay-header">
          <div className="stay-hotel">{stay.hotelName}</div>
          {stayConfirmationNo && (
            <div className="stay-confirmation-no">{stayConfirmationNo}</div>
          )}
        </div>
        <div className="group-row">
          <div className="stay-dates">
            {formatDate(stay.checkInDate)} - {formatDate(stay.checkOutDate)}
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
        </div>

        {/* Add quick fields when in edit mode */}
        {isEditing && (
          <div className="stay-quick-edit">
            {/* Purchase Invoice field with auto-save functionality */}
            <div className={`form-field ${isSaving ? 'field-saving' : ''}`}>
              <label className="field-label">Purchase Invoice</label>
              <input
                type="text"
                value={stayUpdate.purchaseInvoice}
                onChange={(e) => handleStayFieldChange("purchaseInvoice", e.target.value)}
                onBlur={() => handleAutoSave("purchaseInvoice", stayUpdate.purchaseInvoice)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAutoSave("purchaseInvoice", stayUpdate.purchaseInvoice);
                  }
                }}
                className="input-base"
                disabled={isSaving}
                placeholder="Enter invoice number..."
              />
              {isSaving && <div className="save-indicator">Saving...</div>}
            </div>
          </div>
        )}
      </div>
      <div className="stay-actions">
        <div className="edit-button-group">
          {isEditing ? (
            <>
              <Button
                icon={X}
                onClick={handleRemoveClick}
                size="sm"
                className="button--danger"
                intent="outline"
                title="Remove stay from booking"
                type="button"
              >
                Remove
              </Button>
              <Button
                icon={Copy}
                onClick={handleCopyClick}
                size="sm"
                intent="outline"
                title="Copy stay"
                type="button"
              ></Button>
              <Button
                icon={Edit}
                onClick={handleEditClick}
                size="sm"
                intent="outline"
                title="Edit stay"
                type="button"
              >
                Edit
              </Button>
            </>
          ) : (
            // In non-edit mode, just show the "View" button
            <Button
              icon={ExternalLink}
              onClick={handleViewClick}
              size="sm"
              intent="ghost"
              title="View stay details"
              type="button"
            >
              View
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        .save-indicator {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #6b7280;
          background-color: white;
          padding: 0 4px;
        }
        
        .field-saving input {
          background-color: #f9fafb;
        }
        
        .form-field {
          position: relative;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}