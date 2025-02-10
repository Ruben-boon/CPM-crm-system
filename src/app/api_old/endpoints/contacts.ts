"use server";
import clientPromise from "@/lib/mongoDB";
import { Contact } from "@/domain_old/contacts/contactModel";
import { ObjectId } from "mongodb";
import { contactProjection } from "@/domain_old/contacts/contactModel";

const databaseName = "CRM";
const collectionName = "contacts";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to serialize MongoDB documents
function serializeDocument(doc: any): any {
  return {
    ...doc,
    _id: doc._id.toString(),
  };
}

export async function searchData(
  searchField: string,
  searchTerm: string
): Promise<ApiResponse<Contact[]>> {
  console.log("searchData fired searching with:", searchField, searchTerm);
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const searchPath = searchField.includes(".")
      ? searchField
      : `general.${searchField}`;
    const query = {
      [searchPath]: { $regex: searchTerm, $options: "i" },
    };

    const results = await collection
      .find(query)
      .project(contactProjection)
      .limit(10)
      .toArray();

    return {
      success: true,
      data: results.map(serializeDocument),
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function createContact(
  contact: Omit<Contact, "_id">
): Promise<ApiResponse<Contact>> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const now = new Date();
    const documentToInsert = {
      ...contact,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(documentToInsert);

    if (!result.acknowledged) {
      throw new Error("Failed to create contact");
    }

    const created = await collection.findOne({ _id: result.insertedId });

    return {
      success: true,
      data: serializeDocument(created),
    };
  } catch (error) {
    console.error("Create contact error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create contact",
    };
  }
}

export async function updateContact(
  contact: Contact
): Promise<ApiResponse<void>> {  // Changed return type to void
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const { _id, ...updateData } = contact;
    const documentToUpdate = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: documentToUpdate }
    );

    if (!result.acknowledged) {
      throw new Error("Failed to update contact");
    }

    return {
      success: true
    };
    
  } catch (error) {
    console.error("Update contact error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update contact",
    };
  }
}

export async function deleteContact(id: string): Promise<ApiResponse<void>> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (!result.acknowledged) {
      throw new Error("Failed to delete contact");
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete contact error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete contact",
    };
  }
}

export async function getContact(id: string): Promise<ApiResponse<Contact>> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const contact = await collection.findOne({ _id: new ObjectId(id) });

    if (!contact) {
      throw new Error("Contact not found");
    }

    return {
      success: true,
      data: serializeDocument(contact),
    };
  } catch (error) {
    console.error("Get contact error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get contact",
    };
  }
}
