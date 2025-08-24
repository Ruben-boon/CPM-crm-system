"use client";
import { useStaysData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { MultiRefField } from "../fields/MultiRefField";
import { RadioField } from "../fields/RadioField";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchDocuments } from "@/app/actions/crudActions";
import { toast } from "sonner";
import { RelatedItems } from "../fields/RelatedItems";
import { SkeletonLoader } from "../SkeletonLoader";
import { CreditCard, Calendar, Euro } from "lucide-react";
import {
  CURRENCY_OPTIONS,
  PAYMENT_INVOICE_PAID_OPTIONS,
  CANCELLATION_OPTIONS,
  PAYMENT_INSTRUCTION_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  PREPAID_OPTIONS,
  DEFAULT_ROOM_TYPE_OPTIONS,
} from "./stayConstants";

export function StayForm() {
  const staysContext = useStaysData();
  const router = useRouter();
  const [roomTypeOptions, setRoomTypeOptions] = useState(
    DEFAULT_ROOM_TYPE_OPTIONS
  );
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  useEffect(() => {
    if (staysContext.selectedItem?.hotelId) {
      loadRoomTypesFromHotel(staysContext.selectedItem.hotelId);
    }
  }, [staysContext.selectedItem?.hotelId]);

  const loadRoomTypesFromHotel = async (hotelId: string) => {
    try {
      setLoadingRoomTypes(true);

      const result = await searchDocuments("hotels", hotelId, "_id");

      if (
        Array.isArray(result) &&
        result.length > 0 &&
        (result[0] as any).roomTypes?.length > 0
      ) {
        const hotelRoomTypes = (result[0] as any).roomTypes.map((type: string) => ({
          value: type,
          label: type,
        }));
        setRoomTypeOptions(hotelRoomTypes);

        if (
          staysContext.selectedItem?.roomType &&
          !(result[0] as any).roomTypes.includes(staysContext.selectedItem.roomType)
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
    _displayValue?: string | string[]
  ) => {
    staysContext.updateField(fieldPath, value);
  };

  const handlePaymentInstructionChange = (fieldPath: string, value: string) => {
    if (value === "custom") {
      staysContext.updateField(fieldPath, "");
    } else {
      staysContext.updateField(fieldPath, value);
    }
  };

  const handlePurchaseInvoicePaidChange = (fieldPath: string, value: string) => {
    if (value === "custom") {
      staysContext.updateField(fieldPath, "");
    } else {
      staysContext.updateField(fieldPath, value);
    }
  };

  const isFieldChanged = (fieldPath: string) => {
    return !!staysContext.pendingChanges[fieldPath];
  };

  const handleRelationClick = (itemId: string, collection: string) => {
    router.push(`/${collection}/${itemId}`);
  };

  const isStandardPaymentInstruction =
    staysContext.selectedItem?.paymentInstructions &&
    PAYMENT_INSTRUCTION_OPTIONS.some(
      (option) => option.value === staysContext.selectedItem?.paymentInstructions
    );

  const showCustomPaymentField = !isStandardPaymentInstruction;

  const paymentInstructionDropdownValue = isStandardPaymentInstruction
    ? staysContext.selectedItem?.paymentInstructions
    : "custom";

  const isStandardCancellation =
    staysContext.selectedItem?.cancellations &&
    CANCELLATION_OPTIONS.some(
      (option) => option.value === staysContext.selectedItem?.cancellations
    );

  const showCustomCancellationField = !isStandardCancellation;

  const isStandardPurchaseInvoicePaid =
    staysContext.selectedItem?.purchaseInvoicePaid &&
    PAYMENT_INVOICE_PAID_OPTIONS.some(
      (option) => option.value === staysContext.selectedItem?.purchaseInvoicePaid
    );

  const showCustomPurchaseInvoicePaidField = !isStandardPurchaseInvoicePaid;

  const purchaseInvoicePaidDropdownValue = isStandardPurchaseInvoicePaid
    ? staysContext.selectedItem?.purchaseInvoicePaid
    : "custom";

  return (
    <>
      <div className="form-wrapper">
        <CommonForm
          dataContext={staysContext}
          itemName="Stay"
          entityType="stay"
          basePath="stays"
          displayName={getDisplayName}
        >
          {!staysContext.selectedItem ? (
            <div className="loading-skeleton">
              <SkeletonLoader count={8} />
            </div>
          ) : (
            <>
              <div className="col-half">
                <RefField
                  label="Hotel"
                  fieldPath="hotelId"
                  nameFieldPath="hotelName"
                  value={staysContext.selectedItem?.hotelId || ""}
                  onChange={handleFieldChange}
                  isEditing={staysContext.isEditing}
                  collectionName="hotels"
                  displayFields={["name", "address"]}
                  isChanged={isFieldChanged("hotelId")}
                  setFieldLoading={() => {}}
                />
                <TextField
                  label="Hotel Confirmation No."
                  fieldPath="hotelConfirmationNo"
                  value={staysContext.selectedItem?.hotelConfirmationNo || ""}
                  onChange={handleFieldChange}
                  updateField={staysContext.updateField}
                  isEditing={staysContext.isEditing}
                  isChanged={isFieldChanged("hotelConfirmationNo")}
                />
                <DropdownField
                  label="Room Type"
                  fieldPath="roomType"
                  value={staysContext.selectedItem?.roomType || ""}
                  onChange={handleFieldChange}
                  isEditing={staysContext.isEditing}
                  options={roomTypeOptions}
                  isChanged={isFieldChanged("roomType")}
                  placeholder="Select a room type"
                  isLoading={loadingRoomTypes}
                  disabled={
                    loadingRoomTypes || !staysContext.selectedItem?.hotelId
                  }
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
                      className={`currency-sign ${
                        isFieldChanged("roomCurrency") ? "field-changed" : ""
                      }`}
                      compact={true}
                    />
                    <TextField
                      fieldPath="roomPrice"
                      label=""
                      type="number"
                      className={`currency-amount ${
                        isFieldChanged("roomPrice") ? "field-changed" : ""
                      }`}
                      value={staysContext.selectedItem?.roomPrice || ""}
                      onChange={handleFieldChange}
                      updateField={staysContext.updateField}
                      isEditing={staysContext.isEditing}
                    />
                  </div>
                </div>
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
                  setFieldLoading={() => {}}
                />
                <div className="currency-group">
                  <label className="field-label">Tax</label>
                  <div className="grouper">
                    <DropdownField
                      fieldPath="taxCurrency"
                      options={CURRENCY_OPTIONS}
                      value={
                        staysContext.selectedItem?.taxCurrency ||
                        staysContext.selectedItem?.roomCurrency ||
                        "EUR"
                      }
                      onChange={handleFieldChange}
                      isEditing={staysContext.isEditing}
                      className={`currency-sign ${
                        isFieldChanged("taxCurrency") ? "field-changed" : ""
                      }`}
                      compact={true}
                    />
                    <TextField
                      fieldPath="taxAmount"
                      label=""
                      type="number"
                      className={`currency-amount ${
                        isFieldChanged("taxAmount") ? "field-changed" : ""
                      }`}
                      value={staysContext.selectedItem?.taxAmount || ""}
                      onChange={handleFieldChange}
                      updateField={staysContext.updateField}
                      isEditing={staysContext.isEditing}
                    />
                  </div>
                </div>

                {/* Booking Terms Section */}
                <div className="form-section">
                  <div className="section-header">
                    <Calendar size={20} />
                    <h3>Booking Terms</h3>
                  </div>

                  <DropdownField
                    label="Payment Type"
                    fieldPath="paymentType"
                    value={staysContext.selectedItem?.paymentType || ""}
                    onChange={handleFieldChange}
                    isEditing={staysContext.isEditing}
                    options={PAYMENT_TYPE_OPTIONS}
                    isChanged={isFieldChanged("paymentType")}
                    placeholder="Select a payment type"
                  />

                  <DropdownField
                    label="Payment Instructions"
                    fieldPath="paymentInstructions"
                    value={paymentInstructionDropdownValue || ""}
                    onChange={handlePaymentInstructionChange}
                    isEditing={staysContext.isEditing}
                    options={PAYMENT_INSTRUCTION_OPTIONS}
                    isChanged={isFieldChanged("paymentInstructions")}
                  />

                  {showCustomPaymentField && (
                    <TextField
                      fieldPath="paymentInstructions"
                      label=""
                      value={
                        isStandardPaymentInstruction
                          ? ""
                          : staysContext.selectedItem?.paymentInstructions || ""
                      }
                      onChange={handleFieldChange}
                      updateField={staysContext.updateField}
                      isEditing={staysContext.isEditing}
                      multiline={true}
                      rows={4}
                      placeholder="Enter custom payment instructions"
                      isChanged={isFieldChanged("paymentInstructions")}
                    />
                  )}

                  <DropdownField
                    label="Cancellations"
                    fieldPath="cancellations"
                    value={staysContext.selectedItem?.cancellations || ""}
                    onChange={handleFieldChange}
                    isEditing={staysContext.isEditing}
                    options={CANCELLATION_OPTIONS}
                    isChanged={isFieldChanged("cancellations")}
                  />

                  {showCustomCancellationField && (
                    <TextField
                      fieldPath="cancellations"
                      label=""
                      value={
                        isStandardCancellation
                          ? ""
                          : staysContext.selectedItem?.cancellations || ""
                      }
                      onChange={handleFieldChange}
                      updateField={staysContext.updateField}
                      isEditing={staysContext.isEditing}
                      multiline={true}
                      rows={4}
                      placeholder="Enter custom cancellation policy"
                      isChanged={isFieldChanged("cancellations")}
                    />
                  )}
                </div>

                {/* Invoice & Payment Section */}
                <div className="form-section">
                  <div className="section-header">
                    <Euro size={20} />
                    <h3>Invoice & Payment</h3>
                  </div>

                  <RadioField
                    label="Prepaid"
                    fieldPath="prepaid"
                    value={staysContext.selectedItem?.prepaid || "no"}
                    updateField={staysContext.updateField}
                    isEditing={staysContext.isEditing}
                    options={PREPAID_OPTIONS}
                    required={true}
                    isChanged={isFieldChanged("prepaid")}
                  />

                  {/* Conditional prepaid details field */}
                  {staysContext.selectedItem?.prepaid === "yes" && (
                    <TextField
                      label="Prepaid Details"
                      fieldPath="prepaidDetails"
                      value={staysContext.selectedItem?.prepaidDetails || ""}
                      onChange={handleFieldChange}
                      updateField={staysContext.updateField}
                      isEditing={staysContext.isEditing}
                      placeholder="e.g., Prepaid credit card 18/7"
                      isChanged={isFieldChanged("prepaidDetails")}
                    />
                  )}

                  {/* Purchase Invoice field */}
                  <TextField
                    label="Purchase Invoice"
                    fieldPath="purchaseInvoice"
                    value={staysContext.selectedItem?.purchaseInvoice || ""}
                    onChange={handleFieldChange}
                    updateField={staysContext.updateField}
                    isEditing={staysContext.isEditing}
                    isChanged={isFieldChanged("purchaseInvoice")}
                  />

                  <TextField
                    label="Commission Invoice"
                    fieldPath="commissionInvoice"
                    value={staysContext.selectedItem?.commissionInvoice || ""}
                    onChange={handleFieldChange}
                    updateField={staysContext.updateField}
                    isEditing={staysContext.isEditing}
                    isChanged={isFieldChanged("commissionInvoice")}
                  />
                </div>
              </div>

              <div className="col-half">
                <TextField
                  label="Check-in Date"
                  fieldPath="checkInDate"
                  value={staysContext.selectedItem?.checkInDate || ""}
                  onChange={handleFieldChange}
                  updateField={staysContext.updateField}
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
                  updateField={staysContext.updateField}
                  isEditing={staysContext.isEditing}
                  type="date"
                  required={true}
                  isChanged={isFieldChanged("checkOutDate")}
                />

                {/* Status field */}
                <DropdownField
                  label="Status"
                  fieldPath="status"
                  value={staysContext.selectedItem?.status || "unconfirmed"}
                  onChange={handleFieldChange}
                  isEditing={staysContext.isEditing}
                  options={STATUS_OPTIONS}
                  required={true}
                  isChanged={isFieldChanged("status")}
                />

                <TextField
                  label="Special Requests"
                  fieldPath="specialRequests"
                  value={staysContext.selectedItem?.specialRequests || ""}
                  onChange={handleFieldChange}
                  updateField={staysContext.updateField}
                  isEditing={staysContext.isEditing}
                  isChanged={isFieldChanged("specialRequests")}
                  multiline={true}
                  rows={4}
                />
                <TextField
                  label="Remarks"
                  fieldPath="remarks"
                  value={staysContext.selectedItem?.remarks || ""}
                  onChange={handleFieldChange}
                  updateField={staysContext.updateField}
                  isEditing={staysContext.isEditing}
                  multiline={true}
                  rows={4}
                  isChanged={isFieldChanged("remarks")}
                />
                <TextField
                  label="Admin remarks (does NOT appear on confirmation)"
                  fieldPath="adminRemarks"
                  value={staysContext.selectedItem?.adminRemarks || ""}
                  onChange={handleFieldChange}
                  updateField={staysContext.updateField}
                  isEditing={staysContext.isEditing}
                  multiline={true}
                  rows={4}
                  isChanged={isFieldChanged("adminRemarks")}
                />

                {/* Payment Information Section */}
                <div className="form-section">
                  <div className="section-header">
                    <CreditCard size={20} />
                    <h3>Payment Information</h3>
                  </div>
                  
                  <DropdownField
                    label="Purchase invoice paid?"
                    fieldPath="purchaseInvoicePaid"
                    value={purchaseInvoicePaidDropdownValue || PAYMENT_INVOICE_PAID_OPTIONS[0].value}
                    onChange={handlePurchaseInvoicePaidChange}
                    isEditing={staysContext.isEditing}
                    options={PAYMENT_INVOICE_PAID_OPTIONS}
                    isChanged={isFieldChanged("purchaseInvoicePaid")}
                    placeholder="Select payment status"
                  />

                  {showCustomPurchaseInvoicePaidField && (
                    <TextField
                      fieldPath="purchaseInvoicePaid"
                      label=""
                      value={
                        isStandardPurchaseInvoicePaid
                          ? ""
                          : staysContext.selectedItem?.purchaseInvoicePaid || ""
                      }
                      onChange={handleFieldChange}
                      updateField={staysContext.updateField}
                      isEditing={staysContext.isEditing}
                      multiline={true}
                      rows={4}
                      placeholder="Enter custom payment status"
                      isChanged={isFieldChanged("purchaseInvoicePaid")}
                    />
                  )}

                  <div className="currency-group">
                    <label className="field-label">Payment Currency</label>
                    <DropdownField
                      fieldPath="paymentCurrency"
                      value={staysContext.selectedItem?.paymentCurrency || "EUR"}
                      onChange={handleFieldChange}
                      isEditing={staysContext.isEditing}
                      options={CURRENCY_OPTIONS}
                      isChanged={isFieldChanged("paymentCurrency")}
                      placeholder="Select currency"
                    />
                  </div>

                  <TextField
                    label="Payment Deadline"
                    fieldPath="paymentDeadline"
                    value={staysContext.selectedItem?.paymentDeadline || ""}
                    onChange={handleFieldChange}
                    updateField={staysContext.updateField}
                    isEditing={staysContext.isEditing}
                    type="date"
                    isChanged={isFieldChanged("paymentDeadline")}
                  />

                  <TextField
                    label="Payment Date"
                    fieldPath="paymentDate"
                    value={staysContext.selectedItem?.paymentDate || ""}
                    onChange={handleFieldChange}
                    updateField={staysContext.updateField}
                    isEditing={staysContext.isEditing}
                    type="date"
                    isChanged={isFieldChanged("paymentDate")}
                  />
                </div>
              </div>

              <div className="col-full">
                {staysContext.selectedItem?._id && !staysContext.isEditing && (
                  <div className="related-section">
                    <RelatedItems
                      id={staysContext.selectedItem._id}
                      referenceField="staySummaries.stayId" // This is the correct field path
                      collectionName="bookings"
                      displayFields={[
                        { path: "confirmationNo" },
                        { path: "travelPeriodStart", label: "Travel Period" },
                        { path: "travelPeriodEnd" },
                      ]}
                      title="Bookings including this stay"
                      emptyMessage="No related bookings found"
                      onItemClick={handleRelationClick}
                      isFormEditing={staysContext.isEditing}
                      onLoadingChange={() => {}}
                      showGuestNames={true}
                      showHotelNames={true}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <style jsx>{`
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
            .currency-group {
              margin-bottom: 16px;
            }
            .related-section {
              margin-top: 24px;
            }
            .loading-skeleton {
              width: 100%;
              padding: 1rem;
            }
            .form-section {
              margin: 24px 0;
              padding: 20px;
              background-color: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .section-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 2px solid #e2e8f0;
            }
            .section-header h3 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
            }
            .section-header svg {
              color: #3b82f6;
            }
          `}</style>
        </CommonForm>
      </div>
    </>
  );
}
