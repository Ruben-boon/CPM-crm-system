export interface SerializedContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  company?: any; // Keep as any since it's a complex object
  preferences?: any;
  documents?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to handle Buffer objects
function serializeBufferValues(obj: any): any {
  if (!obj) return obj;

  if (Buffer.isBuffer(obj)) {
    return obj.toString("utf8");
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeBufferValues(item));
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBufferValues(value);
    }
    return result;
  }

  return obj;
}

export const serializeContact = (doc: any): SerializedContact => {
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    position: doc.position,
    company: serializeBufferValues(doc.company),
    preferences: doc.preferences,
    documents: serializeBufferValues(doc.documents),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
};
