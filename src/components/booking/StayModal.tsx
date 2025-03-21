"use client";
import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import { Save, X } from "lucide-react";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { MultiRefField } from "../fields/MultiRefField";
import { searchDocuments, createDocument, updateDocument } from "@/app/actions/crudActions";
import { toast } from "sonner";
import { LoadingSpinner } from "../loadingSpinner";

interface StayModalProps {
  stay: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedStay: any) => void;
  isCopyMode?: boolean;
}

interface StayFormData {
  reference: string;
  hotelId: string;
  hotelName: string;
  guestIds: string[];
  guestNames: string[];
  roomNumber: string;
  roomType: string;
  roomPrice: string;
  roomCurrency: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  specialRequests: string;
  remarks: string;
}

const INITIAL_FORM_STATE: StayFormData = {
  reference: "",
  hotelId: "",
  hotelName: "",
  guestIds: [],
  guestNames: [],
  roomNumber: "",
  roomType: "",
  roomPrice: "",
  roomCurrency: "EUR",
  checkInDate: "",
  checkOutDate: "",
  status: "confirmed",
  specialRequests: "",
  remarks: "",
};

const ROOM_TYPES = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "twin", label: "Twin" },
  { value: "suite", label: "Suite" },
];

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "€" },
  { value: "USD", label: "$" },
  { value: "GBP", label: "£" },
  { value: "JPY", label: "¥" },
  { value: "CHF", label: "CHF" },
];

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

