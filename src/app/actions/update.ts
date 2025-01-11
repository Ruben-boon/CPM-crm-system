'use server';

import clientPromise from "@/lib/mongoDB";
import { FormField } from "@/types/types";
import { ObjectId } from "mongodb";
import { serializeContact } from "@/utils/serializers";
import { formFieldsToDocument } from "@/utils/documentToFields";

const databaseName = "CRM";

interface UpdateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function updateDocument(
  collection: string,
  formFields: FormField[]
): Promise<UpdateResponse> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collectionRef = db.collection(collection);

    const idField = formFields.find((field) => field.id === "objectId");

    if (!idField || !idField.value) {
      return {
        success: false,
        error: "Document ID is required for update"
      };
    }

    // Remove id from document data
    const fieldsWithoutId = formFields.filter((field) => field.id !== "objectId");
    const documentData = formFieldsToDocument(fieldsWithoutId);

    const documentWithTimestamp = {
      ...documentData,
      updatedAt: new Date(),
    };

    // Update using findOneAndUpdate with explicit options
    const result = await collectionRef.findOneAndUpdate(
      { _id: new ObjectId(idField.value) },
      { $set: documentWithTimestamp },
      { 
        returnDocument: "after",  // Return the updated document
        projection: { _id: 1, ...Object.keys(documentData).reduce((acc, key) => ({ ...acc, [key]: 1 }), {}) }  // Include all fields
      }
    );

    // If no document found after update, try direct fetch
    const updatedDoc = result?.value || await collectionRef.findOne({ _id: new ObjectId(idField.value) });
    
    if (!updatedDoc) {
      return {
        success: false,
        error: `Failed to retrieve updated ${collection} document`
      };
    }

    // Serialize the document
    let serializedDocument;
    try {
      switch (collection) {
        case "contacts":
          serializedDocument = serializeContact(updatedDoc);
          break;
        default:
          serializedDocument = updatedDoc;
      }
    } catch (serializeError) {
      console.error('Serialization error:', serializeError);
      return {
        success: false,
        error: 'Failed to serialize updated document'
      };
    }

    return {
      success: true,
      data: serializedDocument,
    };

  } catch (error) {
    console.error(`Update ${collection} error:`, error);
    if (error instanceof Error) {
      if (error.message.includes('ObjectId')) {
        return {
          success: false,
          error: 'Invalid document ID format'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: false,
      error: `An error occurred while updating the ${collection} document`
    };
  }
}