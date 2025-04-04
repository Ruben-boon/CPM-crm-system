"use client";
import { useStaysData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { MultiRefField } from "../fields/MultiRefField";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { searchDocuments } from "@/app/actions/crudActions";
import { toast } from "sonner";

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "€" },
  { value: "USD", label: "$" },
  { value: "GBP", label: "£" },
  { value: "JPY", label: "¥" },
  { value: "CHF", label: "CHF" },
];

const CANCELLATION_OPTIONS = [
  { value: "Cancellations made up to 24 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.", label: "24h" },
  { value: "Cancellations made up to 48 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.", label: "48h" },
  { value: "Cancellations made up to 72 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.", label: "72h" },
];

const PAYMENT_INSTRUCTION_OPTIONS = [
  { value: "Room and breakfast charges, along with applicable taxes, will be billed to the credit card provided by Corporate Meeting Partner. Any additional expenses incurred during the stay will be settled by the guest upon check-out.", label: "Creditcard: Room, breakfast and tax" },
  { value: "Room and applicable tax charges will be billed to the credit card provided by Corporate Meeting Partner. Any additional expenses incurred during the stay will be settled by the guest upon check-out.", label: "Creditcard: Room and tax" },
  { value: "All charges will be billed to the credit card provided by Corporate Meeting Partner.", label: "Creditcard: All charges" },
  { value: "Room and breakfast charges, along with applicable taxes, will be invoiced to Corporate Meeting Partner. Any additional expenses will be settled by the guest upon check-out.", label: "Billed: Room, breakfast and tax" },
  { value: "Room and applicable tax charges will be invoiced to Corporate Meeting Partner. Any additional expenses will be settled by the guest upon check-out.", label: "Billed: Room and tax" },
  { value: "All charges will be invoiced to Corporate Meeting Partner.", label: "Billed: All charges" },
  { value: "All charges will be settled by the guest upon check-out.", label: "Own Account" },
];

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const DEFAULT_ROOM_TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "suite", label: "Suite" },
  { value: "deluxe", label: "Deluxe" },
];