export function StayModal({ stay, isOpen, onClose, onSave, isCopyMode = false }: StayModalProps) {
  const [formData, setFormData] = useState<StayFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hotelRoomTypes, setHotelRoomTypes] = useState<any[]>(ROOM_TYPES);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  // Load existing stay data if provided
  useEffect(() => {
    if (stay) {
      setFormData({
        reference: isCopyMode ? `${stay.reference || ''} (Copy)` : stay.reference || "",
        hotelId: stay.hotelId || "",
        hotelName: stay.hotelName || "",
        guestIds: stay.guestIds || [],
        guestNames: stay.guestNames || [],
        roomNumber: stay.roomNumber || "",
        roomType: stay.roomType || "",
        roomPrice: stay.roomPrice || "",
        roomCurrency: stay.roomCurrency || "EUR",
        checkInDate: stay.checkInDate || "",
        checkOutDate: stay.checkOutDate || "",
        status: stay.status || "confirmed",
        specialRequests: stay.specialRequests || "",
        remarks: stay.remarks || "",
      });

      // Load hotel room types if hotelId is provided
      if (stay.hotelId) {
        loadHotelRoomTypes(stay.hotelId);
      }
    }
  }, [stay, isCopyMode]);

  const loadHotelRoomTypes = async (hotelId: string) => {
    if (!hotelId) {
      setHotelRoomTypes(ROOM_TYPES);
      return;
    }

    try {
      setLoadingRoomTypes(true);
      const result = await searchDocuments("hotels", hotelId, "_id");

      if (Array.isArray(result) && result.length > 0 && result[0].roomTypes?.length > 0) {
        // Convert hotel roomTypes array to dropdown options format
        const hotelRoomTypes = result[0].roomTypes.map((type) => ({
          value: type,
          label: type,
        }));
        setHotelRoomTypes(hotelRoomTypes);
      } else {
        setHotelRoomTypes(ROOM_TYPES);
      }
    } catch (error) {
      console.error("Error loading room types:", error);
      setHotelRoomTypes(ROOM_TYPES);
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  const handleChange = (
    field: keyof StayFormData,
    value: string | string[],
    displayValue?: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "hotelId" ? { hotelName: displayValue } : {}),
      ...(displayValue && field === "guestIds" ? { guestNames: displayValue } : {}),
    }));

    // If hotel changes, load the room types
    if (field === "hotelId") {
      loadHotelRoomTypes(value as string);
    }
  };

  const handleHotelLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Hotel field load error:", error);
      toast.error(`Error loading hotel information`);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.checkInDate || !formData.checkOutDate || !formData.hotelId) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Generate a reference if not provided
      let stayData = {
        ...formData,
        reference: formData.reference || `Stay ${new Date().toISOString().slice(0, 10)}`,
      };

      let savedStay = null;

      // Either update or create
      if (isCopyMode || !stay._id) {
        // Create new stay
        const result = await createDocument("stays", stayData);
        if (result.success && result.data) {
          toast.success(`Stay ${isCopyMode ? "copied" : "created"} successfully`);
          savedStay = result.data;
        } else {
          toast.error(`Failed to ${isCopyMode ? "copy" : "create"} stay`);
        }
      } else {
        // Update existing stay
        const result = await updateDocument("stays", stay._id, {
          ...stay,
          ...stayData,
        });
        if (result.success) {
          toast.success("Stay updated successfully");
          savedStay = {
            _id: stay._id,
            ...stayData
          };
        } else {
          toast.error("Failed to update stay");
        }
      }

      // Call onSave with the saved stay if successful
      if (savedStay) {
        onSave(savedStay);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="stay-modal-overlay">
      <div className="stay-modal">
        <div className="stay-modal-header">
          <h2>{isCopyMode ? "Copy Stay" : (stay._id ? "Edit Stay" : "Create New Stay")}</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="stay-modal-content">
          <LoadingSpinner isLoading={isLoading || loadingRoomTypes} />

          <div className="stay-form">
            <div className="form-columns">
              <div className="form-column">
                <TextField
                  label="Check-in Date"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(value) => handleChange("checkInDate", value)}
                  isEditing={true}
                  required
                />
                <TextField
                  label="Check-out Date"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(value) => handleChange("checkOutDate", value)}
                  isEditing={true}
                  required
                />
                <RefField
                  label="Hotel"
                  value={formData.hotelId}
                  onChange={(value, displayValue) => handleChange("hotelId", value, displayValue)}
                  isEditing={true}
                  collectionName="hotels"
                  displayFields={["name"]}
                  onLoadComplete={handleHotelLoadComplete}
                  required
                />
                <TextField
                  label="Room Number"
                  value={formData.roomNumber}
                  onChange={(value) => handleChange("roomNumber", value)}
                  isEditing={true}
                />
                <DropdownField
                  label="Room Type"
                  options={hotelRoomTypes}
                  value={formData.roomType}
                  onChange={(value) => handleChange("roomType", value)}
                  isEditing={true}
                  placeholder={loadingRoomTypes ? "Loading room types..." : "Select room type"}
                  disabled={loadingRoomTypes}
                />

                <div className="currency-group">
                  <label className="field-label">Room Price</label>
                  <div className="currency-input-group">
                    <DropdownField
                      options={CURRENCY_OPTIONS}
                      value={formData.roomCurrency}
                      onChange={(value) => handleChange("roomCurrency", value)}
                      isEditing={true}
                      compact={true}
                    />
                    <TextField
                      label=""
                      type="number"
                      value={formData.roomPrice}
                      onChange={(value) => handleChange("roomPrice", value)}
                      isEditing={true}
                    />
                  </div>
                </div>
              </div>

              <div className="form-column">
                <DropdownField
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  isEditing={true}
                  required
                />
                <MultiRefField
                  label="Guests"
                  value={formData.guestIds}
                  onChange={(values, displayValues) => handleChange("guestIds", values, displayValues)}
                  isEditing={true}
                  collectionName="contacts"
                  displayFields={["general.firstName", "general.lastName"]}
                  selectedLabels={formData.guestNames || []}
                  showQuickAdd={true}
                />
                <TextField
                  label="Special Requests"
                  value={formData.specialRequests}
                  onChange={(value) => handleChange("specialRequests", value)}
                  isEditing={true}
                  multiline={true}
                  rows={3}
                />
                <TextField
                  label="Remarks"
                  value={formData.remarks}
                  onChange={(value) => handleChange("remarks", value)}
                  isEditing={true}
                  multiline={true}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="stay-modal-footer">
          <Button 
            intent="secondary" 
            icon={X} 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            icon={Save} 
            onClick={handleSave}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isCopyMode ? "Create Copy" : (stay._id ? "Update Stay" : "Create Stay")}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .stay-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .stay-modal {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 1000px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .stay-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .stay-modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background-color: #f0f0f0;
        }

        .stay-modal-content {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          position: relative;
        }

        .stay-form {
          padding-bottom: 1rem;
        }

        .form-columns {
          display: flex;
          gap: 2rem;
        }

        .form-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .currency-group {
          margin-bottom: 1rem;
        }

        .currency-input-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .currency-input-group > :global(.form-field-compact) {
          width: 80px;
        }

        .stay-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #e0e0e0;
        }
      `}</style>
    </div>
  );
}