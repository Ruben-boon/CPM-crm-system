import { MockMongoClient } from '@/lib/mockMongoDB';
import { NextResponse } from 'next/server';

//this currently fetches all contacts, but it should fetch depending on the search

// Handle GET requests
export async function GET(req: Request, context: { params: { collection: string } }) {
  const { collection } = await context.params; // Await the params object

  try {
    const client = await MockMongoClient.connect('mock_uri');
    const db = client.db('mock_db');
    // Fetch all documents from the specified collection
    const documents = await db.collection(collection).find({}).toArray();

    if (documents.length === 0) {
      return NextResponse.json({ message: 'No documents found' }, { status: 404 });
    }

    await client.close();
    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Error connecting to database' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
