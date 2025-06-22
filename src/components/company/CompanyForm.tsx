"use client";
import { useCompaniesData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { RefField } from "../fields/RefField";
import { RelatedItems } from "../fields/RelatedItems";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SkeletonLoader } from "../SkeletonLoader";

export function CompanyForm({key}) {
  const companiesContext = useCompaniesData();
  const router = useRouter();
  const [isFieldLoading, setIsFieldLoading] = useState(false);
  const [relatedItemsLoading, setRelatedItemsLoading] = useState(false);

  const getDisplayName = (item: any) => {
    return item?.name || "this company";
  };

  const handleFieldChange = (
    fieldPath: string,
    value: string,
    displayValue?: string
  ) => {
    companiesContext.updateField(fieldPath, value);
  };

  const handleRelationClick = (itemId: string, collection: string) => {
    router.push(`/${collection}/${itemId}`);
  };

  const isFieldChanged = (fieldPath: string) => {
    return !!companiesContext.pendingChanges[fieldPath];
  };

  // Track loading state for related items
  const handleRelatedItemsLoading = (isLoading: boolean) => {
    setRelatedItemsLoading(isLoading);
  };

  return (
    <CommonForm
      dataContext={companiesContext}
      itemName="Company"
      entityType="company"
      basePath="companies"
      displayName={getDisplayName}
      isLoading={isFieldLoading}
    >
      {companiesContext.isLoading ? (
        <div className="loading-skeleton">
          <SkeletonLoader count={5} />
        </div>
      ) : (
        <>
          <div className="col-half">
            <TextField
              label="Name"
              fieldPath="name"
              value={companiesContext.selectedItem?.name || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              required={true}
              isChanged={isFieldChanged("name")}
            />
            <TextField
              label="Address"
              fieldPath="address"
              value={companiesContext.selectedItem?.address || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("address")}
            />
            <TextField
              label="Postal Code"
              fieldPath="postal_code"
              value={companiesContext.selectedItem?.postal_code || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("postal_code")}
            />
            <TextField
              label="City"
              fieldPath="city"
              value={companiesContext.selectedItem?.city || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("city")}
            />
            <TextField
              label="Phone"
              fieldPath="phone"
              value={companiesContext.selectedItem?.phone || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("phone")}
            />
            <TextField
              label="Country"
              fieldPath="country"
              value={companiesContext.selectedItem?.country || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("country")}
            />
            <TextField
              label="Remarks"
              fieldPath="remarks"
              value={companiesContext.selectedItem?.remarks || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("remarks")}
            />

            {/* Legal/Invoicing Fields */}
            <br />
            <br />

            {/* <TextField
              label="Legal/Invoicing Name"
              fieldPath="legal.nameInvoicing"
              value={companiesContext.selectedItem?.legal?.nameInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("legal.nameInvoicing")}
            />
            <TextField
              label="Invoicing Contact"
              fieldPath="legal.contactInvoicing"
              value={
                companiesContext.selectedItem?.legal?.contactInvoicing || ""
              }
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("legal.contactInvoicing")}
            />
            <TextField
              label="Invoicing Address"
              fieldPath="legal.addressInvoicing"
              value={
                companiesContext.selectedItem?.legal?.addressInvoicing || ""
              }
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("legal.addressInvoicing")}
            />
            <TextField
              label="Invoicing Postal Code"
              fieldPath="legal.postalCodeInvoicing"
              value={
                companiesContext.selectedItem?.legal?.postalCodeInvoicing || ""
              }
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("legal.postalCodeInvoicing")}
            />
            <TextField
              label="Invoicing City"
              fieldPath="legal.cityInvoicing"
              value={companiesContext.selectedItem?.legal?.cityInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("legal.cityInvoicing")}
            />
            <TextField
              label="Invoicing Country"
              fieldPath="legal.countryInvoicing"
              value={
                companiesContext.selectedItem?.legal?.countryInvoicing || ""
              }
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("legal.countryInvoicing")}
            />

            <TextField
              label="Invoicing Email"
              fieldPath="legal.emailInvoicing"
              value={companiesContext.selectedItem?.legal?.emailInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("legal.emailInvoicing")}
            />
            <TextField
              label="Invoicing Phone"
              fieldPath="legal.phoneInvoicing"
              value={companiesContext.selectedItem?.legal?.phoneInvoicing || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              isChanged={isFieldChanged("legal.phoneInvoicing")}
            /> */}
          </div>

          <div className="col-half">
            <RefField
              label="Parent Company"
              fieldPath="parentCompanyId"
              value={companiesContext.selectedItem?.parentCompanyId || ""}
              onChange={handleFieldChange}
              isEditing={companiesContext.isEditing}
              collectionName="companies"
              displayFields={["name"]}
              isChanged={isFieldChanged("parentCompanyId")}
              setFieldLoading={setIsFieldLoading}
            />
            {companiesContext.selectedItem?._id &&
              !companiesContext.isEditing && (
                <div className="related-section">
                  <RelatedItems
                    id={companiesContext.selectedItem._id}
                    referenceField="parentCompanyId"
                    collectionName="companies"
                    displayFields={[{ path: "name" }, { path: "city" }]}
                    title="Child Companies"
                    emptyMessage="No child companies found"
                    onItemClick={handleRelationClick}
                    onLoadingChange={handleRelatedItemsLoading}
                  />
                </div>
              )}
            {companiesContext.selectedItem?._id &&
              !companiesContext.isEditing && (
                <div className="related-section">
                  <RelatedItems
                    id={companiesContext.selectedItem._id}
                    referenceField="general.companyId"
                    collectionName="contacts"
                    displayFields={[
                      { path: "general.title" },
                      { path: "general.firstName" },
                      { path: "general.lastName" },
                    ]}
                    title="Contacts"
                    emptyMessage="No contacts found"
                    onItemClick={handleRelationClick}
                    onLoadingChange={handleRelatedItemsLoading}
                  />
                </div>
              )}
            {companiesContext.selectedItem?._id &&
              !companiesContext.isEditing && (
                <div className="related-section">
                  <RelatedItems
                    id={companiesContext.selectedItem._id}
                    referenceField="companyId"
                    collectionName="bookings"
                    displayFields={[
                      { path: "confirmationNo" },
                      { path: "travelPeriodStart", label: "Travel Period" },
                      { path: "travelPeriodEnd" },
                    ]}
                    title="Bookings by this company"
                    emptyMessage="No bookings found for this company"
                    onItemClick={handleRelationClick}
                    isFormEditing={companiesContext.isEditing}
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
        .start-invoice {
          margin-top: 4rem;
        }
      `}</style>
    </CommonForm>
  );
}
