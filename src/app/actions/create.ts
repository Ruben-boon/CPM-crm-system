"use server";

import clientPromise from "@/lib/mongoDB";
import { FormField } from "@/types/types";
import { serializeContact } from "@/utils/serializers";
import { formFieldsToDocument } from "@/utils/documentToFields";

const databaseName = "CRM";

interface CreateResponse {
  success: boolean;
  data?: any;
  error?: string;
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
    console.log("✅ Document created successfully:", {
      collection,
      updatedAt: documentWithTimestamps.updatedAt,
    });

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
