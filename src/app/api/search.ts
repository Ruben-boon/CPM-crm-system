import { NextApiRequest, NextApiResponse } from 'next';
import { MockMongoClient } from '../../mockMongoDB';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { collection, searchField, searchTerm } = req.body;

  try {
    const client = await MockMongoClient.connect('mock_uri');
    const db = client.db('mock_db');

    let query = {};
    if (searchField.includes('.')) {
      const [parent, child] = searchField.split('.');
      query = {
        [`${parent}.${child}`]: { 
          $regex: searchTerm, 
          $options: 'i' 
        }
      };
    } else {
      query = {
        [searchField]: { 
          $regex: searchTerm, 
          $options: 'i' 
        }
      };
    }

    const results = await db.collection(collection)
      .find(query)
      .toArray();

    await client.close();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error performing search' });
  }
}