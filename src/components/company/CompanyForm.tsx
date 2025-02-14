"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useCompaniesData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";

interface CompanyFormData {
  parentCompany: string;
  parentCompanyName: string;
  childCompany: string;
  childCompanyName: string;
  supplierName: string;
  entityName: string;
  currency: string;
  vatNo: string;
  locationType: string;
  invoicingEmail: string;
  phone: string;
  roadName: string;
  buildingNr: string;
  zipCode: string;
  country: string;
}

const INITIAL_FORM_STATE: CompanyFormData = {
  parentCompany: "",
  parentCompanyName: "",
  childCompany: "",
  childCompanyName: "",
  supplierName: "",
  entityName: "",
  currency: "",
  vatNo: "",
  locationType: "",
  invoicingEmail: "",
  phone: "",
  roadName: "",
  buildingNr: "",
  zipCode: "",
  country: "",
};

const CURRENCY_OPTIONS = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
] as const;

const LOCATION_TYPE_OPTIONS = [
  { value: "HQ", label: "Headquarters" },
  { value: "BRANCH", label: "Branch Office" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "RETAIL", label: "Retail Location" },
  { value: "VIRTUAL", label: "Virtual Office" },
] as const;

export function CompanyForm() {
  const {
    selectedItem,
    updateItem,
    createItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
  } = useCompaniesData();

  const [formData, setFormData] = useState<CompanyFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CompanyFormData, value: string, displayValue?: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "parentCompany" ? { parentCompanyName: displayValue } : {}),
      ...(displayValue && field === "childCompany" ? { childCompanyName: displayValue } : {}),
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
        parentCompany: selectedItem.parentCompany || "",
        parentCompanyName: selectedItem.parentCompanyName || "",
        childCompany: selectedItem.childCompany || "",
        childCompanyName: selectedItem.childCompanyName || "",
        supplierName: selectedItem.supplierName || "",
        entityName: selectedItem.entityName || "",
        currency: selectedItem.currency || "",
        vatNo: selectedItem.vatNo || "",
        locationType: selectedItem.locationType || "",
        invoicingEmail: selectedItem.invoicingEmail || "",
        phone: selectedItem.phone || "",
        roadName: selectedItem.roadName || "",
        buildingNr: selectedItem.buildingNr || "",
        zipCode: selectedItem.zipCode || "",
        country: selectedItem.country || "",
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
        parentCompanyName: undefined,
        childCompanyName: undefined,
      };

      const success = selectedItem?._id
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(
          `Company ${selectedItem?._id ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setPendingChanges({});
      } else {
        toast.error(
          `Failed to ${selectedItem?._id ? "update" : "create"} company`
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
        parentCompany: selectedItem.parentCompany || "",
        parentCompanyName: selectedItem.parentCompanyName || "",
        childCompany: selectedItem.childCompany || "",
        childCompanyName: selectedItem.childCompanyName || "",
        supplierName: selectedItem.supplierName || "",
        entityName: selectedItem.entityName || "",
        currency: selectedItem.currency || "",
        vatNo: selectedItem.vatNo || "",
        locationType: selectedItem.locationType || "",
        invoicingEmail: selectedItem.invoicingEmail || "",
        phone: selectedItem.phone || "",
        roadName: selectedItem.roadName || "",
        buildingNr: selectedItem.buildingNr || "",
        zipCode: selectedItem.zipCode || "",
        country: selectedItem.country || "",
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSave} className="company-form">
      <div className="top-bar">
        <div className="top-bar__title">
          {selectedItem?._id ? "Company Details" : "New Company"}
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
          <RefField
            label="Parent Company"
            value={formData.parentCompany}
            onChange={(value, displayValue) => handleChange("parentCompany", value, displayValue)}
            isEditing={isEditing}
            className={pendingChanges["parentCompany"] ? "field-changed" : ""}
            collectionName="companies"
            displayFields={["supplierName", "entityName"]}
            selectedLabel={formData.parentCompanyName}
          />
          <TextField
            label="Supplier Name"
            value={formData.supplierName}
            onChange={(value) => handleChange("supplierName", value)}
            required
            isEditing={isEditing}
            className={pendingChanges["supplierName"] ? "field-changed" : ""}
          />
          <TextField
            label="Entity Name"
            value={formData.entityName}
            onChange={(value) => handleChange("entityName", value)}
            isEditing={isEditing}
            className={pendingChanges["entityName"] ? "field-changed" : ""}
          />
          <DropdownField
            label="Currency"
            value={formData.currency}
            onChange={(value) => handleChange("currency", value)}
            options={CURRENCY_OPTIONS}
            isEditing={isEditing}
            className={pendingChanges["currency"] ? "field-changed" : ""}
          />
          <TextField
            label="VAT No."
            value={formData.vatNo}
            onChange={(value) => handleChange("vatNo", value)}
            isEditing={isEditing}
            className={pendingChanges["vatNo"] ? "field-changed" : ""}
          />
          <DropdownField
            label="Location Type"
            value={formData.locationType}
            onChange={(value) => handleChange("locationType", value)}
            options={LOCATION_TYPE_OPTIONS}
            isEditing={isEditing}
            className={pendingChanges["locationType"] ? "field-changed" : ""}
          />
        </div>
        <div className="col">
          <TextField
            label="Invoicing Email"
            value={formData.invoicingEmail}
            onChange={(value) => handleChange("invoicingEmail", value)}
            type="email"
            isEditing={isEditing}
            className={pendingChanges["invoicingEmail"] ? "field-changed" : ""}
          />
          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(value) => handleChange("phone", value)}
            type="tel"
            isEditing={isEditing}
            className={pendingChanges["phone"] ? "field-changed" : ""}
          />
          <TextField
            label="Road Name"
            value={formData.roadName}
            onChange={(value) => handleChange("roadName", value)}
            isEditing={isEditing}
            className={pendingChanges["roadName"] ? "field-changed" : ""}
          />
          <TextField
            label="Building Nr."
            value={formData.buildingNr}
            onChange={(value) => handleChange("buildingNr", value)}
            isEditing={isEditing}
            className={pendingChanges["buildingNr"] ? "field-changed" : ""}
          />
          <TextField
            label="Zip Code"
            value={formData.zipCode}
            onChange={(value) => handleChange("zipCode", value)}
            isEditing={isEditing}
            className={pendingChanges["zipCode"] ? "field-changed" : ""}
          />
          <TextField
            label="Country"
            value={formData.country}
            onChange={(value) => handleChange("country", value)}
            isEditing={isEditing}
            className={pendingChanges["country"] ? "field-changed" : ""}
          />
          <RefField
            label="Child Company"
            value={formData.childCompany}
            onChange={(value, displayValue) => handleChange("childCompany", value, displayValue)}
            isEditing={isEditing}
            className={pendingChanges["childCompany"] ? "field-changed" : ""}
            collectionName="companies"
            displayFields={["supplierName", "entityName"]}
            selectedLabel={formData.childCompanyName}
          />
          
        </div>
      </div>
    </form>
  );
}