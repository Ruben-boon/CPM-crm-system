"use server";
import clientPromise from "@/lib/mongoDB";
import { Contact, buildContactQuery } from "./contacts_old";

const databaseName = "CRM";
const searchResultLimit = 8;

// Helper function to serialize MongoDB documents (all types)
function serializeDocument(doc: any): any {
  return {
    ...doc,
    _id: doc._id.toString(),
  };
}

interface SearchResponse {
  success: boolean;
  total?: number;
  searchableFields?: string[];
  results?: Contact[];
  error?: string;
}

export async function searchData(
  collection: string,
  projection: any,
  searchField?: string,
  searchTerm?: string,
): Promise<SearchResponse> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const coll = db.collection(collection);

    console.log(searchField, searchTerm);
    let query = {};
    if (searchField && searchTerm) {
      query = buildContactQuery(searchField, searchTerm);
    }

    // Simple find operation with projection
    const results = await coll
      .find(query)
      .project(projection)
      .limit(searchResultLimit)
      .toArray();

    // Serialize the results
    const serializedResults = results.map(serializeDocument);

    return {
      success: true,
      total: serializedResults.length,
      results: serializedResults,
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
