export interface Booking {
    _id: string;
    information: {
      confirmationNo: string;
      remarks: string;
      amenities: string;
      phone: string;
    };
    trip?: Record<string, unknown>;
    roomType: string;
  }
  
  // Define searchable fields for Booking
  export const bookingSearchableFields = ["confirmationNo", "remarks", "amenities", "phone"];
  
  // Projection for MongoDB queries specific to Bookings
  export const bookingProjection = {
    "information.confirmationNo": 1,
    "information.remarks": 1,
    "information.amenities": 1,
    "information.phone": 1,
    roomType: 1,
  };
  
  // Function to build a query for searching Bookings
  export function buildBookingQuery(searchField: string, searchTerm: string): Record<string, any> {
    if (searchField.startsWith("information.")) {
      return {
        [searchField]: { $regex: searchTerm, $options: "i" },
      };
    }
    return {
      [`information.${searchField}`]: { $regex: searchTerm, $options: "i" },
    };
  }
  