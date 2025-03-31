"use client";
import { useState, useEffect } from "react";
import { TextField } from "../fields/TextField";
import { MultiTextField } from "../fields/MultiTextFields";

interface HotelFormData {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  roomTypes: string[];
}

const INITIAL_FORM_STATE: HotelFormData = {
  name: "",
  address: "",
  postal_code: "",
  city: "",
  country: "",
  roomTypes: []
};

interface HotelFieldsProps {
  selectedItem: any;
  isEditing: boolean;
  pendingChanges: Record<string, { oldValue: any; newValue: any }>;
  setPendingChanges: (changes: Record<string, { oldValue: any; newValue: any }>) => void;
  onFormReset?: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  onAllFieldsLoadedChange: (allLoaded: boolean) => void;
}

export function HotelFields({
  selectedItem,
  isEditing,
  pendingChanges,
  setPendingChanges,
  onFormReset,
  onLoadingChange,
  onAllFieldsLoadedChange
}: HotelFieldsProps) {
  const [formData, setFormData] = useState<HotelFormData>(INITIAL_FORM_STATE);
  
  // Always mark all fields as loaded since hotels have no reference fields to fetch
  useEffect(() => {
    onAllFieldsLoadedChange(true);
    onLoadingChange(false);
  }, [onAllFieldsLoadedChange, onLoadingChange]);

  // Load form data when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name || "",
        address: selectedItem.address || "",
        postal_code: selectedItem.postal_code || "",
        city: selectedItem.city || "",
        country: selectedItem.country || "",
        roomTypes: selectedItem.roomTypes || [],
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
            name: selectedItem.name || "",
            address: selectedItem.address || "",
            postal_code: selectedItem.postal_code || "",
            city: selectedItem.city || "",
            country: selectedItem.country || "",
            roomTypes: selectedItem.roomTypes || []
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
      selectedItem.name = formData.name;
      selectedItem.address = formData.address;
      selectedItem.postal_code = formData.postal_code;
      selectedItem.city = formData.city;
      selectedItem.country = formData.country;
      selectedItem.roomTypes = formData.roomTypes;
    }
  }, [formData, selectedItem]);

  const handleChange = (
    field: keyof HotelFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPendingChanges((prev) => ({
      ...prev,
      [field]: {
        oldValue: selectedItem?.[field] || (field === "roomTypes" ? [] : ""),
        newValue: value,
      },
    }));
  };

  // Helper function to create field props
  const fieldProps = (field: keyof HotelFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string | string[]) => handleChange(field, value),
    isEditing: isEditing,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  return (
    <>
      <div className="col-half">
        <TextField label="Name" {...fieldProps("name", true)} />
        <TextField label="Address" {...fieldProps("address")} />
        <TextField label="Postal Code" {...fieldProps("postal_code")} />
        <TextField label="City" {...fieldProps("city")} />
        <TextField label="Country" {...fieldProps("country")} />
        <MultiTextField
          label="Room Types" 
          {...fieldProps("roomTypes")} 
          placeholder="Add a room type..."
        />
      </div>
      <div className="col-half">
        {/* You can add additional fields or sections here */}
      </div>
    </>
  );
}