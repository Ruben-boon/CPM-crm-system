"use client";
import React, { useState, useEffect, useCallback } from "react";
import Button from "@/components/common/Button";
import { Save, X, Plus } from "lucide-react";
import { LoadingSpinner } from "../loadingSpinner";
import { toast } from "sonner";
import { createDocument, updateDocument, searchDocuments } from "@/app/actions/crudActions";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { MultiRefField } from "../fields/MultiRefField";
import { ContactModal } from "../contact/ContactModal";

// Constants for dropdown options
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

const DEFAULT_ROOM_TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "suite", label: "Suite" },
  { value: "deluxe", label: "Deluxe" },
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

const CANCELLATION_OPTIONS = [
  { value: "Cancellations made up to 24 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.", label: "24h" },
  { value: "Cancellations made up to 48 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.", label: "48h" },
  { value: "Cancellations made up to 72 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.", label: "72h" },
];

interface StayModalProps {
  stay?: any;
  isCopyMode?: boolean;
  onSave?: (savedStay: any) => void;
  onClose: () => void;
}

export function StayModal({ 
  stay = {}, 
  isCopyMode = false, 
  onSave, 
  onClose 
}: StayModalProps) {
  // Create a stay object with defaults applied
  const [stayData, setStayData] = useState<any>({
    checkInDate: "",
    checkOutDate: "",
    guestIds: [],
    guestNames: [],
    hotelId: "",
    hotelName: "",
    roomNumber: "",
    roomType: "",
    roomPrice: "",
    roomCurrency: "EUR",
    status: "confirmed",
    remarks: "",
    paymentInstructions: "",
    cancellations: "",
    specialRequests: "",
    ...stay
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [roomTypeOptions, setRoomTypeOptions] = useState(DEFAULT_ROOM_TYPE_OPTIONS);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [fieldLoadingStates, setFieldLoadingStates] = useState({
    hotelId: false,
    guestIds: false
  });

  // If this is a copy, clear the _id when component loads
  useEffect(() => {
    if (isCopyMode && stayData._id) {
      const stayCopy = { ...stayData };
      delete stayCopy._id;
      if (stayCopy.reference) {
        stayCopy.reference = `${stayCopy.reference} (Copy)`;
      }
      setStayData(stayCopy);
    }
  }, [isCopyMode]);

  // Load room types when hotel changes
  useEffect(() => {
    if (stayData.hotelId) {
      loadRoomTypes(stayData.hotelId);
    }
  }, [stayData.hotelId]);

  // Function to check if any fields are loading
  const isAnyFieldLoading = () => {
    return Object.values(fieldLoadingStates).some(isLoading => isLoading);
  };

  // Update loading state when field loading state changes
  useEffect(() => {
    setIsFormLoading(isAnyFieldLoading());
  }, [fieldLoadingStates]);

  // FIXED: Memoize setFieldLoading with useCallback to prevent infinite renders
  const setFieldLoading = useCallback((fieldPath: string, isLoading: boolean) => {
    setFieldLoadingStates(prev => ({
      ...prev,
      [fieldPath]: isLoading
    }));
  }, []);

  // Load room types from hotel
  const loadRoomTypes = async (hotelId: string) => {
    if (!hotelId) {
      setRoomTypeOptions(DEFAULT_ROOM_TYPE_OPTIONS);
      return;
    }

    setFieldLoading('hotelId', true);

    try {
      const result = await searchDocuments("hotels", hotelId, "_id");
      
      if (Array.isArray(result) && result.length > 0 && result[0].roomTypes?.length > 0) {
        // Convert hotel roomTypes array to dropdown options format
        const hotelRoomTypes = result[0].roomTypes.map((type: string) => ({
          value: type,
          label: type,
        }));
        setRoomTypeOptions(hotelRoomTypes);
        
        // If current roomType is not in the new options list, clear it
        if (
          stayData.roomType &&
          !result[0].roomTypes.includes(stayData.roomType)
        ) {
          setStayData(prev => ({
            ...prev,
            roomType: ""
          }));
        }
      } else {
        setRoomTypeOptions(DEFAULT_ROOM_TYPE_OPTIONS);
      }
    } catch (error) {
      console.error("Error loading room types:", error);
      toast.error("Could not load room types from the selected hotel");
      setRoomTypeOptions(DEFAULT_ROOM_TYPE_OPTIONS);
    } finally {
      setFieldLoading('hotelId', false);
    }
  };

  // Handle field changes - memoize this as well
  const handleFieldChange = useCallback((fieldPath: string, value: any) => {
    setStayData(prev => {
      // For handling nested paths
      const parts = fieldPath.split('.');
      const newState = { ...prev };
      
      let current = newState;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = value;
      return newState;
    });
    
    // Track changes
    setPendingChanges(prev => ({
      ...prev,
      [fieldPath]: value
    }));
  }, []);

  // Handle contact creation modal
  const handleAddContact = useCallback(() => {
    setIsContactModalOpen(true);
  }, []);

  // Handle contact creation callback
  const handleContactCreated = useCallback((contactId: string, displayName: string) => {
    if (!contactId) return;
    
    // Update stay data with new contact
    setStayData(prev => {
      const newState = { ...prev };
      
      // Initialize arrays if they don't exist
      if (!newState.guestIds) newState.guestIds = [];
      if (!newState.guestNames) newState.guestNames = [];
      
      // Add the new contact if not already in the list
      if (!newState.guestIds.includes(contactId)) {
        newState.guestIds.push(contactId);
        newState.guestNames.push(displayName);
      }
      
      return newState;
    });
    
    // Track the change
    setPendingChanges(prev => ({
      ...prev,
      guestIds: true
    }));
    
    // Close contact modal
    setIsContactModalOpen(false);
  }, []);

  // Save the stay
  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!stayData.checkInDate || !stayData.checkOutDate) {
        toast.error("Please fill in required fields");
        setIsSubmitting(false);
        return;
      }

      // Generate a reference if not provided
      if (!stayData.reference) {
        stayData.reference = `Stay ${new Date().toISOString().slice(0, 10)}`;
      }

      let result;

      // Either update or create based on if the stay has an ID
      if (!isCopyMode && stayData._id) {
        // Update existing stay
        result = await updateDocument("stays", stayData._id, stayData);
        if (!result.success) {
          toast.error(`Failed to update stay: ${result.error || "Unknown error"}`);
          setIsSubmitting(false);
          return;
        }
        
        toast.success("Stay updated successfully");
      } else {
        // Create new stay
        result = await createDocument("stays", stayData);
        if (!result.success) {
          toast.error(`Failed to ${isCopyMode ? "copy" : "create"} stay: ${result.error || "Unknown error"}`);
          setIsSubmitting(false);
          return;
        }
        
        toast.success(`Stay ${isCopyMode ? "copied" : "created"} successfully`);
      }

      // Call the callback with the saved stay data
      if (onSave && result.data) {
        onSave(result.data);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Contact Modal */}
      {isContactModalOpen && (
        <ContactModal
          initialData={{ general: { role: "guest" } }}
          callback={handleContactCreated}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
      
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>{isCopyMode ? "Copy Stay" : (stayData._id ? "Edit Stay" : "Add Stay")}</h2>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          
          <div className="modal-content">
            <LoadingSpinner isLoading={isFormLoading} />
            
            <div className="stay-fields-container">
              <div className="col-half">
                <TextField
                  label="Check-in Date"
                  fieldPath="checkInDate"
                  value={stayData.checkInDate || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                  type="date"
                  required={true}
                />
                
                <TextField
                  label="Check-out Date"
                  fieldPath="checkOutDate"
                  value={stayData.checkOutDate || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                  type="date"
                  required={true}
                />
                
                <MultiRefField
                  label="Guests"
                  fieldPath="guestIds"
                  value={stayData.guestIds || []}
                  updateField={handleFieldChange}
                  isEditing={true}
                  collectionName="contacts"
                  displayFields={["general.firstName", "general.lastName"]}
                  showQuickAdd={true}
                  setFieldLoading={setFieldLoading}
                  onAddContact={handleAddContact}
                />
                
                <TextField
                  label="Remarks"
                  fieldPath="remarks"
                  value={stayData.remarks || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                  multiline={true}
                  rows={4}
                />
                
                <DropdownField
                  label="Payment Instructions"
                  fieldPath="paymentInstructions"
                  value={stayData.paymentInstructions || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                  options={PAYMENT_INSTRUCTION_OPTIONS}
                />
                
                <DropdownField
                  label="Cancellations"
                  fieldPath="cancellations"
                  value={stayData.cancellations || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                  options={CANCELLATION_OPTIONS}
                />
              </div>
              
              <div className="col-half">
                <RefField
                  label="Hotel"
                  fieldPath="hotelId"
                  value={stayData.hotelId || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                  collectionName="hotels"
                  displayFields={["name", "address"]}
                  setFieldLoading={setFieldLoading}
                  required={true}
                />
                
                <DropdownField
                  label="Room Type"
                  fieldPath="roomType"
                  value={stayData.roomType || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                  options={roomTypeOptions}
                  placeholder={fieldLoadingStates.hotelId ? "Loading room types..." : "Select a room type"}
                  disabled={fieldLoadingStates.hotelId || !stayData.hotelId}
                />
                
                <div className="form-field">
                  <label className="field-label">Room Price</label>
                  <div className="price-field">
                    <DropdownField
                      fieldPath="roomCurrency"
                      value={stayData.roomCurrency || "EUR"}
                      onChange={handleFieldChange}
                      isEditing={true}
                      options={CURRENCY_OPTIONS}
                      className="currency-select"
                      compact={true}
                    />
                    
                    <TextField
                      fieldPath="roomPrice"
                      label=""
                      value={stayData.roomPrice || ""}
                      onChange={handleFieldChange}
                      isEditing={true}
                      type="number"
                      className="price-input"
                    />
                  </div>
                </div>
                
                <TextField
                  label="Room Number"
                  fieldPath="roomNumber"
                  value={stayData.roomNumber || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                />
                
                <DropdownField
                  label="Status"
                  fieldPath="status"
                  value={stayData.status || "confirmed"}
                  onChange={handleFieldChange}
                  isEditing={true}
                  options={STATUS_OPTIONS}
                />
                
                <TextField
                  label="Special Requests"
                  fieldPath="specialRequests"
                  value={stayData.specialRequests || ""}
                  onChange={handleFieldChange}
                  isEditing={true}
                />
              </div>
            </div>
            
            <div className="modal-footer">
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
                disabled={isSubmitting || isFormLoading}
                isLoading={isSubmitting}
              >
                {isCopyMode ? "Create Copy" : (stayData._id ? "Update Stay" : "Create Stay")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
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
        
        .modal-container {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          width: 800px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }
        
        .stay-fields-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .col-half {
          flex: 1;
          min-width: 300px;
        }
        
        .price-field {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .currency-select {
          width: 80px;
        }
        
        .price-input {
          flex: 1;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </>
  );
}