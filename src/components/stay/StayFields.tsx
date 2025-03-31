"use client";
import { useState, useEffect } from "react";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { MultiRefField } from "../fields/MultiRefField";
import { searchDocuments } from "@/app/actions/crudActions";
import { toast } from "sonner";
import { RelatedItems } from "../fields/RelatedItems";

interface StayFormData {
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
  remarks: string;
  paymentInstructions: string;
  cancellations: string;
  roomCurrency: string;
}

interface FieldLoadingState {
  guestIds: boolean;
  hotelId: boolean;
}

const INITIAL_FORM_STATE: StayFormData = {
  guestIds: [],
  hotelId: "",
  roomNumber: "",
  roomType: "",
  roomPrice: "",
  roomNotes: "",
  checkInDate: "",
  checkOutDate: "",
  status: "",
  specialRequests: "",
  remarks: "",
  paymentInstructions: "",
  cancellations: "",
  roomCurrency: "EUR",
};

const INITIAL_LOADING_STATE: FieldLoadingState = {
  guestIds: false,
  hotelId: false,
};

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "€" },
  { value: "USD", label: "$" },
  { value: "GBP", label: "£" },
  { value: "JPY", label: "¥" },
  { value: "CHF", label: "CHF" },
];

// Add this constant for cancellation options
const CANCELLATION_OPTIONS = [
  {
    value:
      "Cancellations made up to 24 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.",
    label: "24h",
  },
  {
    value:
      "Cancellations made up to 48 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.",
    label: "48h",
  },
  {
    value:
      "Cancellations made up to 72 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.",
    label: "72h",
  },
];

// First, add the payment instruction options
const PAYMENT_INSTRUCTION_OPTIONS = [
  {
    value:
      "Room and breakfast charges, along with applicable taxes, will be billed to the credit card provided by Corporate Meeting Partner. Any additional expenses incurred during the stay will be settled by the guest upon check-out.",
    label: "Creditcard: Room, breakfast and tax",
  },
  {
    value:
      "Room and applicable tax charges will be billed to the credit card provided by Corporate Meeting Partner. Any additional expenses incurred during the stay will be settled by the guest upon check-out.",
    label: "Creditcard: Room and tax",
  },
  {
    value:
      "All charges will be billed to the credit card provided by Corporate Meeting Partner.",
    label: "Creditcard: All charges",
  },
  {
    value:
      "Room and breakfast charges, along with applicable taxes, will be invoiced to Corporate Meeting Partner. Any additional expenses will be settled by the guest upon check-out.",
    label: "Billed: Room, breakfast and tax",
  },
  {
    value:
      "Room and applicable tax charges will be invoiced to Corporate Meeting Partner. Any additional expenses will be settled by the guest upon check-out.",
    label: "Billed: Room and tax",
  },
  {
    value: "All charges will be invoiced to Corporate Meeting Partner.",
    label: "Billed: All charges",
  },
  {
    value: "All charges will be settled by the guest upon check-out.",
    label: "Own Account",
  },
];

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

// Fallback room types if hotel doesn't have any defined
const DEFAULT_ROOM_TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "suite", label: "Suite" },
  { value: "deluxe", label: "Deluxe" },
];

interface StayFieldsProps {
  selectedItem: any;
  isEditing: boolean;
  pendingChanges: Record<string, { oldValue: any; newValue: any }>;
  setPendingChanges: (
    changes: Record<string, { oldValue: any; newValue: any }>
  ) => void;
  onFormReset?: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  onAllFieldsLoadedChange: (allLoaded: boolean) => void;
}

