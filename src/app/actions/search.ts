"use server";
import clientPromise from "@/lib/mongoDB";
import { serializeContact } from "@/utils/serializers";
import { ObjectId } from "mongodb";

const databaseName = "CRM";
const searchResultLimit = 8;

async function buildAggregationPipeline(
  collection: string,
  query: Record<string, any>
): Promise<any[]> {
  const pipeline: any[] = [{ $match: query }];

  if (collection === 'contacts') {
    pipeline.push(
      {
        $lookup: {
          from: "bookings",
          let: { 
            bookingRefs: {
              $cond: {
                if: { $isArray: "$bookingRefs" },
                then: {
                  $map: {
                    input: "$bookingRefs",
                    as: "ref",
                    in: { $toObjectId: "$$ref" }
                  }
                },
                else: []
              }
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$bookingRefs"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                confirmationNumber: 1,
                status: 1
              }
            }
          ],
          as: "bookings"
        }
      }
    );
  }

  return pipeline;
}

export async function searchData(
  collection: string,
  searchField?: string,
  searchTerm?: string
): Promise<SearchResponse> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const coll = db.collection(collection);

    // Build search query
    let query = {};
    if (searchField && searchTerm) {
      if (searchField.includes(".")) {
        const [parent, child] = searchField.split(".");
        query = {
          [`${parent}.${child}`]: { $regex: searchTerm, $options: "i" }
        };
      } else {
        query = {
          [searchField]: { $regex: searchTerm, $options: "i" }
        };
      }
    }

    // Get pipeline for this collection
    const pipeline = await buildAggregationPipeline(collection, query);
    
    // Add limit to pipeline
    pipeline.push({ $limit: searchResultLimit });

    // Execute aggregation
    const results = await coll.aggregate(pipeline).toArray();

    // Use the existing serializer for contacts
    const serializedResults = collection === 'contacts' 
      ? results.map(serializeContact)
      : results;

    // Get searchable fields
    const searchableFields = await getSearchableFields(coll);

    return {
      success: true,
      total: serializedResults.length,
      searchableFields,
      results: serializedResults
    };

  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred"
    };
  }
}

async function getSearchableFields(collection: any): Promise<string[]> {
  const sample = await collection.findOne({});
  if (!sample) return [];

  const blacklist = ['_id', 'createdAt', 'updatedAt', 'documents', 'preferences', 'bookings', 'bookingRefs'];
  
  return Object.keys(sample).filter(key => 
    !blacklist.includes(key) && 
    typeof sample[key] !== 'object'
  );
}