
"use client";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { DownloadPDFButton } from "../pdf/DownloadPDFButton";
import { COST_CENTRE_OPTIONS, BOOKING_STATUS_OPTIONS } from "./bookingConstants";
import { determineBookingStatus, getStatusLabel } from "./bookingStatusUtils";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

// Define constants for dropdown options

export function BookingDetails({ bookingsContext, stays }) {
  const [statusValue, setStatusValue] = useState("upcoming_no_action");
  const trackerRef = useRef({ downloadClicked: false, emailClicked: false });
  
  const handleFieldChange = (fieldPath, value, displayValue) => {
    bookingsContext.updateField(fieldPath, value);
  };

  const isFieldChanged = (fieldPath) => {
    return !!bookingsContext.pendingChanges[fieldPath];
  };
  
  // Regular status update based on data changes and page load
  useEffect(() => {
    if (bookingsContext.selectedItem) {
      console.log('Checking booking status (page load or data change)');
      const newStatus = determineBookingStatus(bookingsContext.selectedItem, stays);
      setStatusValue(newStatus);
      
      // Update the status in the context if it's different
      if (bookingsContext.selectedItem.status !== newStatus) {
        console.log('Status updated from', bookingsContext.selectedItem.status, 'to', newStatus);
        bookingsContext.updateField("status", newStatus);
      }
    }
  }, [
    bookingsContext.selectedItem,  // Check on any booking change including load
    bookingsContext.selectedItem?.confirmationSent,
    bookingsContext.selectedItem?.travelPeriodEnd,
    bookingsContext.selectedItem?.salesInvoice,
    bookingsContext.selectedItem?.commissionInvoiceNo,
    stays,
  ]);
  
  // Track PDF downloads and email clicks
  useEffect(() => {
    // Get the download and email buttons
    const downloadButton = document.querySelector('.download-button-container button:first-child');
    const emailButton = document.querySelector('.download-button-container a');
    
    if (downloadButton && emailButton) {
      // Create event handlers for each button
      const handleDownloadClick = () => {
        trackerRef.current.downloadClicked = true;
        checkBothActions();
      };
      
      const handleEmailClick = () => {
        trackerRef.current.emailClicked = true;
        checkBothActions();
      };
      
      // Add event listeners
      downloadButton.addEventListener('click', handleDownloadClick);
      emailButton.addEventListener('click', handleEmailClick);
      
      // Clean up event listeners when component unmounts
      return () => {
        downloadButton.removeEventListener('click', handleDownloadClick);
        emailButton.removeEventListener('click', handleEmailClick);
      };
    }
  }, [bookingsContext.selectedItem?._id, stays]);
  
  // Check if both actions were completed
  const checkBothActions = () => {
    if (trackerRef.current.downloadClicked && trackerRef.current.emailClicked) {
      if (!bookingsContext.selectedItem?.confirmationSent) {
        bookingsContext.updateField("confirmationSent", true);
        toast.success("Confirmation marked as sent");
      }
    }
  };

  return (
    <>
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

        <div className="status-field">
          <label className="field-label">Status</label>
          <div className="status-value">
            {getStatusLabel(statusValue, BOOKING_STATUS_OPTIONS)}
          </div>
          {isFieldChanged("status") && (
            <div className="field-changed-indicator"></div>
          )}
        </div>

        <TextField
          label="Commission invoice no."
          fieldPath="commissionInvoiceNo"
          value={bookingsContext.selectedItem?.commissionInvoiceNo || ""}
          onChange={handleFieldChange}
          isEditing={bookingsContext.isEditing}
          isChanged={isFieldChanged("commissionInvoiceNo")}
        />
        <TextField
          label="Sales invoice"
          fieldPath="salesInvoice"
          value={bookingsContext.selectedItem?.salesInvoice || ""}
          onChange={handleFieldChange}
          isEditing={bookingsContext.isEditing}
          isChanged={isFieldChanged("salesInvoice")}
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
        <div className="checkbox-field">
          <input
            type="checkbox"
            id="confirmationSent"
            checked={bookingsContext.selectedItem?.confirmationSent || false}
            onChange={(e) => handleFieldChange("confirmationSent", e.target.checked)}
            disabled={!bookingsContext.isEditing}
          />
          <label htmlFor="confirmationSent" className="checkbox-label">
            Confirmation sent
          </label>
          {isFieldChanged("confirmationSent") && (
            <div className="field-changed-indicator"></div>
          )}
        </div>
      </div>
    </>
  );
}

<style jsx>{`
        .status-field {
          margin-bottom: 16px;
          position: relative;
        }
        .field-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #374151;
        }
        .status-value {
          padding: 8px 12px;
          border-radius: 6px;
          background-color: #f3f4f6;
          font-size: 14px;
          line-height: 1.5;
          border: 1px solid #e5e7eb;
        }
        .field-changed-indicator {
          position: absolute;
          top: 0;
          right: 0;
          height: 8px;
          width: 8px;
          border-radius: 50%;
          background-color: #3b82f6;
        }
        
        .checkbox-field {
          margin-top: 16px;
          margin-bottom: 16px;
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .checkbox-label {
          margin-left: 8px;
          font-size: 14px;
          cursor: pointer;
        }
        
        input[type="checkbox"] {
          cursor: pointer;
        }
      `}</style>