export function StayFields({
  selectedItem,
  isEditing,
  pendingChanges,
  setPendingChanges,
  onFormReset,
  onLoadingChange,
  onAllFieldsLoadedChange,
}: StayFieldsProps) {
  const [formData, setFormData] = useState<StayFormData>(INITIAL_FORM_STATE);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(
    INITIAL_LOADING_STATE
  );
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Room types from the selected hotel
  const [roomTypeOptions, setRoomTypeOptions] = useState(
    DEFAULT_ROOM_TYPE_OPTIONS
  );
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    const isGuestLoaded = !formData.guestIds.length || fieldsLoaded.guestIds;
    const isHotelLoaded = !formData.hotelId || fieldsLoaded.hotelId;
    return isGuestLoaded && isHotelLoaded;
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    // Only consider reference fields that actually require loading
    const shouldShowLoading =
      (formData.hotelId && !fieldsLoaded.hotelId) || loadingRoomTypes;

    // Only set loading state for actual loading operations, not text field edits
    setIsFormLoading(shouldShowLoading);
    onLoadingChange(shouldShowLoading);
    onAllFieldsLoadedChange(checkAllFieldsLoaded());
  }, [
    fieldsLoaded.bookingId,
    fieldsLoaded.hotelId,
    fieldsLoaded.guestIds,
    loadingRoomTypes,
    formData.bookingId,
    formData.hotelId,
    formData.guestIds,
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

        if (
          Array.isArray(result) &&
          result.length > 0 &&
          result[0].roomTypes?.length > 0
        ) {
          // Convert hotel roomTypes array to dropdown options format
          const hotelRoomTypes = result[0].roomTypes.map((type) => ({
            value: type,
            label: type,
          }));
          setRoomTypeOptions(hotelRoomTypes);

          // If current roomType is not in the new options list, clear it
          if (
            formData.roomType &&
            !result[0].roomTypes.includes(formData.roomType)
          ) {
            setFormData((prev) => ({
              ...prev,
              roomType: "",
            }));

            // Also update pendingChanges if needed
            if (pendingChanges["roomType"]) {
              setPendingChanges((prev) => {
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
  }, [formData.hotelId]);

  // Load stay data when component mounts or selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setFieldsLoaded(INITIAL_LOADING_STATE);
      setIsFormLoading(
        !!selectedItem.bookingId ||
          !!selectedItem.guestIds?.length ||
          !!selectedItem.hotelId
      );
      onLoadingChange(
        !!selectedItem.bookingId ||
          !!selectedItem.guestIds?.length ||
          !!selectedItem.hotelId
      );

      // Set form data
      setFormData({
        guestIds: selectedItem.guestIds || [],
        hotelId: selectedItem.hotelId || "",
        roomNumber: selectedItem.roomNumber || "",
        roomType: selectedItem.roomType || "",
        roomPrice: selectedItem.roomPrice || "",
        roomNotes: selectedItem.roomNotes || "",
        checkInDate: selectedItem.checkInDate || "",
        checkOutDate: selectedItem.checkOutDate || "",
        status: selectedItem.status || "",
        specialRequests: selectedItem.specialRequests || "",
        remarks: selectedItem.remarks || "",
        paymentInstructions: selectedItem.paymentInstructions || "",
        cancellations: selectedItem.cancellations || "",
        roomCurrency: selectedItem.roomCurrency || "EUR",
      });
    }
  }, [selectedItem]);

  // Provide method to reset form data
  useEffect(() => {
    if (onFormReset) {
      // Define and expose the reset function
      const resetForm = () => {
        if (selectedItem) {
          setFormData({
            guestIds: selectedItem.guestIds || [],
            hotelId: selectedItem.hotelId || "",
            roomNumber: selectedItem.roomNumber || "",
            roomType: selectedItem.roomType || "",
            roomPrice: selectedItem.roomPrice || "",
            roomNotes: selectedItem.roomNotes || "",
            checkInDate: selectedItem.checkInDate || "",
            checkOutDate: selectedItem.checkOutDate || "",
            status: selectedItem.status || "",
            specialRequests: selectedItem.specialRequests || "",
            remarks: selectedItem.remarks || "",
            paymentInstructions: selectedItem.paymentInstructions || "",
            cancellations: selectedItem.cancellations || "",
            roomCurrency: selectedItem.roomCurrency || "EUR",
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
      selectedItem.guestIds = formData.guestIds;
      selectedItem.hotelId = formData.hotelId;
      selectedItem.roomNumber = formData.roomNumber;
      selectedItem.roomType = formData.roomType;
      selectedItem.roomPrice = formData.roomPrice;
      selectedItem.roomNotes = formData.roomNotes;
      selectedItem.checkInDate = formData.checkInDate;
      selectedItem.checkOutDate = formData.checkOutDate;
      selectedItem.status = formData.status;
      selectedItem.specialRequests = formData.specialRequests;
      selectedItem.remarks = formData.remarks;
      selectedItem.paymentInstructions = formData.paymentInstructions;
      selectedItem.cancellations = formData.cancellations;
      selectedItem.roomCurrency = formData.roomCurrency;
    }
  }, [formData, selectedItem]);

  const handleChange = (
    field: keyof StayFormData,
    value: string | string[],
    displayValue?: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "hotelId"
        ? { hotelName: displayValue }
        : {}),
      ...(displayValue && field === "guestIds"
        ? {
            guestNames: Array.isArray(displayValue)
              ? displayValue
              : [displayValue as string],
          }
        : {}),
    }));

    // Only set loading states for reference fields that need to fetch data
    const refFields = ["bookingId", "guestIds", "hotelId"];

    if (refFields.includes(field as string)) {
      if (field === "guestIds") {
        // For guestIds, we'll handle loading in the onChange callback of MultiRefField
        setFieldsLoaded((prev) => ({
          ...prev,
          guestIds: false,
        }));
      } else if (field === "hotelId") {
        setFieldsLoaded((prev) => ({
          ...prev,
          hotelId: false,
        }));
        setIsFormLoading(!!value);
        onLoadingChange(!!value);
      }
    }

    // For array fields like guestIds, store both the array value and display values
    if (field === "guestIds" && displayValue) {
      setPendingChanges((prev) => ({
        ...prev,
        [field]: {
          oldValue: selectedItem?.[field] || [],
          newValue: value,
          displayValues: Array.isArray(displayValue)
            ? displayValue
            : typeof displayValue === "string"
            ? displayValue.split(", ")
            : [], // Convert to array for selectedLabels
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


  const handleHotelLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Hotel field load error:", error);
      toast.error(`Error loading hotel information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      hotelId: loaded,
    }));

    onAllFieldsLoadedChange(checkAllFieldsLoaded());
  };

  // Helper function to create field props
  const fieldProps = (field: keyof StayFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  return (
    <>
      <div className="col-half">
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

        <MultiRefField
          label="Guests"
          value={formData.guestIds}
          onChange={(value, displayValues) => {
            handleChange("guestIds", value, displayValues || value);
            // Immediately set as loaded since MultiRefField handles its own loading
            setFieldsLoaded((prev) => ({
              ...prev,
              guestIds: true,
            }));
          }}
          isEditing={isEditing}
          className={pendingChanges["guestIds"] ? "field-changed" : ""}
          collectionName="contacts"
          displayFields={[
            "general.firstName",
            "general.lastName",
            "general.remarks",
          ]}
          showQuickAdd={true} // Enable quick add functionality
        />
        <TextField
          label="Remarks"
          {...fieldProps("remarks")}
          multiline={true}
          rows={4}
        />

        <DropdownField
          label="Payment Instructions"
          options={PAYMENT_INSTRUCTION_OPTIONS}
          {...fieldProps("paymentInstructions")}
        />

        <DropdownField
          label="Cancellations"
          options={CANCELLATION_OPTIONS}
          {...fieldProps("cancellations")}
        />
      </div>
      <div className="col-half">
        <RefField
          label="Hotel"
          value={formData.hotelId}
          onChange={(value, displayValue) =>
            handleChange("hotelId", value, displayValue)
          }
          isEditing={isEditing}
          className={pendingChanges["hotelId"] ? "field-changed" : ""}
          collectionName="hotels"
          displayFields={["name", "address"]}
          onLoadComplete={handleHotelLoadComplete}
        />
        <DropdownField
          label="Room Type"
          options={roomTypeOptions}
          {...fieldProps("roomType")}
          placeholder={
            loadingRoomTypes ? "Loading room types..." : "Select a room type"
          }
          disabled={loadingRoomTypes || !formData.hotelId}
        />
        <div className="currency-group">
          <label className="field-label">Room Price</label>
          <div className="grouper">
            <DropdownField
              options={CURRENCY_OPTIONS}
              value={formData.roomCurrency}
              onChange={(value) => handleChange("roomCurrency", value)}
              isEditing={isEditing}
              className={`currency-sign ${
                pendingChanges["roomCurrency"] ? "field-changed" : ""
              }`}
              compact={true}
            />
            <TextField
              label=""
              type="number"
              className={`currency-amount ${
                pendingChanges["roomPrice"] ? "field-changed" : ""
              }`}
              value={formData.roomPrice}
              onChange={(value) => handleChange("roomPrice", value)}
              isEditing={isEditing}
            />
          </div>
        </div>
        <TextField label="Room Number" {...fieldProps("roomNumber")} />
        <TextField label="Room Notes" {...fieldProps("roomNotes")} />
        <DropdownField
          label="Status"
          options={STATUS_OPTIONS}
          {...fieldProps("status")}
        />
        <TextField
          label="Special Requests"
          {...fieldProps("specialRequests")}
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
    </>
  );
}