export function StayForm() {
  const staysContext = useStaysData();
  const [roomTypeOptions, setRoomTypeOptions] = useState(DEFAULT_ROOM_TYPE_OPTIONS);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  // Load room types when hotel changes
  useEffect(() => {
    if (staysContext.selectedItem?.hotelId) {
      loadRoomTypesFromHotel(staysContext.selectedItem.hotelId);
    }
  }, [staysContext.selectedItem?.hotelId]);

  // Load room types from hotel
  const loadRoomTypesFromHotel = async (hotelId: string) => {
    try {
      setLoadingRoomTypes(true);
      
      const result = await searchDocuments("hotels", hotelId, "_id");

      if (Array.isArray(result) && result.length > 0 && result[0].roomTypes?.length > 0) {
        const hotelRoomTypes = result[0].roomTypes.map((type) => ({
          value: type,
          label: type,
        }));
        setRoomTypeOptions(hotelRoomTypes);

        if (
          staysContext.selectedItem?.roomType &&
          !result[0].roomTypes.includes(staysContext.selectedItem.roomType)
        ) {
          staysContext.updateField("roomType", "");
        }
      } else {
        setRoomTypeOptions(DEFAULT_ROOM_TYPE_OPTIONS);
      }
    } catch (error) {
      console.error("Error loading room types:", error);
      toast.error("Could not load room types");
      setRoomTypeOptions(DEFAULT_ROOM_TYPE_OPTIONS);
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  const getDisplayName = (item: any) => {
    return item?.reference || "this stay";
  };
  
  const handleFieldChange = (
    fieldPath: string,
    value: string | string[],
    displayValue?: string | string[]
  ) => {
    staysContext.updateField(fieldPath, value);
  };

  const isFieldChanged = (fieldPath: string) => {
    return !!staysContext.pendingChanges[fieldPath];
  };

  return (
    <CommonForm
      dataContext={staysContext}
      itemName="Stay"
      entityType="stay"
      basePath="stays"
      displayName={getDisplayName}
    >
      <div className="col-half">
        <TextField
          label="Check-in Date"
          fieldPath="checkInDate"
          value={staysContext.selectedItem?.checkInDate || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          type="date"
          required={true}
          isChanged={isFieldChanged("checkInDate")}
        />
        <TextField
          label="Check-out Date"
          fieldPath="checkOutDate"
          value={staysContext.selectedItem?.checkOutDate || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          type="date"
          required={true}
          isChanged={isFieldChanged("checkOutDate")}
        />

        <MultiRefField
          label="Guests"
          fieldPath="guestIds"
          value={staysContext.selectedItem?.guestIds || []}
          updateField={staysContext.updateField}
          isEditing={staysContext.isEditing}
          isChanged={isFieldChanged("guestIds")}
          collectionName="contacts"
          displayFields={["general.firstName", "general.lastName"]}
          showQuickAdd={true}
        />
        
        <TextField
          label="Remarks"
          fieldPath="remarks"
          value={staysContext.selectedItem?.remarks || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          multiline={true}
          rows={4}
          isChanged={isFieldChanged("remarks")}
        />

        <DropdownField
          label="Payment Instructions"
          fieldPath="paymentInstructions"
          value={staysContext.selectedItem?.paymentInstructions || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          options={PAYMENT_INSTRUCTION_OPTIONS}
          isChanged={isFieldChanged("paymentInstructions")}
        />

        <DropdownField
          label="Cancellations"
          fieldPath="cancellations"
          value={staysContext.selectedItem?.cancellations || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          options={CANCELLATION_OPTIONS}
          isChanged={isFieldChanged("cancellations")}
        />
      </div>
      
      <div className="col-half">
        <RefField
          label="Hotel"
          fieldPath="hotelId"
          value={staysContext.selectedItem?.hotelId || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          collectionName="hotels"
          displayFields={["name", "address"]}
          isChanged={isFieldChanged("hotelId")}
        />
        
        <DropdownField
          label="Room Type"
          fieldPath="roomType"
          value={staysContext.selectedItem?.roomType || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          options={roomTypeOptions}
          isChanged={isFieldChanged("roomType")}
          placeholder={loadingRoomTypes ? "Loading room types..." : "Select a room type"}
          disabled={loadingRoomTypes || !staysContext.selectedItem?.hotelId}
        />
        
        <div className="currency-group">
          <label className="field-label">Room Price</label>
          <div className="grouper">
            <DropdownField
              fieldPath="roomCurrency"
              options={CURRENCY_OPTIONS}
              value={staysContext.selectedItem?.roomCurrency || "EUR"}
              onChange={handleFieldChange}
              isEditing={staysContext.isEditing}
              className={`currency-sign ${isFieldChanged("roomCurrency") ? "field-changed" : ""}`}
              compact={true}
            />
            <TextField
              fieldPath="roomPrice"
              label=""
              type="number"
              className={`currency-amount ${isFieldChanged("roomPrice") ? "field-changed" : ""}`}
              value={staysContext.selectedItem?.roomPrice || ""}
              onChange={handleFieldChange}
              isEditing={staysContext.isEditing}
            />
          </div>
        </div>
        
        <TextField
          label="Room Number"
          fieldPath="roomNumber"
          value={staysContext.selectedItem?.roomNumber || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          isChanged={isFieldChanged("roomNumber")}
        />
        
        <TextField
          label="Room Notes"
          fieldPath="roomNotes"
          value={staysContext.selectedItem?.roomNotes || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          isChanged={isFieldChanged("roomNotes")}
        />
        
        <DropdownField
          label="Status"
          fieldPath="status"
          value={staysContext.selectedItem?.status || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          options={STATUS_OPTIONS}
          isChanged={isFieldChanged("status")}
        />
        
        <TextField
          label="Special Requests"
          fieldPath="specialRequests"
          value={staysContext.selectedItem?.specialRequests || ""}
          onChange={handleFieldChange}
          isEditing={staysContext.isEditing}
          isChanged={isFieldChanged("specialRequests")}
        />
      </div>

      <style jsx>{`
        .currency-group {
          margin-bottom: 1rem;
        }
        .grouper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .currency-sign {
          width: 80px;
        }
        .currency-amount {
          flex: 1;
        }
      `}</style>
    </CommonForm>
  );
}