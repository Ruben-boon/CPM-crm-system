"use server";
import clientPromise from "@/lib/mongoDB";
import { ObjectId } from "mongodb";

interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function searchDocuments<T>(
  collectionName: string,
  searchTerm = "",
  searchField = "name"
): Promise<T[]> {
  const client = await clientPromise;
  const db = client.db("CRM");

  let query = {};
  if (searchTerm && searchField) {
    query = searchField === "_id" 
      ? { _id: new ObjectId(searchTerm) }
      : { [searchField]: { $regex: searchTerm, $options: "i" } };
  }

  try {
    const results = await db.collection(collectionName)
      .find(query)
      .toArray();

    return results.map(doc => {
      const { bookings, _id, ...rest } = doc;
      return {
        ...rest,
        _id: _id.toString(),
        bookings: bookings ? bookings.toString() : undefined
      };
    }) as T[];
  } catch (error) {
    console.error(`Search error in ${collectionName}:`, error);
    throw error;
  }
}

export async function createDocument<T extends { _id?: string }>(
  collectionName: string,
  document: T
): Promise<DatabaseResult<T>> {
  try {
    const client = await clientPromise;
    const collection = client.db("CRM").collection(collectionName);

    const { _id, ...documentData } = document;
    const result = await collection.insertOne(documentData);

    return {
      success: result.acknowledged,
      data: { ...document, _id: result.insertedId.toString() },
    };
  } catch (error) {
    console.error(`Create error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed",
    };
  }
}

export async function updateDocument<T extends { _id: string }>(
  collectionName: string,
  id: string,
  document: T
): Promise<DatabaseResult<T>> {
  try {
    const client = await clientPromise;
    const collection = client.db("CRM").collection(collectionName);

    const { _id, ...updateData } = document;
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 1) {
      return { success: true, data: document };
    }
    if (result.matchedCount === 0) {
      return { success: false, error: "Document not found" };
    }
    return { success: false, error: "Document found but not modified" };
  } catch (error) {
    console.error(`Update error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}
