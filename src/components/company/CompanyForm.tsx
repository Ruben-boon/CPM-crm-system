"use client";
import { useCompaniesData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { RefField } from "../fields/RefField";
import { RelatedItems } from "../fields/RelatedItems";
import { useRouter } from "next/navigation";

export function CompanyForm() {
  const companiesContext = useCompaniesData();
  const router = useRouter();

  const getDisplayName = (item: any) => {
    return item?.name || "this company";
  };
  
  // Match ContactForm's signature exactly
  const handleFieldChange = (
    fieldPath: string,
    value: string,
    displayValue?: string
  ) => {
    companiesContext.updateField(fieldPath, value);
  };

  const handleRelationClick = (companyId: string, collection: string) => {
    router.push(`/${collection}/${companyId}`);
  };

  const isFieldChanged = (fieldPath: string) => {
    return !!companiesContext.pendingChanges[fieldPath];
  };

  return (
    <CommonForm
      dataContext={companiesContext}
      itemName="Company"
      entityType="company"
      basePath="companies"
      displayName={getDisplayName}
    >
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
          label="Country"
          fieldPath="country"
          value={companiesContext.selectedItem?.country || ""}
          onChange={handleFieldChange}
          isEditing={companiesContext.isEditing}
          isChanged={isFieldChanged("country")}
        />
        <RefField
          label="Parent Company"
          fieldPath="parentCompanyId"
          value={companiesContext.selectedItem?.parentCompanyId || ""}
          onChange={handleFieldChange}
          isEditing={companiesContext.isEditing}
          collectionName="companies"
          displayFields={["name"]}
          isChanged={isFieldChanged("parentCompanyId")}
          setFieldLoading={companiesContext.setFieldLoading}
        />
        
        {companiesContext.selectedItem?._id && !companiesContext.isEditing && (
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
            />
          </div>
        )}
      </div>
      
      <div className="col-half">
        {companiesContext.selectedItem?._id && !companiesContext.isEditing && (
          <div className="related-section">
            <RelatedItems
              id={companiesContext.selectedItem._id}
              referenceField="parentCompanyId"
              collectionName="companies"
              displayFields={[{ path: "name" }, { path: "city" }]}
              title="Child Companies"
              emptyMessage="No child companies found"
              onItemClick={handleRelationClick}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .related-section {
          margin-top: 2rem;
        }
      `}</style>
    </CommonForm>
  );
}