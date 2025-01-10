// app/api/test-connection/route.ts

import clientPromise from '@/lib/mongoDB';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('CRM');
    
    // Get list of all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Get sample data from each collection
    const collectionData = await Promise.all(
      collectionNames.map(async (name) => {
        const data = await db.collection(name).find({}).limit(5).toArray();
        return {
          collectionName: name,
          count: await db.collection(name).countDocuments(),
          sampleData: data
        };
      })
    );

    return NextResponse.json({
      status: 'Connected to MongoDB',
      database: 'CRM',
      collections: collectionData
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { 
        status: 'Failed to connect to MongoDB',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}