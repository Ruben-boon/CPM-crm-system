"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useBookingsData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { MultiRefField } from "../fields/MultiRefField";

interface BookingFormData {
  costCentre: string;
  bookingDate: string;
  bookerId: string;
  bookerName: string;
  hotelId: string;
  hotelName: string;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  guestIds: string[];
  guestNames: string[];
  guestRemarks: string[];
  hotelConfirmationNo: string;
  roomType: string;
  roomRate: string;
  paymentInstructions: string;
  cancellations: string;
  generalRemarks: string;
}

const INITIAL_FORM_STATE: BookingFormData = {
  costCentre: "",
  bookingDate: new Date().toISOString().split('T')[0],
  bookerId: "",
  bookerName: "",
  hotelId: "",
  hotelName: "",
  arrivalDate: "",
  departureDate: "",
  nights: 0,
  guestIds: [],
  guestNames: [],
  guestRemarks: [],
  hotelConfirmationNo: "",
  roomType: "",
  roomRate: "",
  paymentInstructions: "",
  cancellations: "",
  generalRemarks: "",
};

const COST_CENTRE_OPTIONS = [
  { value: "SALES", label: "Sales Department" },
  { value: "IT", label: "IT Department" },
  { value: "HR", label: "Human Resources" },
  { value: "FINANCE", label: "Finance Department" },
] as const;

