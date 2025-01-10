// app/actions/contacts.ts
'use server'

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function updateContact(id: string, data: any) {
  try {
    const client = await clientPromise;
    const db = client.db('CRM');
    const collection = db.collection('contacts');

    // Remove undefined values and convert empty strings to null
    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanedData }
    );

    revalidatePath('/contacts');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating contact:', error);
    return { success: false, error: 'Failed to update contact' };
  }
}

export async function createContact(data: any) {
  try {
    const client = await clientPromise;
    const db = client.db('CRM');
    const collection = db.collection('contacts');

    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    const result = await collection.insertOne(cleanedData);

    revalidatePath('/contacts');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating contact:', error);
    return { success: false, error: 'Failed to create contact' };
  }
}

export async function deleteContact(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db('CRM');
    const collection = db.collection('contacts');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    revalidatePath('/contacts');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error deleting contact:', error);
    return { success: false, error: 'Failed to delete contact' };
  }
}