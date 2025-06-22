"use server";
import clientPromise from "@/lib/mongoDB";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Logs an activity to the 'activity_logs' collection.
 * @param action - The action performed (e.g., 'create', 'update', 'delete').
 * @param collectionName - The name of the collection where the action occurred.
 * @param documentId - The ID of the document that was affected.
 * @param userId - The ID of the user who performed the action.
 */
async function logActivity(
  action: string,
  collectionName: string,
  documentId: string,
  userId: string | undefined
) {
  if (!userId) {
    console.warn("No user ID found, skipping activity log.");
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db("CRM");
    const logCollection = db.collection("activity_logs");
    await logCollection.insertOne({
      userId,
      action,
      collectionName,
      documentId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

export async function searchDocuments<T>(
  collectionName: string,
  searchTerm = "",
  searchField = "name"
): Promise<T[]> {
  const client = await clientPromise;
  const db = client.db("CRM");

  let query: any = {};
  console.log(
    "searchDocuments collectionName;",
    collectionName,
    "searchTerm",
    searchTerm,
    "searchField",
    searchField
  );

  if (searchTerm && searchField) {
    if (searchField === "_id") {
      if (/^[0-9a-fA-F]{24}$/.test(searchTerm)) {
        try {
          query = { _id: new ObjectId(searchTerm) };
        } catch (error) {
          console.error("Invalid ObjectId format:", error);
          return [];
        }
      } else {
        return [];
      }
    } else {
      query[searchField] = { $regex: searchTerm, $options: "i" };
    }
  }

  try {
    const results = await db
      .collection(collectionName)
      .find(query)
      .limit(20)
      .toArray();

    return results.map((doc) => {
      const plainDoc = JSON.parse(
        JSON.stringify(doc, (key, value) =>
          value instanceof ObjectId ? value.toString() : value
        )
      );
      return plainDoc as T;
    });
  } catch (error) {
    console.error(`Search error in ${collectionName}:`, error);
    throw error;
  }
}

export async function createDocument<T extends { _id?: string }>(
  collectionName: string,
  document: T
): Promise<DatabaseResult<T>> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  console.log("createDocument document:", document);
  try {
    const client = await clientPromise;
    const collection = client.db("CRM").collection(collectionName);

    const { _id, ...documentData } = document;

    const documentWithUserId = userId
      ? { ...documentData, createdBy: userId, updatedBy: userId }
      : documentData;

    const result = await collection.insertOne(documentWithUserId);

    if (result.acknowledged) {
      const newId = result.insertedId.toString();
      await logActivity("create", collectionName, newId, userId);
      return {
        success: true,
        data: {
          ...document,
          _id: newId,
          ...(userId ? { createdBy: userId, updatedBy: userId } : {}),
        } as T,
      };
    }
    return {
        success: false,
        error: "Creation failed",
      };
  } catch (error) {
    console.error(`Create error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed",
    };
  }
}

export async function updateDocument<
  T extends { _id: string; version?: number }
>(
  collectionName: string,
  id: string,
  document: T
): Promise<DatabaseResult<T>> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  console.log("updateDocument document:", document, "id:", id);
  try {
    const client = await clientPromise;
    const collection = client.db("CRM").collection(collectionName);

    const { _id, version, ...updateData } = document;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return {
        success: false,
        error: "Invalid document ID format",
      };
    }

    try {
      const query: any = { _id: new ObjectId(id) };

      const dataWithAudit = {
        ...updateData,
        ...(userId ? { updatedBy: userId, updatedAt: new Date() } : {}),
      };

      if (version !== undefined) {
        const currentDoc = await collection.findOne(query);
        const currentVersion = currentDoc?.version || 0;

        if (version !== currentVersion) {
          return {
            success: false,
            error:
              "Document has been modified by another user. Please refresh and try again.",
          };
        }
        dataWithAudit.version = currentVersion + 1;
      }

      const result = await collection.updateOne(query, { $set: dataWithAudit });

      if (result.modifiedCount === 1) {
        await logActivity("update", collectionName, id, userId);
        return {
          success: true,
          data: {
            ...document,
            ...(userId ? { updatedBy: userId, updatedAt: new Date() } : {}),
            ...(version !== undefined ? { version: (version || 0) + 1 } : {}),
          } as T,
        };
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
  id: string
): Promise<DatabaseResult<{ id: string }>> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  try {
    const client = await clientPromise;
    const collection = client.db("CRM").collection(collectionName);

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return {
        success: false,
        error: "Invalid document ID format",
      };
    }

    try {
      const query = { _id: new ObjectId(id) };
      const result = await collection.deleteOne(query);

      if (result.deletedCount === 1) {
        await logActivity("delete", collectionName, id, userId);
        return { success: true, data: { id } };
      }

      return {
        success: false,
        error: "Document not found or could not be deleted",
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