export function BookingForm() {
  const {
    selectedItem,
    updateItem,
    createItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
  } = useBookingsData();

  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate nights when arrival or departure dates change
  useEffect(() => {
    if (formData.arrivalDate && formData.departureDate) {
      const arrival = new Date(formData.arrivalDate);
      const departure = new Date(formData.departureDate);
      const diffTime = departure.getTime() - arrival.getTime();
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (nights >= 0) {
        setFormData(prev => ({ ...prev, nights }));
      }
    }
  }, [formData.arrivalDate, formData.departureDate]);

  const handleChange = (field: keyof BookingFormData, value: string | string[], displayValue?: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "bookerId" ? { bookerName: displayValue } : {}),
      ...(displayValue && field === "hotelId" ? { hotelName: displayValue } : {}),
      ...(displayValue && field === "guestIds" ? { guestNames: displayValue } : {}),
    }));

    setPendingChanges((prev) => ({
      ...prev,
      [field]: {
        oldValue: selectedItem?.[field] || "",
        newValue: value,
      },
    }));
  };

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        costCentre: selectedItem.costCentre || "",
        bookingDate: selectedItem.bookingDate || new Date().toISOString().split('T')[0],
        bookerId: selectedItem.bookerId || "",
        bookerName: selectedItem.bookerName || "",
        hotelId: selectedItem.hotelId || "",
        hotelName: selectedItem.hotelName || "",
        arrivalDate: selectedItem.arrivalDate || "",
        departureDate: selectedItem.departureDate || "",
        nights: selectedItem.nights || 0,
        guestIds: selectedItem.guestIds || [],
        guestNames: selectedItem.guestNames || [],
        guestRemarks: selectedItem.guestRemarks || [],
        hotelConfirmationNo: selectedItem.hotelConfirmationNo || "",
        roomType: selectedItem.roomType || "",
        roomRate: selectedItem.roomRate || "",
        paymentInstructions: selectedItem.paymentInstructions || "",
        cancellations: selectedItem.cancellations || "",
        generalRemarks: selectedItem.generalRemarks || "",
      });
    }
  }, [selectedItem]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemData = {
        ...selectedItem,
        ...formData,
        // Remove display-only fields
        bookerName: undefined,
        hotelName: undefined,
        guestNames: undefined,
      };

      const success = selectedItem?._id
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(
          `Booking ${selectedItem?._id ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setPendingChanges({});
      } else {
        toast.error(
          `Failed to ${selectedItem?._id ? "update" : "create"} booking`
        );
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
        costCentre: selectedItem.costCentre || "",
        bookingDate: selectedItem.bookingDate || "",
        bookerId: selectedItem.bookerId || "",
        bookerName: selectedItem.bookerName || "",
        hotelId: selectedItem.hotelId || "",
        hotelName: selectedItem.hotelName || "",
        arrivalDate: selectedItem.arrivalDate || "",
        departureDate: selectedItem.departureDate || "",
        nights: selectedItem.nights || 0,
        guestIds: selectedItem.guestIds || [],
        guestNames: selectedItem.guestNames || [],
        guestRemarks: selectedItem.guestRemarks || [],
        hotelConfirmationNo: selectedItem.hotelConfirmationNo || "",
        roomType: selectedItem.roomType || "",
        roomRate: selectedItem.roomRate || "",
        paymentInstructions: selectedItem.paymentInstructions || "",
        cancellations: selectedItem.cancellations || "",
        generalRemarks: selectedItem.generalRemarks || "",
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSave} className="booking-form">
      <div className="top-bar">
        <div className="top-bar__title">
          {selectedItem?._id ? "Booking Details" : "New Booking"}
        </div>
        <div className="top-bar__edit">
          {!isEditing && selectedItem?._id && (
            <Button icon={Edit} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}

          {isEditing && (
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
                  isSubmitting || Object.keys(pendingChanges).length === 0
                }
              >
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex">
        <div className="col">
          <DropdownField
            label="Cost Centre"
            value={formData.costCentre}
            onChange={(value) => handleChange("costCentre", value)}
            options={COST_CENTRE_OPTIONS}
            isEditing={isEditing}
            className={pendingChanges["costCentre"] ? "field-changed" : ""}
          />
          <TextField
            label="Booking Date"
            value={formData.bookingDate}
            onChange={(value) => handleChange("bookingDate", value)}
            type="date"
            isEditing={isEditing}
            className={pendingChanges["bookingDate"] ? "field-changed" : ""}
          />
          <RefField
            label="Booker"
            value={formData.bookerId}
            onChange={(value, displayValue) => handleChange("bookerId", value, displayValue)}
            isEditing={isEditing}
            className={pendingChanges["bookerId"] ? "field-changed" : ""}
            collectionName="contacts"
            displayFields={["general.firstName", "general.lastName"]}
            selectedLabel={formData.bookerName}
          />
          <RefField
            label="Hotel"
            value={formData.hotelId}
            onChange={(value, displayValue) => handleChange("hotelId", value, displayValue)}
            isEditing={isEditing}
            className={pendingChanges["hotelId"] ? "field-changed" : ""}
            collectionName="companies"
            displayFields={["supplierName", "entityName"]}
            selectedLabel={formData.hotelName}
          />
          <TextField
            label="Arrival Date"
            value={formData.arrivalDate}
            onChange={(value) => handleChange("arrivalDate", value)}
            type="date"
            isEditing={isEditing}
            className={pendingChanges["arrivalDate"] ? "field-changed" : ""}
          />
          <TextField
            label="Departure Date"
            value={formData.departureDate}
            onChange={(value) => handleChange("departureDate", value)}
            type="date"
            isEditing={isEditing}
            className={pendingChanges["departureDate"] ? "field-changed" : ""}
          />
          <TextField
            label="Nights"
            value={formData.nights.toString()}
            onChange={(value) => handleChange("nights", value)}
            type="number"
            disabled={true}
            isEditing={false}
          />
          <MultiRefField
            label="Guests"
            value={formData.guestIds}
            onChange={(values, displayValues) =>
              handleChange("guestIds", values, displayValues)
            }
            isEditing={isEditing}
            className={pendingChanges["guestIds"] ? "field-changed" : ""}
            collectionName="contacts"
            displayFields={["general.firstName", "general.lastName", "general.remark"]}
            selectedLabels={formData.guestNames}
          />
        </div>
        <div className="col">
          <TextField
            label="Hotel Confirmation No."
            value={formData.hotelConfirmationNo}
            onChange={(value) => handleChange("hotelConfirmationNo", value)}
            isEditing={isEditing}
            className={pendingChanges["hotelConfirmationNo"] ? "field-changed" : ""}
          />
          <TextField
            label="Room Type"
            value={formData.roomType}
            onChange={(value) => handleChange("roomType", value)}
            isEditing={isEditing}
            className={pendingChanges["roomType"] ? "field-changed" : ""}
          />
          <TextField
            label="Room Rate"
            value={formData.roomRate}
            onChange={(value) => handleChange("roomRate", value)}
            isEditing={isEditing}
            className={pendingChanges["roomRate"] ? "field-changed" : ""}
          />
          <TextField
            label="Payment Instructions"
            value={formData.paymentInstructions}
            onChange={(value) => handleChange("paymentInstructions", value)}
            isEditing={isEditing}
            className={pendingChanges["paymentInstructions"] ? "field-changed" : ""}
          />
          <TextField
            label="Cancellations"
            value={formData.cancellations}
            onChange={(value) => handleChange("cancellations", value)}
            isEditing={isEditing}
            className={pendingChanges["cancellations"] ? "field-changed" : ""}
          />
          <TextField
            label="General Remarks"
            value={formData.generalRemarks}
            onChange={(value) => handleChange("generalRemarks", value)}
            isEditing={isEditing}
            className={pendingChanges["generalRemarks"] ? "field-changed" : ""}
          />
        </div>
      </div>
    </form>
  );
}