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
  searchField = "name",
  userId?: string // Add userId parameter (optional for backward compatibility)
): Promise<T[]> {
  const client = await clientPromise;
  const db = client.db("CRM");

  let query: any = {};
  
  // Add userId to query if provided
  if (userId) {
    query.userId = userId;
  }
  
  if (searchTerm && searchField) {
    if (searchField === "_id") {
      // Only attempt to create ObjectId if the searchTerm matches MongoDB ObjectId format
      if (/^[0-9a-fA-F]{24}$/.test(searchTerm)) {
        try {
          query = { 
            _id: new ObjectId(searchTerm),
            ...(userId ? { userId } : {})
          };
        } catch (error) {
          console.error("Invalid ObjectId format:", error);
          return [];
        }
      } else {
        // Return empty array if ID format is invalid
        return [];
      }
    } else {
      query[searchField] = { $regex: searchTerm, $options: "i" };
    }
  }

  try {
    const results = await db.collection(collectionName)
      .find(query)
      .toArray();

    // Convert to plain objects and ensure all fields are serializable
    return results.map(doc => {
      const plainDoc = JSON.parse(JSON.stringify(doc, (key, value) => 
        value instanceof ObjectId ? value.toString() : value
      ));
      return plainDoc as T;
    });
  } catch (error) {
    console.error(`Search error in ${collectionName}:`, error);
    throw error;
  }
}

export async function createDocument<T extends { _id?: string }>(
  collectionName: string,
  document: T,
  userId?: string // Add userId parameter (optional for backward compatibility)
): Promise<DatabaseResult<T>> {
  try {
    const client = await clientPromise;
    const collection = client.db("CRM").collection(collectionName);

    const { _id, ...documentData } = document;
    
    // Add userId to document if provided
    const documentWithUserId = userId ? { ...documentData, userId } : documentData;
    
    const result = await collection.insertOne(documentWithUserId);

    return {
      success: result.acknowledged,
      data: { 
        ...document, 
        _id: result.insertedId.toString(),
        ...(userId ? { userId } : {})
      } as T,
    };
  } catch (error) {
    console.error(`Create error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed",
    };
  }
}

export async function updateDocument<T extends { _id: string, version?: number }>(
  collectionName: string,
  id: string,
  document: T,
  userId?: string // Add userId parameter (optional for backward compatibility)
): Promise<DatabaseResult<T>> {
  try {
    const client = await clientPromise;
    const collection = client.db("CRM").collection(collectionName);

    const { _id, version, ...updateData } = document;
    
    // Validate ObjectId format before attempting update
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return { 
        success: false, 
        error: "Invalid document ID format" 
      };
    }

    try {
      // Create query - include userId if provided
      const query: any = { _id: new ObjectId(id) };
      if (userId) {
        query.userId = userId;
      }
      
      // If document versioning is being used
      if (version !== undefined) {
        // Get current document version
        const currentDoc = await collection.findOne(query);
        const currentVersion = currentDoc?.version || 0;
        
        // Check for version conflicts
        if (version !== currentVersion) {
          return { 
            success: false, 
            error: "Document has been modified by another user. Please refresh and try again." 
          };
        }
        
        // Increment version on update
        updateData.version = currentVersion + 1;
      }
      
      const result = await collection.updateOne(
        query,
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
      if (error instanceof Error && error.message.includes("ObjectId")) {
        return { success: false, error: "Invalid document ID format" };
      }
      throw error;
    }
  } catch (error) {
    console.error(`Update error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

export async function deleteDocument(
  collectionName: string,
  id: string,
  userId?: string // Add userId parameter (optional for backward compatibility)
): Promise<DatabaseResult<{ id: string }>> {
  try {
    const client = await clientPromise;
    const collection = client.db("CRM").collection(collectionName);
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return { 
        success: false, 
        error: "Invalid document ID format" 
      };
    }
    
    try {
      // Create query - include userId if provided
      const query: any = { _id: new ObjectId(id) };
      if (userId) {
        query.userId = userId;
      }
      
      const result = await collection.deleteOne(query);
      
      if (result.deletedCount === 1) {
        return { success: true, data: { id } };
      }
      
      return { 
        success: false, 
        error: "Document not found or could not be deleted" 
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("ObjectId")) {
        return { success: false, error: "Invalid document ID format" };
      }
      throw error;
    }
  } catch (error) {
    console.error(`Delete error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deletion failed",
    };
  }
}