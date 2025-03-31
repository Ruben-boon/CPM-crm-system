"use client";
import React, { useState, useEffect } from "react";
import { StayFields } from "./StayFields";
import Button from "@/components/common/Button";
import { Save, X } from "lucide-react";
import { LoadingSpinner } from "../loadingSpinner";
import { useStaysData } from "@/context/DataContext";
import { toast } from "sonner";
import { createDocument, updateDocument } from "@/app/actions/crudActions";

interface StayModalContentProps {
  data: {
    stay: any;
    isCopyMode?: boolean;
    callback?: (savedStay: any) => void;
  };
  onClose: () => void;
}

export function StayModalContent({ data, onClose }: StayModalContentProps) {
  const { stay, isCopyMode = false, callback } = data || { stay: {} };
  
  const [selectedStay, setSelectedStay] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [areAllFieldsLoaded, setAreAllFieldsLoaded] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  // Initialize the stay data
  useEffect(() => {
    if (stay) {
      const initialStay = { ...stay };
      
      // For copy mode, remove _id and modify reference
      if (isCopyMode && initialStay._id) {
        delete initialStay._id;
        if (initialStay.reference) {
          initialStay.reference = `${initialStay.reference} (Copy)`;
        }
      }
      
      setSelectedStay(initialStay);
    }
  }, [stay, isCopyMode]);

  const handleSave = async () => {
    if (!selectedStay) return;
    
    setIsSubmitting(true);
    
    try {
      // Basic validation - modify as needed
      if (!selectedStay.checkInDate || !selectedStay.checkOutDate || !selectedStay.hotelId) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Generate a reference if not provided
      if (!selectedStay.reference) {
        selectedStay.reference = `Stay ${new Date().toISOString().slice(0, 10)}`;
      }

      let result;
      let savedStay;

      // Either update or create based on if the stay has an ID
      if (!isCopyMode && selectedStay._id) {
        // Update existing stay
        result = await updateDocument("stays", selectedStay._id, selectedStay);
        if (result.success) {
          toast.success("Stay updated successfully");
          savedStay = {
            _id: selectedStay._id,
            ...selectedStay
          };
        } else {
          toast.error("Failed to update stay");
          return;
        }
      } else {
        // Create new stay
        result = await createDocument("stays", selectedStay);
        if (result.success && result.data) {
          toast.success(`Stay ${isCopyMode ? "copied" : "created"} successfully`);
          savedStay = result.data;
        } else {
          toast.error(`Failed to ${isCopyMode ? "copy" : "create"} stay`);
          return;
        }
      }

      // Call the callback if provided
      if (callback && savedStay) {
        callback(savedStay);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stay-modal-content">
      <LoadingSpinner isLoading={isFormLoading} />
      
      {selectedStay && (
        <>
          <div className="stay-fields-container">
            <StayFields
              selectedItem={selectedStay}
              isEditing={true}
              pendingChanges={pendingChanges}
              setPendingChanges={setPendingChanges}
              onLoadingChange={setIsFormLoading}
              onAllFieldsLoadedChange={setAreAllFieldsLoaded}
            />
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
              disabled={isSubmitting || isFormLoading || !areAllFieldsLoaded}
              isLoading={isSubmitting}
            >
              {isCopyMode ? "Create Copy" : (selectedStay._id ? "Update Stay" : "Create Stay")}
            </Button>
          </div>
        </>
      )}
      
      <style jsx>{`
        .stay-modal-content {
          display: flex;
          flex-direction: column;
          min-height: 400px;  
          gap:32px;
        }
        
        .stay-fields-container {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }
      `}</style>
    </div>
  );
}