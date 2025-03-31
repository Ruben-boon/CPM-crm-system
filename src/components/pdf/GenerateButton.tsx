import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { downloadBookingPDF, BookingPDFData } from './CreateConfirmation';
import { toast } from 'sonner';
import { searchDocuments } from '@/app/actions/crudActions';
import Button from '../Button';

interface BookingPDFButtonProps {
  booking: any;
}

export function BookingPDFButton({ booking }: BookingPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const prepareBookingPDFData = async () => {
    if (!booking?._id) {
      toast.error("No booking selected");
      return;
    }

    setIsLoading(true);

    try {
      // Fetch additional details for company
      let companyDetails = null;
      if (booking.companyId) {
        const companyResult = await searchDocuments("companies", booking.companyId, "_id");
        if (Array.isArray(companyResult) && companyResult.length > 0) {
          companyDetails = companyResult[0];
        }
      }

      // Fetch additional details for booker
      let bookerDetails = null;
      if (booking.bookerId) {
        const bookerResult = await searchDocuments("contacts", booking.bookerId, "_id");
        if (Array.isArray(bookerResult) && bookerResult.length > 0) {
          bookerDetails = bookerResult[0].general;
        }
      }

      // Fetch details for stays
      let staysDetails = [];
      if (booking.stayIds && booking.stayIds.length > 0) {
        for (const stayId of booking.stayIds) {
          const stayResult = await searchDocuments("stays", stayId, "_id");
          if (Array.isArray(stayResult) && stayResult.length > 0) {
            staysDetails.push({
              hotel: stayResult[0].hotelName,
              checkInDate: stayResult[0].checkInDate,
              checkOutDate: stayResult[0].checkOutDate,
              roomType: stayResult[0].roomType,
              roomNumber: stayResult[0].roomNumber
            });
          }
        }
      }

      // Prepare PDF data
      const pdfData: BookingPDFData = {
        confirmationNo: booking.confirmationNo,
        confirmationDate: booking.confirmationDate,
        travelPeriodStart: booking.travelPeriodStart,
        travelPeriodEnd: booking.travelPeriodEnd,
        company: companyDetails ? {
          name: companyDetails.name,
          address: companyDetails.address,
          city: companyDetails.city,
          country: companyDetails.country
        } : undefined,
        booker: bookerDetails ? {
          firstName: bookerDetails.firstName,
          lastName: bookerDetails.lastName,
          email: bookerDetails.email,
          phone: bookerDetails.phone
        } : undefined,
        stays: staysDetails,
        costCentre: booking.costCentre,
        status: booking.status,
        notes: booking.notes
      };

      // Download PDF
      downloadBookingPDF(pdfData);
      toast.success("Booking PDF generated successfully");
    } catch (error) {
      console.error("Error generating booking PDF:", error);
      toast.error("Failed to generate booking PDF");
    } finally {
      setIsLoading(false);
    }
  };

  // Only show the button if a booking is selected and has an ID
  if (!booking?._id) return null;

  return (
    <Button
      icon={FileText}
      onClick={prepareBookingPDFData}
      isLoading={isLoading}
      intent="secondary"
    >
      Generate PDF
    </Button>
  );
}