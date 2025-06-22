"use client";
import { useHotelsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { RelatedItems } from "../fields/RelatedItems";
import { useRouter } from "next/navigation";
import { MultiTextField } from "../fields/MultiTextFields";
import { useState } from "react";
import { SkeletonLoader } from "../SkeletonLoader";
import { RefField } from "../fields/RefField";

export function HotelForm(key) {
  const hotelsContext = useHotelsData();
  const router = useRouter();
  const [isFieldLoading, setIsFieldLoading] = useState(false);
  const [relatedItemsLoading, setRelatedItemsLoading] = useState(false);

  const getDisplayName = (item: any) => {
    return item?.name || "this hotel";
  };

  const handleFieldChange = (
    fieldPath: string,
    value: string,
    displayValue?: string
  ) => {
    hotelsContext.updateField(fieldPath, value);
  };

  const handleRelationClick = (itemId: string, collection: string) => {
    router.push(`/${collection}/${itemId}`);
  };

  const isFieldChanged = (fieldPath: string) => {
    return !!hotelsContext.pendingChanges[fieldPath];
  };

  // Track loading state for related items
  const handleRelatedItemsLoading = (isLoading: boolean) => {
    setRelatedItemsLoading(isLoading);
  };

  return (
    <CommonForm
      dataContext={hotelsContext}
      itemName="Hotel"
      entityType="hotel"
      basePath="hotels"
      displayName={getDisplayName}
      isLoading={isFieldLoading || relatedItemsLoading}
    >
      {!hotelsContext.selectedItem ? (
        <div className="loading-skeleton">
          <SkeletonLoader count={5} type="form" />
        </div>
      ) : (
        <>
          <div className="col-half">
            <TextField
              label="Name"
              fieldPath="name"
              value={hotelsContext.selectedItem?.name || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              required={true}
              isChanged={isFieldChanged("name")}
            />
            <TextField
              label="Address"
              fieldPath="address"
              value={hotelsContext.selectedItem?.address || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("address")}
            />
            <TextField
              label="Postal Code"
              fieldPath="postal_code"
              value={hotelsContext.selectedItem?.postal_code || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("postal_code")}
            />
            <TextField
              label="City"
              fieldPath="city"
              value={hotelsContext.selectedItem?.city || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("city")}
            />
            <TextField
              label="Country"
              fieldPath="country"
              value={hotelsContext.selectedItem?.country || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("country")}
            />
            <TextField
              label="Email"
              fieldPath="email"
              value={hotelsContext.selectedItem?.email || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              type="email"
              isChanged={isFieldChanged("email")}
            />
            <TextField
              label="Phone"
              fieldPath="phone"
              value={hotelsContext.selectedItem?.phone || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              type="tel"
              isChanged={isFieldChanged("phone")}
            />

            {hotelsContext.selectedItem?._id && !hotelsContext.isEditing && (
              <div className="related-section">
                <RelatedItems
                  id={hotelsContext.selectedItem._id}
                  referenceField="general.hotelId"
                  collectionName="contacts"
                  displayFields={[
                    { path: "general.firstName" },
                    { path: "general.lastName" },
                  ]}
                  title="Supplier contacts"
                  emptyMessage="No supplier contacts found for this hotel"
                  onItemClick={handleRelationClick}
                  onLoadingChange={handleRelatedItemsLoading}
                />
              </div>
            )}
            
            <br />
            <br />
            {/* <TextField
              label="Legal/Invoicing Name"
              fieldPath="legal.nameInvoicing"
              value={hotelsContext.selectedItem?.legal?.nameInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("legal.nameInvoicing")}
            />
            <TextField
              label="Invoicing Contact"
              fieldPath="legal.contactInvoicing"
              value={hotelsContext.selectedItem?.legal?.contactInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("legal.contactInvoicing")}
            />
            <TextField
              label="Invoicing Address"
              fieldPath="legal.addressInvoicing"
              value={hotelsContext.selectedItem?.legal?.addressInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("legal.addressInvoicing")}
            />
            <TextField
              label="Invoicing Postal Code"
              fieldPath="legal.postalCodeInvoicing"
              value={
                hotelsContext.selectedItem?.legal?.postalCodeInvoicing || ""
              }
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("legal.postalCodeInvoicing")}
            />
            <TextField
              label="Invoicing City"
              fieldPath="legal.cityInvoicing"
              value={hotelsContext.selectedItem?.legal?.cityInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("legal.cityInvoicing")}
            />
            <TextField
              label="Invoicing Country"
              fieldPath="legal.countryInvoicing"
              value={hotelsContext.selectedItem?.legal?.countryInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("legal.countryInvoicing")}
            />
            <TextField
              label="Invoicing Email"
              fieldPath="legal.emailInvoicing"
              value={hotelsContext.selectedItem?.legal?.emailInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("legal.emailInvoicing")}
            />
            <TextField
              label="Invoicing Phone"
              fieldPath="legal.phoneInvoicing"
              value={hotelsContext.selectedItem?.legal?.phoneInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("legal.phoneInvoicing")}
            /> */}
          </div>

          <div className="col-half">
            <MultiTextField
              label="Room Types"
              fieldPath="roomTypes"
              value={hotelsContext.selectedItem?.roomTypes || []}
              updateField={hotelsContext.updateField}
              isEditing={hotelsContext.isEditing}
              isChanged={isFieldChanged("roomTypes")}
              placeholder="Add a room type..."
            />
            <TextField
              label="Credit details"
              fieldPath="creditDetails"
              value={hotelsContext.selectedItem?.creditDetails || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              multiline={true}
              rows={4}
              isChanged={isFieldChanged("creditDetails")}
            />
            <TextField
              label="Commission details"
              fieldPath="commissionDetails"
              value={hotelsContext.selectedItem?.commissionDetails || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              multiline={true}
              rows={4}
              isChanged={isFieldChanged("commissionDetails")}
            />

            <TextField
              label="Notes"
              fieldPath="notes"
              value={hotelsContext.selectedItem?.notes || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              multiline={true}
              rows={4}
              isChanged={isFieldChanged("notes")}
            />
            <RefField
              label="Parent Hotel"
              fieldPath="parentHotelId"
              value={hotelsContext.selectedItem?.parentHotelId || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              collectionName="hotels"
              displayFields={["name"]}
              isChanged={isFieldChanged("parentHotelId")}
              setFieldLoading={setIsFieldLoading}
            />

            {hotelsContext.selectedItem?._id && !hotelsContext.isEditing && (
              <div className="related-section">
                <RelatedItems
                  id={hotelsContext.selectedItem._id}
                  referenceField="parentHotelId"
                  collectionName="hotels"
                  displayFields={[{ path: "name" }, { path: "city" }]}
                  title="Child Hotels"
                  emptyMessage="No child hotels found"
                  onItemClick={handleRelationClick}
                  onLoadingChange={handleRelatedItemsLoading}
                />
              </div>
            )}
          </div>
          <div className="col-full">
            {hotelsContext.selectedItem?._id && !hotelsContext.isEditing && (
              <div className="related-section">
                <RelatedItems
                  id={hotelsContext.selectedItem._id}
                  referenceField="hotelId"
                  collectionName="stays"
                  displayFields={[
                    { path: "reference" },
                    { path: "roomNumber" },
                  ]}
                  title="Stays in this hotel"
                  emptyMessage="No stays found"
                  onItemClick={handleRelationClick}
                  isFormEditing={hotelsContext.isEditing}
                  onLoadingChange={handleRelatedItemsLoading}
                />
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .related-section {
          margin-bottom: 24px;
        }
        .loading-skeleton {
          width: 100%;
          padding: 1rem;
        }
      `}</style>
    </CommonForm>
  );
}