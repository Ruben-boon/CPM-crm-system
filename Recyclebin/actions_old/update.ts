"use server";

import clientPromise from "@/lib/mongoDB";
import { FormField } from "@/types/types";
import { ObjectId } from "mongodb";

const databaseName = "CRM";

export async function updateDocument(
  collection: string,
  formFields: FormField[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collectionRef = db.collection(collection);

    const idField = formFields.find((field) => field.id === "objectId");
    if (!idField?.value) {
      return { success: false, error: "Document ID is required for update" };
    }

    const updateObject: Record<string, any> = {};
    formFields
      .filter(field => field.id !== "objectId" && field.path)
      .forEach(field => {
        if (field.path) { 
          updateObject[field.path] = field.value;
        }
      });

    const documentWithTimestamp = {
      ...updateObject,
      updatedAt: new Date()
    };

    const result = await collectionRef.findOneAndUpdate(
      { _id: new ObjectId(idField.value) },
      { $set: documentWithTimestamp },
      { returnDocument: "after" }
    );

    if (!result?.value) {
      const updatedDoc = await collectionRef.findOne({
        _id: new ObjectId(idField.value)
      });
      
      if (!updatedDoc) {
        return {
          success: false,
          error: `Failed to retrieve updated ${collection} document`
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`Update ${collection} error:`, error);
    const errorMessage = error instanceof Error && error.message.includes("ObjectId")
      ? "Invalid document ID format"
      : error instanceof Error
        ? error.message
        : `An error occurred while updating the ${collection} document`;

    return { success: false, error: errorMessage };
  }
}