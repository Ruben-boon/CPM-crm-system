import { FormField } from "@/types/types";

export const mapContactDetailsToFormFields = (detailData: any): FormField[] => {
  const fields: FormField[] = [
    { id: "objectId", type: "hidden", value: detailData.id },
    {
      id: "firstName",
      label: "First Name",
      value: detailData.firstName || "",
      required: true,
      type: "text",
    },
    {
      id: "lastName",
      label: "Last Name",
      value: detailData.lastName || "",
      required: true,
      type: "text",
    },
    {
      id: "email",
      label: "Email",
      value: detailData.email || "",
      type: "email",
      required: true,
    },
    {
      id: "phone",
      label: "Phone",
      value: detailData.phone || "",
      type: "tel",
    },
    {
      id: "birthday",
      label: "Birthday",
      value: detailData.birthday
        ? new Date(detailData.birthday).toISOString().split("T")[0]
        : "",
      type: "date",
    },
    {
      id: "company.name",
      label: "Company Name",
      value: detailData.company?.name || "",
      type: "text",
    },
    {
      id: "company.vatNumber",
      label: "VAT Number",
      value: detailData.company?.vatNumber || "",
      type: "text",
    },
    {
      id: "address.street",
      label: "Street Name",
      value: detailData.address?.street || "",
      type: "text",
    },
    {
      id: "address.buildingNumber",
      label: "Building Number",
      value: detailData.address?.buildingNumber || "",
      type: "text",
    },
    {
      id: "address.zipCode",
      label: "Zip Code",
      value: detailData.address?.zipCode || "",
      type: "text",
    },
    {
      id: "address.country",
      label: "Country",
      value: detailData.address?.country || "",
      type: "text",
    },
    {
      id: "entity",
      label: "Entity Name",
      value: detailData.entity || "",
      type: "text",
    },
    {
      id: "locationType",
      label: "Location Type",
      value: detailData.locationType || "",
      type: "dropdown",
      dropdownFields: ["Headquarters", "Branch", "Warehouse", "Office"],
    },
    {
      id: "invoicingEmail",
      label: "Invoicing Email",
      value: detailData.invoicingEmail || "",
      type: "email",
    },
    {
      id: "currency",
      label: "Currency",
      value: detailData.currency || "",
      type: "dropdown",
      dropdownFields: ["EUR", "USD", "GBP"],
    },
    {
      id: "standardRate",
      label: "Standard Rate",
      value: detailData.standardRate || "",
      type: "number",
    },
    {
      id: "commissionDetails",
      label: "Commission Details",
      value: detailData.commissionDetails || "",
      type: "text",
    },
    //reference
    {
      id: "bookingRefs",
      label: "Bookings",
      value: detailData.bookingRefs || "",
      type: "reference-array",
      populatedData: detailData.bookings
        ? detailData.bookings.map((booking: any) => ({
            label: "Booking Confirmation",
            value: `${booking.confirmationNumber} (${booking.status})`,
          }))
        : undefined,
    },
  ];

  return fields;
};
