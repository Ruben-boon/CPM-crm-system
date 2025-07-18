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


export function StayCard({
  stay,
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
    commissionInvoice: stay?.commissionInvoice || "",
    hotelConfirmationNo: stay?.hotelConfirmationNo || "",
  });
  const [savingFields, setSavingFields] = useState({});

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
    if (value !== stay[fieldPath]) {
      setSavingFields((prev) => ({ ...prev, [fieldPath]: true }));

      try {
        // Create updated stay with all the current changes from the form
        const updatedStay = {
          ...stay,
          ...stayUpdate,
        };

        const result = await updateDocument("stays", stay._id, updatedStay);
        const fieldLabel = fieldPath
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        if (result.success) {
          toast.success(`${fieldLabel} updated`);
        } else {
          toast.error(
            `Failed to update ${fieldLabel.toLowerCase()}: ${
              result.error || "Unknown error"
            }`
          );
        }
      } catch (error) {
        console.error(`Error updating stay field ${fieldPath}:`, error);
        const fieldLabel = fieldPath.replace(/([A-Z])/g, " $1").toLowerCase();
        toast.error(`Failed to update ${fieldLabel}`);
      } finally {
        setSavingFields((prev) => ({ ...prev, [fieldPath]: false }));
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
    // Pass the unique stay._id instead of the index
    onRemoveStay(stay._id);
  };

  const stayConfirmationNo = stay.confirmationNo
    ? formatConfirmationNumber(stay.confirmationNo, "stay")
    : null;

  return (
    <div className="stay-item">
      <div className="stay-info">
        <div className="stay-header">
          <div className="stay-hotel">{stay.hotelName}</div>

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
            {/* Hotel Confirmation No field */}
            <div
              className={`form-field ${
                savingFields.hotelConfirmationNo ? "field-saving" : ""
              }`}
            >
              <label className="field-label">Hotel Confirmation No.</label>
              <input
                type="text"
                value={stayUpdate.hotelConfirmationNo}
                onChange={(e) =>
                  handleStayFieldChange("hotelConfirmationNo", e.target.value)
                }
                onBlur={() =>
                  handleAutoSave(
                    "hotelConfirmationNo",
                    stayUpdate.hotelConfirmationNo
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAutoSave(
                      "hotelConfirmationNo",
                      stayUpdate.hotelConfirmationNo
                    );
                  }
                }}
                className="input-base"
                disabled={savingFields.hotelConfirmationNo}
                placeholder="Enter hotel confirmation..."
              />
              {savingFields.hotelConfirmationNo && (
                <div className="save-indicator">Saving...</div>
              )}
            </div>

            {/* Purchase Invoice field with auto-save functionality */}
            <div
              className={`form-field ${
                savingFields.purchaseInvoice ? "field-saving" : ""
              }`}
            >
              <label className="field-label">Purchase Invoice</label>
              <input
                type="text"
                value={stayUpdate.purchaseInvoice}
                onChange={(e) =>
                  handleStayFieldChange("purchaseInvoice", e.target.value)
                }
                onBlur={() =>
                  handleAutoSave("purchaseInvoice", stayUpdate.purchaseInvoice)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAutoSave(
                      "purchaseInvoice",
                      stayUpdate.purchaseInvoice
                    );
                  }
                }}
                className="input-base"
                disabled={savingFields.purchaseInvoice}
                placeholder="Enter invoice number..."
              />
              {savingFields.purchaseInvoice && (
                <div className="save-indicator">Saving...</div>
              )}
            </div>

            {/* --- ADDED START --- */}
            <div
              className={`form-field ${
                savingFields.commissionInvoice ? "field-saving" : ""
              }`}
            >
              <label className="field-label">Commission Invoice</label>
              <input
                type="text"
                value={stayUpdate.commissionInvoice}
                onChange={(e) =>
                  handleStayFieldChange("commissionInvoice", e.target.value)
                }
                onBlur={() =>
                  handleAutoSave(
                    "commissionInvoice",
                    stayUpdate.commissionInvoice
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAutoSave(
                      "commissionInvoice",
                      stayUpdate.commissionInvoice
                    );
                  }
                }}
                className="input-base"
                disabled={savingFields.commissionInvoice}
                placeholder="Enter invoice number..."
              />
              {savingFields.commissionInvoice && (
                <div className="save-indicator">Saving...</div>
              )}
            </div>
            {/* --- ADDED END --- */}
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