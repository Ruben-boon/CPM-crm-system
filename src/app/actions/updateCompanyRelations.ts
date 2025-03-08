"use server";
import clientPromise from "@/lib/mongoDB";
import { ObjectId } from "mongodb";

interface CompanyRelationshipResult {
  success: boolean;
  error?: string;
}

export async function updateCompanyRelationship(
  childId: string,
  parentId: string | null
): Promise<CompanyRelationshipResult> {
  try {
    console.log(
      `[Relationship] Starting update - Child: ${childId}, Parent: ${
        parentId || "none"
      }`
    );

    // Validate ObjectId format to prevent DB errors
    if (!ObjectId.isValid(childId)) {
      console.log(`[Relationship] Error: Invalid child company ID format`);
      return { success: false, error: "Invalid child company ID format" };
    }
    if (parentId && !ObjectId.isValid(parentId)) {
      console.log(`[Relationship] Error: Invalid parent company ID format`);
      return { success: false, error: "Invalid parent company ID format" };
    }

    // Prevent setting a company as its own parent
    if (childId === parentId) {
      console.log(`[Relationship] Error: A company cannot be its own parent`);
      return { success: false, error: "A company cannot be its own parent" };
    }

    const client = await clientPromise;
    const db = client.db("CRM");
    const companies = db.collection("companies");

    // Get the current state of both companies
    const childCompany = await companies.findOne({
      _id: new ObjectId(childId),
    });

    if (!childCompany) {
      console.log(`[Relationship] Error: Child company not found in database`);
      return { success: false, error: "Child company not found in database" };
    }

    console.log(
      `[Relationship] Found child company: ${
        childCompany.name
      }, current parent: ${childCompany.parentCompany || "none"}`
    );

    // Clean up ALL incorrect child references
    console.log(`[Relationship] Cleaning up any incorrect child references...`);
    try {
      const cleanupResult = await companies.updateMany(
        { 
          childCompany: childId,
          _id: { $ne: childCompany.parentCompany ? new ObjectId(childCompany.parentCompany) : null }
        },
        { 
          $set: { childCompany: "" } // Only store the ID, not the name
        }
      );
      
      console.log(`[Relationship] Cleanup result - Modified: ${cleanupResult.modifiedCount}`);
    } catch (e) {
      console.error(`[Relationship] Error during cleanup: ${e.message}`);
    }

    // Look for any inconsistencies (for logging purposes only now)
    const companiesListingThisAsChild = await companies
      .find({ childCompany: childId })
      .toArray();
    if (companiesListingThisAsChild.length > 0) {
      console.log(
        `[Relationship] Found ${companiesListingThisAsChild.length} companies listing this as child:`
      );
      companiesListingThisAsChild.forEach((company) => {
        console.log(
          `[Relationship] - ${company.name} (${company._id}) has childCompany=${childId}`
        );
      });

      // Check for inconsistencies
      const incorrectParents = companiesListingThisAsChild.filter(
        (company) =>
          company._id.toString() !== (childCompany.parentCompany || "")
      );

      if (incorrectParents.length > 0) {
        console.log(
          `[Relationship] INCONSISTENCY: ${incorrectParents.length} companies incorrectly list this as child!`
        );
        incorrectParents.forEach((company) => {
          console.log(
            `[Relationship] - ${company.name} (${company._id}) incorrectly lists this as child`
          );
        });
      }
    }

    // Handle removing relationship case
    if (!parentId) {
      console.log(`[Relationship] Removing parent relationship`);

      // If there was a previous parent, remove the child reference from it
      if (childCompany.parentCompany) {
        console.log(
          `[Relationship] Removing child reference from previous parent: ${childCompany.parentCompany}`
        );
        try {
          const parentObjId = new ObjectId(String(childCompany.parentCompany));
          const previousParentResult = await companies.updateOne(
            { _id: parentObjId },
            { $set: { childCompany: "" } } // Only store the ID, not the name
          );

          console.log(
            `[Relationship] Removed child reference from previous parent. Modified: ${previousParentResult.modifiedCount}`
          );
        } catch (e) {
          console.error(
            `[Relationship] Error updating previous parent: ${e.message}`
          );
        }
      }

      // Remove parent reference from child
      console.log(`[Relationship] Removing parent reference from child`);
      await companies.updateOne(
        { _id: new ObjectId(childId) },
        { $set: { parentCompany: "" } } // Only store the ID, not the name
      );

      console.log(`[Relationship] Successfully removed relationship`);
      return { success: true };
    }

    // Handle adding/changing relationship
    console.log(`[Relationship] Setting/changing parent to: ${parentId}`);
    const parentCompany = await companies.findOne({
      _id: new ObjectId(parentId),
    });

    if (!parentCompany) {
      console.log(`[Relationship] Error: Parent company not found in database`);
      return { success: false, error: "Parent company not found in database" };
    }

    console.log(
      `[Relationship] Found parent company: ${
        parentCompany.name
      }, current child: ${parentCompany.childCompany || "none"}`
    );

    // Check for circular references
    console.log(`[Relationship] Checking for circular references...`);
    let currentParent = parentCompany;
    const visitedParents = new Set([childId]);

    while (currentParent.parentCompany) {
      console.log(
        `[Relationship] - Checking parent: ${currentParent.name} with parent: ${currentParent.parentCompany}`
      );

      // If we've seen this parent before, we have a circular reference
      if (visitedParents.has(currentParent.parentCompany)) {
        console.log(`[Relationship] Error: Circular reference detected!`);
        return {
          success: false,
          error:
            "This would create a circular reference in the company hierarchy",
        };
      }

      visitedParents.add(currentParent._id.toString());

      // Get the next parent up the chain
      try {
        currentParent = await companies.findOne({
          _id: new ObjectId(currentParent.parentCompany),
        });
        if (!currentParent) {
          console.log(`[Relationship] End of parent chain reached`);
          break;
        }
      } catch (e) {
        console.log(
          `[Relationship] Error following parent chain: ${e.message}`
        );
        break;
      }
    }

    // If child had a different previous parent, remove the child reference from it
    if (childCompany.parentCompany && childCompany.parentCompany !== parentId) {
      console.log(
        `[Relationship] Child has previous parent ${childCompany.parentCompany} that needs updating`
      );

      try {
        const parentObjId = new ObjectId(String(childCompany.parentCompany));
        const previousParentResult = await companies.updateOne(
          { _id: parentObjId },
          { $set: { childCompany: "" } } // Only store the ID, not the name
        );

        console.log(
          `[Relationship] Removed child reference from previous parent. Modified: ${previousParentResult.modifiedCount}`
        );
      } catch (e) {
        console.error(
          `[Relationship] Error updating previous parent: ${e.message}`
        );
      }
    }

    // If parent had a different previous child, remove the parent reference from it
    if (parentCompany.childCompany && parentCompany.childCompany !== childId) {
      console.log(
        `[Relationship] Parent has previous child ${parentCompany.childCompany} that needs updating`
      );
      try {
        const childObjId = new ObjectId(String(parentCompany.childCompany));
        const previousChildResult = await companies.updateOne(
          { _id: childObjId },
          { $set: { parentCompany: "" } } // Only store the ID, not the name
        );

        console.log(
          `[Relationship] Removed parent reference from previous child. Modified: ${previousChildResult.modifiedCount}`
        );
      } catch (e) {
        console.error(
          `[Relationship] Error updating previous child: ${e.message}`
        );
      }
    }

    // Update the child with parent reference
    console.log(`[Relationship] Updating child with parent reference`);
    const childUpdateResult = await companies.updateOne(
      { _id: new ObjectId(childId) },
      {
        $set: {
          parentCompany: parentId
        },
      }
    );
    console.log(
      `[Relationship] Child update result - Modified: ${childUpdateResult.modifiedCount}`
    );

    // Update the parent with child reference
    console.log(`[Relationship] Updating parent with child reference`);
    const parentUpdateCheck = await companies.findOne({ 
      _id: new ObjectId(parentId),
      childCompany: childId
    });

    if (parentUpdateCheck) {
      console.log(`[Relationship] Parent already has correct child reference, no update needed`);
    } else {
      const parentUpdateResult = await companies.updateOne(
        { _id: new ObjectId(parentId) },
        {
          $set: {
            childCompany: childId
          },
        }
      );
      console.log(`[Relationship] Parent update result - Modified: ${parentUpdateResult.modifiedCount}`);
    }

    console.log(`[Relationship] Successfully updated relationship`);
    return { success: true };
  } catch (error) {
    console.error(`[Relationship] Error updating company relationship:`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update relationship",
    };
  }
}