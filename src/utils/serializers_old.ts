//i hate this
// export interface SerializedContact {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone?: string;
//   position?: string;
//   company?: any; 
//   preferences?: any;
//   documents?: any[];
//   createdAt?: string;
//   updatedAt?: string;
//   // Updated reference fields
//   bookingRefs?: string[];
//   bookings?: Array<{
//     id: string;
//     confirmationNumber: string;
//     status: string;
//   }>;
//   // Keep old fields for backward compatibility
//   bookingRef?: string;
//   booking?: {
//     confirmationNumber: string;
//     status: string;
//   };
// }

// // Helper function to handle Buffer objects
// function serializeBufferValues(obj: any): any {
//   if (!obj) return obj;

//   if (Buffer.isBuffer(obj)) {
//     return obj.toString("utf8");
//   }

//   if (Array.isArray(obj)) {
//     return obj.map((item) => serializeBufferValues(item));
//   }

//   if (typeof obj === "object") {
//     const result: any = {};
//     for (const [key, value] of Object.entries(obj)) {
//       result[key] = serializeBufferValues(value);
//     }
//     return result;
//   }

//   return obj;
// }

// export const serializeContact = (doc: any): SerializedContact => {
//   return {
//     id: doc._id.toString(),
//     firstName: doc.firstName,
//     lastName: doc.lastName,
//     email: doc.email,
//     phone: doc.phone,
//     position: doc.position,
//     company: serializeBufferValues(doc.company),
//     preferences: doc.preferences,
//     documents: serializeBufferValues(doc.documents),
//     createdAt: doc.createdAt?.toISOString(),
//     updatedAt: doc.updatedAt?.toISOString(),
//     // Handle array of bookingRefs
//     // bookingRefs: doc.bookingRefs?.map((ref: any) => 
//     //   ref.toString()
//     // ) || undefined,
//     // Handle array of bookings
//     bookings: doc.bookings?.map((booking: any) => ({
//       id: booking._id.toString(),
//       confirmationNumber: booking.confirmationNumber,
//       status: booking.status
//     })) || undefined,
//     // Keep old reference fields for backward compatibility
//     bookingRef: doc.bookingRef?.toString(),
//     booking: doc.booking ? {
//       confirmationNumber: doc.booking.confirmationNumber,
//       status: doc.booking.status
//     } : undefined,
//   };
// };