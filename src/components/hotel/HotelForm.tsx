"use client";
import { useHotelsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { RelatedItems } from "../fields/RelatedItems";
import { useRouter } from "next/navigation";
import { MultiTextField } from "../fields/MultiTextFields";
import { useState } from "react";
import { SkeletonLoader } from "../SkeletonLoader";

export function HotelForm({ key }: { key?: string }) {
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
      isLoading={isFieldLoading}
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
              label="Notes"
              fieldPath="notes"
              value={hotelsContext.selectedItem?.notes || ""}
              onChange={handleFieldChange}
              isEditing={hotelsContext.isEditing}
              multiline={true}
              rows={4}
              isChanged={isFieldChanged("notes")}
            />
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
