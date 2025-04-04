"use client";

// Define types for the booking and stay data
interface Stay {
  _id: string;
  checkInDate?: string;
  checkOutDate?: string;
  status?: string;
  hotelName?: string;
  hotelId?: string;
  roomType?: string;
  roomNumber?: string;
  roomPrice?: string;
  roomCurrency?: string;
  reference?: string;
  guestIds?: string[];
  guestNames?: string[];
  specialRequests?: string;
  remarks?: string;
  paymentInstructions?: string;
  cancellations?: string;
}

interface BookingData {
  _id: string;
  confirmationNo?: string;
  confirmationDate?: string;
  travelPeriodStart?: string;
  travelPeriodEnd?: string;
  status?: string;
  costCentre?: string;
  notes?: string;
  companyId?: string;
  bookerId?: string;
  stayIds?: string[];
}

interface PDFGeneratorProps {
  bookingData: BookingData;
  stays: Stay[];
}

// This component returns HTML that will be rendered to PDF
export function PDFGenerator({ bookingData, stays }: PDFGeneratorProps) {
  if (!bookingData) return "";

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "checked_in": return "Checked In";
      case "checked_out": return "Checked Out";
      case "cancelled": return "Cancelled";
      case "no_show": return "No Show";
      case "pending": return "Pending";
      case "completed": return "Completed";
      default: return status || "-";
    }
  };

  // Get cost center label
  const getCostCenterLabel = (code?: string): string => {
    const costCenters = {
      "CC1": "Cost Centre 1",
      "CC2": "Cost Centre 2",
      "CC3": "Cost Centre 3",
    };
    return costCenters[code as keyof typeof costCenters] || code || "-";
  };

  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 0;">
      <div style="text-align: center; padding: 20px 0; background-color: #f5f5f5; border-bottom: 1px solid #ddd;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 600;">Booking Details</h1>
        <p style="margin: 8px 0 0; font-size: 13px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>

      <div style="margin: 20px 0; background: white; border: 1px solid #ddd;">
        <div style="background-color: #f5f5f5; padding: 10px 15px; border-bottom: 1px solid #ddd;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 500;">Booking Information</h2>
        </div>
        
        <div style="padding: 15px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 5px; font-weight: 600; width: 180px; vertical-align: top;">Confirmation Number:</td>
              <td style="padding: 8px 5px; vertical-align: top;">${bookingData.confirmationNo || "-"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 5px; font-weight: 600; vertical-align: top;">Confirmation Date:</td>
              <td style="padding: 8px 5px; vertical-align: top;">${formatDate(bookingData.confirmationDate) || "-"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 5px; font-weight: 600; vertical-align: top;">Travel Period:</td>
              <td style="padding: 8px 5px; vertical-align: top;">${formatDate(bookingData.travelPeriodStart) || "-"} to ${formatDate(bookingData.travelPeriodEnd) || "-"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 5px; font-weight: 600; vertical-align: top;">Status:</td>
              <td style="padding: 8px 5px; vertical-align: top;">
                ${getStatusLabel(bookingData.status)}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 5px; font-weight: 600; vertical-align: top;">Cost Centre:</td>
              <td style="padding: 8px 5px; vertical-align: top;">${getCostCenterLabel(bookingData.costCentre)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 5px; font-weight: 600; vertical-align: top;">Notes:</td>
              <td style="padding: 8px 5px; vertical-align: top;">${bookingData.notes || "-"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 5px; font-weight: 600; vertical-align: top;">Company ID:</td>
              <td style="padding: 8px 5px; vertical-align: top; font-family: monospace; font-size: 13px;">
                ${bookingData.companyId || "-"}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 5px; font-weight: 600; vertical-align: top;">Booker ID:</td>
              <td style="padding: 8px 5px; vertical-align: top; font-family: monospace; font-size: 13px;">
                ${bookingData.bookerId || "-"}
              </td>
            </tr>
          </table>
        </div>
      </div>

      <div style="margin: 20px 0;">
        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">
          Rooms (${stays?.length || 0})
        </h2>
        
        ${stays && stays.length > 0 
          ? stays.map((stay, index) => `
            <div style="margin-bottom: 20px; background: white; border: 1px solid #ddd;">
              <div style="background-color: #f5f5f5; padding: 10px 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 500;">Stay #${index + 1}</h3>
                <span style="font-size: 13px;">
                  ${getStatusLabel(stay.status)}
                </span>
              </div>
              
              <div style="padding: 15px; font-size: 13px;">
                <div style="display: flex; margin-bottom: 10px; background-color: #f9f9f9; padding: 10px; border: 1px solid #eee;">
                  <div style="flex: 1; text-align: center; border-right: 1px solid #eee;">
                    <div style="font-size: 12px; margin-bottom: 4px;">Check-in</div>
                    <div style="font-weight: 600; font-size: 14px;">${formatDate(stay.checkInDate)}</div>
                  </div>
                  <div style="flex: 1; text-align: center;">
                    <div style="font-size: 12px; margin-bottom: 4px;">Check-out</div>
                    <div style="font-weight: 600; font-size: 14px;">${formatDate(stay.checkOutDate)}</div>
                  </div>
                </div>
              
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; width: 150px; vertical-align: top;">Stay ID:</td>
                    <td style="padding: 6px 5px; vertical-align: top; font-family: monospace; font-size: 12px;">${stay._id || "-"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Hotel:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.hotelName || "Unknown hotel"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Hotel ID:</td>
                    <td style="padding: 6px 5px; vertical-align: top; font-family: monospace; font-size: 12px;">${stay.hotelId || "-"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Room Type:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.roomType || "-"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Room Number:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.roomNumber || "-"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Room Price:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.roomPrice ? `${stay.roomPrice} ${stay.roomCurrency || ""}` : "-"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Reference:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.reference || "-"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Guest IDs:</td>
                    <td style="padding: 6px 5px; vertical-align: top; font-family: monospace; font-size: 12px;">${stay.guestIds?.join(", ") || "-"}</td>
                  </tr>
                  ${stay.specialRequests ? `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Special Requests:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.specialRequests}</td>
                  </tr>
                  ` : ''}
                  ${stay.remarks ? `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Remarks:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.remarks}</td>
                  </tr>
                  ` : ''}
                  ${stay.paymentInstructions ? `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Payment Instructions:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.paymentInstructions}</td>
                  </tr>
                  ` : ''}
                  ${stay.cancellations ? `
                  <tr>
                    <td style="padding: 6px 5px; font-weight: 600; vertical-align: top;">Cancellation Policy:</td>
                    <td style="padding: 6px 5px; vertical-align: top;">${stay.cancellations}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </div>
          `).join("")
          : '<p style="font-style: italic; text-align: center; padding: 20px; background: white; border: 1px solid #ddd;">No stays associated with this booking</p>'
        }
      </div>

      <div style="text-align: center; margin: 30px 0 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px;">
        <p style="margin: 3px 0;">Booking # ${bookingData.confirmationNo || bookingData._id} | Confidential information</p>
      </div>
    </div>
  `;
}