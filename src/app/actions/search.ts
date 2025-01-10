// search.ts
'use server';
import clientPromise from "@/lib/mongoDB";
import { serializeContact, type SerializedContact } from "@/utils/serializers";

interface SearchResponse {
  success: boolean;
  total?: number;
  searchableFields?: string[];
  results?: SerializedContact[];
  error?: string;
}

export async function searchData(
  collection: string,
  searchField?: string,
  searchTerm?: string
): Promise<SearchResponse> {
  try {
    const client = await clientPromise;
    const db = client.db('CRM');
    const coll = db.collection(collection);

    let query = {};
    
    if (searchField && searchTerm) {
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
    }

    // Get the results and serialize them using the existing serializer to
    const results = await coll.find(query).toArray();
    const serializedResults = results.map(serializeContact);

    // Get searchable fields from the first document
    const firstDoc = await coll.findOne({});
    const searchableFields = firstDoc ? getSearchableFields(firstDoc) : [];

    return {
      success: true,
      total: serializedResults.length,
      searchableFields,
      results: serializedResults
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    };
  }
}

function getSearchableFields(doc: any, prefix = ''): string[] {
  return Object.entries(doc).reduce((fields: string[], [key, value]) => {
    if (key === '_id' || value === null) return fields;

    if (typeof value === 'object' && !Array.isArray(value)) {
      const nestedFields = getSearchableFields(value, `${prefix}${key}.`);
      return [...fields, ...nestedFields];
    }

    if (typeof value === 'string') {
      return [...fields, `${prefix}${key}`];
    }

    return fields;
  }, []);
}