"use client";
import { useState } from "react";
import { FileDown } from "lucide-react";
import Button from "@/components/common/Button";
import { PDFGenerator } from "./PDFGenerator";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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

interface DownloadPDFButtonProps {
  bookingData: BookingData;
  stays: Stay[];
}

export function DownloadPDFButton({ bookingData, stays }: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create a hidden div to render our PDF content
      const pdfContent = document.createElement("div");
      pdfContent.style.position = "absolute";
      pdfContent.style.left = "-9999px";
      pdfContent.style.top = "-9999px";
      document.body.appendChild(pdfContent);

      // Render our PDF generator component into the hidden div
      const root = document.createElement("div");
      root.style.width = "210mm"; // A4 width
      pdfContent.appendChild(root);
      
      // We need to manually render our PDF content
      const pdfHTML = PDFGenerator({ bookingData, stays });
      root.innerHTML = pdfHTML;
      
      // Use html2canvas to capture the rendered component as an image
      const canvas = await html2canvas(root, {
        scale: 2, // Better quality
        useCORS: true,
        logging: false,
        imageTimeout: 15000,
        backgroundColor: "white", // White background for text content
      });
      
      // Create PDF with jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true // Enable compression
      });
      
      // Calculate the height based on the canvas aspect ratio and A4 width (210mm)
      const imgHeight = (canvas.height * 210) / canvas.width;
      
      // If the image is too tall for one page, split it across multiple pages
      const pageHeight = 297; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;
      
      // Add the first page with moderate quality
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.8), // Better quality JPEG
        'JPEG', 
        0, 
        position, 
        210, 
        imgHeight,
        undefined, // alias
        'FAST' // compression option
      );
      
      heightLeft -= pageHeight;
      
      // Add subsequent pages if needed (with the same quality reduction)
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.8), // Better quality JPEG
          'JPEG', 
          0, 
          position, 
          210, 
          imgHeight,
          undefined, // alias
          'FAST' // compression option
        );
        heightLeft -= pageHeight;
        page++;
      }
      
      // Save the PDF with optimization
      pdf.save(`Booking_${bookingData.confirmationNo || bookingData._id}.pdf`);
      
      // Clean up
      document.body.removeChild(pdfContent);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      icon={FileDown}
      onClick={handleDownloadPDF}
      size="md"
      intent="primary"
      disabled={isGenerating}
    >
      {isGenerating ? "Generating PDF..." : "Download PDF"}
    </Button>
  );
}