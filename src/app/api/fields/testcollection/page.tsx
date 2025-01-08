import { NextApiRequest, NextApiResponse } from 'next';
import { MockMongoClient } from '../../../../mockMongoDB';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { collection } = req.query;

  try {
    const client = await MockMongoClient.connect('mock_uri');
    const db = client.db('mock_db');
    
    const sampleDoc = await db.collection(String(collection)).findOne();

    if (!sampleDoc) {
      return res.status(404).json({ message: 'No documents found' });
    }

    const searchableFields = Object.entries(sampleDoc)
      .filter(([_, value]) => 
        typeof value === 'string' || 
        (typeof value === 'object' && value?.name)
      )
      .map(([key]) => key);

    await client.close();
    res.status(200).json(searchableFields);
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to database' });
  }
}