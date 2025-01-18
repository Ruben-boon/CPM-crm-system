"use server";

import clientPromise from "@/lib/mongoDB";
import { FormField } from "@/types/types";

const databaseName = "CRM";

export async function createDocument(
  collection: string,
  formFields: FormField[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collectionRef = db.collection(collection);

    // Create nested document structure
    const documentData: Record<string, any> = {};
    formFields
      .filter(field => field.path)
      .forEach(field => {
        if (field.path) {
          const pathParts = field.path.split('.');
          let current = documentData;
          
          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
          
          const lastPart = pathParts[pathParts.length - 1];
          current[lastPart] = field.value;
        }
      });

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
      return { success: false, error: `Failed to create ${collection} document` };
    }

    return { success: true };
  } catch (error) {
    console.error(`Create ${collection} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `An error occurred while creating the ${collection} document`
    };
  }
}