// import { MockDocument } from "../types"; // Assuming your types are in lib/types
//make types for all formats in and out

export const fMongoDataToComponent = (rawData: MockDocument[]) => {
  return rawData.map((doc) => ({
    id: doc._id,
    name: `${doc.firstName} ${doc.lastName}`,
    email: doc.email,
    phone: doc.phone,
    company: doc.company?.name || "Unknown",
    address: `${doc.address?.street}, ${doc.address?.city}, ${doc.address?.country}`,
  }));
};

export const fDetailDataToInputFields = (detailData: any) => {
  const fields: FormField[] = [
    {
      id: "firstName",
      label: "First Name",
      value: detailData.firstName || "",
      required: true,
      type: "text",
    },
    {
      id: "lastName",
      label: "Last name",
      value: detailData.lastName || "",
      required: true,
      type: "text",
    },
    {
      id: "email",
      label: "Email",
      value: detailData.email || "",
      type: "email",
    },
    {
      id: "phone",
      label: "Phone",
      value: detailData.phone || "",
      type: "tel",
    },
    {
      id: "company.name",
      label: "Company name",
      value: detailData.company?.name || "",
    },
    {
      id: "address.street",
      label: "Address street",
      value: detailData.address?.street || "",
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
      id: "entity",
      label: "entity",
      value: detailData.entity || "",
      required: false,
      type: "dropdown",
      dropdownFields: ["Afdeling financien", "Marketing"],
    },
  ];

  return fields;
};
