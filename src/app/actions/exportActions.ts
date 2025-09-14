"use server";

import clientPromise from "@/lib/mongoDB";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// MongoDB aggregation pipeline for stays export
const STAYS_EXPORT_PIPELINE = [
  // Stage 1: Project to exclude unwanted fields (but keep _id and guestIds for lookups)
  {
    $project: {
      roomType: 0,
      status: 0,
      cancellations: 0,
      confirmationNo: 0,
      bookingId: 0,
      reference: 0,
      createdBy: 0,
      updatedBy: 0,
      updatedAt: 0,
      paymentType: 0,
      roomNumber: 0,
      summaryGuestNames: 0,  // Remove the entire summaryGuestNames array
      taxAmount: 0,
      version: 0,
      guestNames: 0,  // Remove guestNames completely
      hotelId: 0
      // Keep _id and guestIds for lookups
    }
  },
  
  // Stage 2: Lookup guest information from contacts collection
  {
    $lookup: {
      from: "contacts",
      let: { guestIds: "$guestIds" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$_id", { $map: { input: "$$guestIds", as: "id", in: { $toObjectId: "$$id" } } }]
            }
          }
        },
        {
          $project: {
            firstName: "$general.firstName",
            lastName: "$general.lastName",
            fullName: { $concat: ["$general.firstName", " ", "$general.lastName"] }
          }
        }
      ],
      as: "guestDetails"
    }
  },
  
  // Stage 3: Lookup booking information to get confirmation number and other booking details
  {
    $lookup: {
      from: "bookings",
      let: { stayIdString: { $toString: "$_id" } },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$$stayIdString", "$staySummaries.stayId"]
            }
          }
        },
        {
          $project: {
            confirmationNo: 1,
            salesInvoice: 1,
            bookerName: 1,
            costCentre: 1
          }
        }
      ],
      as: "bookingInfo"
    }
  },
  
  // Stage 4: Add computed fields and clean up the structure
  {
    $addFields: {
      // Extract booking details from booking lookup
      bookingConfirmationNo: {
        $cond: {
          if: { $gt: [{ $size: "$bookingInfo" }, 0] },
          then: { $arrayElemAt: ["$bookingInfo.confirmationNo", 0] },
          else: null
        }
      },
      
      bookingSalesInvoice: {
        $cond: {
          if: { $gt: [{ $size: "$bookingInfo" }, 0] },
          then: { $arrayElemAt: ["$bookingInfo.salesInvoice", 0] },
          else: null
        }
      },
      
      bookingBookerName: {
        $cond: {
          if: { $gt: [{ $size: "$bookingInfo" }, 0] },
          then: { $arrayElemAt: ["$bookingInfo.bookerName", 0] },
          else: null
        }
      },
      
      bookingCostCentre: {
        $cond: {
          if: { $gt: [{ $size: "$bookingInfo" }, 0] },
          then: { $arrayElemAt: ["$bookingInfo.costCentre", 0] },
          else: null
        }
      },
      
      // Create a clean guest names array from the lookup
      guestName: {
        $map: {
          input: "$guestDetails",
          as: "guest",
          in: "$$guest.fullName"
        }
      }
    }
  },
  
  // Stage 5: Final projection with ordered fields
  {
    $project: {
      // Stay basic info
      checkInDate: 1,
      checkOutDate: 1,
      hotelName: 1,
      hotelConfirmationNo: 1,
      
      // Guest information
      guestName: 1,
      
      // Pricing information
      roomPrice: 1,
      roomCurrency: 1,
      taxCurrency: 1,
      
      // Payment details
      prepaid: 1,
      prepaidDetails: 1,
      purchaseInvoice: 1,
      commissionInvoice: 1,
      
      // Booking information
      bookingConfirmationNo: 1,
      bookingSalesInvoice: 1,
      bookingBookerName: 1,
      bookingCostCentre: 1,
      
      // Administrative
      adminRemarks: 1,
      paymentInstructions: 1
    }
  }
];

interface ExportResult {
  success: boolean;
  data?: string;
  error?: string;
  recordCount?: number;
}

export async function exportStaysToCSV(): Promise<ExportResult> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    console.log("🔄 [EXPORT] Starting stays CSV export...");
    
    const client = await clientPromise;
    const db = client.db("CRM");
    const staysCollection = db.collection("stays");

    // Run the aggregation pipeline
    const results = await staysCollection.aggregate(STAYS_EXPORT_PIPELINE).toArray();
    
    console.log(`📊 [EXPORT] Found ${results.length} stays to export`);

    if (results.length === 0) {
      return {
        success: true,
        data: "",
        recordCount: 0
      };
    }

    // Convert to CSV
    const csvData = convertToCSV(results);
    
    console.log(`✅ [EXPORT] Successfully exported ${results.length} stays to CSV`);
    
    return {
      success: true,
      data: csvData,
      recordCount: results.length
    };

  } catch (error) {
    console.error("❌ [EXPORT] Error exporting stays to CSV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed"
    };
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  // Define the order of columns for better readability
  const columnOrder = [
    'checkInDate',
    'checkOutDate', 
    'hotelName',
    'hotelConfirmationNo',
    'guestName',
    'roomPrice',
    'roomCurrency',
    'taxCurrency',
    'prepaid',
    'prepaidDetails',
    'purchaseInvoice',
    'commissionInvoice',
    'bookingConfirmationNo',
    'bookingSalesInvoice',
    'bookingBookerName',
    'bookingCostCentre',
    'adminRemarks',
    'paymentInstructions'
  ];

  // Use ordered columns first, then add any remaining columns
  const orderedKeys = columnOrder.filter(key => allKeys.has(key));
  const remainingKeys = Array.from(allKeys).filter(key => !columnOrder.includes(key));
  const headers = [...orderedKeys, ...remainingKeys];

  // Create CSV header
  const csvHeaders = headers.map(header => escapeCSVField(header)).join(',');
  
  // Create CSV rows
  const csvRows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      
      // Handle arrays (like guestNamesFromContacts)
      if (Array.isArray(value)) {
        return escapeCSVField(value.join('; '));
      }
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convert to string and escape
      return escapeCSVField(String(value));
    }).join(',');
  });

  // Combine header and rows
  return [csvHeaders, ...csvRows].join('\n');
}

function escapeCSVField(field: string): string {
  // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('\n') || field.includes('\r') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
