"use server";

import clientPromise from "@/lib/mongoDB";
import { FormField } from "@/types/types";
import { serializeContact } from "@/utils/serializers";

const databaseName = "CRM";

interface CreateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function formFieldsToDocument(formFields: FormField[]): Record<string, any> {
  const document: Record<string, any> = {};

  formFields.forEach((field) => {
    const { id, value, type: fieldType } = field;

    if (id.includes(".")) {
      // Handle nested fields (e.g., "company.name")
      const [parent, child] = id.split(".");
      if (!document[parent]) {
        document[parent] = {};
      }
      document[parent][child] = value;
    } else {
      // Handle top-level fields with type conversion
      switch (fieldType) {
        case "date":
          document[id] = value ? new Date(value) : null;
          break;
        case "number":
          document[id] = value ? parseFloat(value) : null;
          break;
        default:
          document[id] = value;
      }
    }
  });

  return document;
}

export async function createDocument(
  collection: string,
  formFields: FormField[]
): Promise<CreateResponse> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collectionRef = db.collection(collection);

    // Convert form fields to document object
    const documentData = formFieldsToDocument(formFields);

    // Add timestamps
    const now = new Date();
    const documentWithTimestamps = {
      ...documentData,
      createdAt: now,
      updatedAt: now,
    };

    // Insert the document
    const result = await collectionRef.insertOne(documentWithTimestamps);

    if (!result.acknowledged) {
      throw new Error(`Failed to create ${collection} document`);
    }

    // Fetch the created document
    const createdDocument = await collectionRef.findOne({
      _id: result.insertedId,
    });

    if (!createdDocument) {
      throw new Error(`Failed to fetch created ${collection} document`);
    }

    let serializedDocument;
    switch (collection) {
      case "contacts":
        serializedDocument = serializeContact(createdDocument);
        break;
      //add switch statement for different types
      default:
        serializedDocument = createdDocument;
    }

    return {
      success: true,
      data: serializedDocument,
    };
  } catch (error) {
    console.error(`Create ${collection} error:`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `An error occurred while creating the ${collection} document`,
    };
  }
}
