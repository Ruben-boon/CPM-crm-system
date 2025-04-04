// app/actions/userPreferences.ts
"use server";
import clientPromise from "@/lib/mongoDB";
import { ObjectId } from "mongodb";

interface UserPreferences {
  userId: string;
  accentColor?: string;
  fontSize?: string;
  theme?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (!userId) return null;

  try {
    const client = await clientPromise;
    const db = client.db("CRM");
    
    const preferences = await db.collection("userPreferences").findOne({ userId });
    
    if (preferences) {
      // Convert ObjectId to string
      const result = JSON.parse(JSON.stringify(preferences, (key, value) => 
        value instanceof ObjectId ? value.toString() : value
      ));
      return result;
    }
    
    // If no preferences exist yet, return default values
    return {
      userId,
      accentColor: "#7c3aed", // Default accent color
      fontSize: "16px", // Default font size
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
}

export async function saveUserPreferences(
  userId: string, 
  preferences: Partial<UserPreferences>
): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const client = await clientPromise;
    const db = client.db("CRM");
    
    // Update with upsert (create if doesn't exist)
    const result = await db.collection("userPreferences").updateOne(
      { userId },
      { 
        $set: { 
          ...preferences,
          updatedAt: new Date() 
        },
        $setOnInsert: { 
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    return result.acknowledged;
  } catch (error) {
    console.error("Error saving user preferences:", error);
    return false;
  }
}