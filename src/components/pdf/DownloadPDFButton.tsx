import { useState, useEffect } from "react";
import { FileDown, Mail } from "lucide-react";
import Button from "@/components/common/Button";
import { jsPDF } from "jspdf";
import { searchDocuments } from "@/app/actions/crudActions";

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
  disabled?: boolean;
}

export function DownloadPDFButton({
  bookingData,
  stays,
  disabled = false,
}: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [bookerData, setBookerData] = useState<any>(null);

  // Fetch company data when booking data changes
  useEffect(() => {
    async function fetchCompanyData() {
      if (bookingData?.companyId) {
        try {
          const result = await searchDocuments(
            "companies",
            bookingData.companyId,
            "_id"
          );
          if (Array.isArray(result) && result.length > 0) {
            setCompanyData(result[0]);
          } else {
            setCompanyData(null);
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
          setCompanyData(null);
        }
      } else {
        setCompanyData(null);
      }
    }

    fetchCompanyData();
  }, [bookingData?.companyId]);

  // Fetch booker data when booking data changes
  useEffect(() => {
    async function fetchBookerData() {
      if (bookingData?.bookerId) {
        try {
          const result = await searchDocuments(
            "contacts",
            bookingData.bookerId,
            "_id"
          );
          if (Array.isArray(result) && result.length > 0) {
            setBookerData(result[0]);
          } else {
            setBookerData(null);
          }
        } catch (error) {
          console.error("Error fetching booker data:", error);
          setBookerData(null);
        }
      } else {
        setBookerData(null);
      }
    }

    fetchBookerData();
  }, [bookingData?.bookerId]);

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to calculate number of nights between dates
  const calculateNights = (
    checkInDate?: string,
    checkOutDate?: string
  ): string => {
    if (!checkInDate || !checkOutDate) return "-";

    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      // Calculate difference in milliseconds and convert to days
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays.toString();
    } catch (error) {
      console.error("Error calculating nights:", error);
      return "-";
    }
  };

  // Helper function to get booker name
  const getBookerName = (): string => {
    if (!bookerData) return bookingData.bookerId || "-";

    const firstName = bookerData.general?.firstName || "";
    const lastName = bookerData.general?.lastName || "";

    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }

    return bookingData.bookerId || "-";
  };

  // Helper function to get status label
  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "checked_in":
        return "Checked In";
      case "checked_out":
        return "Checked Out";
      case "cancelled":
        return "Cancelled";
      case "no_show":
        return "No Show";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return status || "-";
    }
  };

  // Get cost center label
  const getCostCenterLabel = (code?: string): string => {
    const costCenters: Record<string, string> = {
      CC1: "Cost Centre 1",
      CC2: "Cost Centre 2",
      CC3: "Cost Centre 3",
    };
    return costCenters[code as keyof typeof costCenters] || code || "-";
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);

    try {
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Define page margins and content area
      const pageMargins = {
        top: 16,
        right: 16,
        bottom: 16, // Increased bottom margin to accommodate larger footer
        left: 16,
      };

      // Available content area height
      const contentHeight = 297 - pageMargins.top - pageMargins.bottom - 10; // A4 height minus margins and footer space

      // Current y position on the page
      let y = pageMargins.top;

      // Current page number
      let currentPage = 1;

      // Function to add footer to current page
      const addFooter = (page: number, totalPages: number) => {
        pdf.setPage(page);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");

        // Draw a light gray line above the footer
        pdf.setDrawColor(200, 200, 200);
        pdf.line(16, 255, 190, 255);

        // Add the booking reference
        pdf.text(
          `VAT: NL860948535B01  -  Rabobank: NL91RABO0353212180  -  CoC: 77251563`,
          16,
          260,
          { align: "left" }
        );

        // Add page numbers
        pdf.text(`Page ${page} of ${totalPages}`, 190, 260, { align: "right" });

        // Add corporate information in the footer
        // Company name - bold
        pdf.setFont("helvetica", "bold");
        pdf.text("Corporate Meeting Partner B.V", 16, 268);
        // pdf.text("CoC: 77251563", 16, 268);

        // Rest of the information - normal
        pdf.setFont("helvetica", "normal");
        const lineSpacing = 4;

        // Left column
        pdf.text("Dorpsstraat 20", 16, 268 + lineSpacing);
        pdf.text("2361 BB WARMOND, The Netherlands", 16, 268 + lineSpacing * 2);

        // Middle column
        pdf.text("Tel. +31 (0)85 0030 395", 80, 268);
        pdf.text("www.corporatemeetingpartner.com", 80, 268 + lineSpacing);
        pdf.text(
          "reservations@corporatemeetingpartner.com",
          80,
          268 + lineSpacing * 2
        );
      };

      // Function to check if we need a new page - FIXED to remove footer duplication
      const checkNewPage = (requiredHeight: number) => {
        if (y + requiredHeight > pageMargins.top + contentHeight) {
          // No longer adding footer here to prevent duplication
          pdf.addPage();
          currentPage++;
          y = pageMargins.top;
          return true;
        }
        return false;
      };

      // Load the logo (only added to the first page)
      const logoUrl = "/cmp_logo.png";

      // Create an Image object to get dimensions
      const img = new Image();
      img.src = logoUrl;

      // Wait for image to load to get dimensions
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Calculate height maintaining aspect ratio (max width 40mm)
      const maxWidth = 40;
      const aspectRatio = img.width / img.height;
      const calculatedHeight = maxWidth / aspectRatio;

      // Add the logo to the top left
      pdf.addImage(
        logoUrl,
        "PNG",
        pageMargins.left,
        y,
        maxWidth,
        calculatedHeight
      );

      // Set font and text color
      pdf.setFont("helvetica");
      pdf.setTextColor(0, 0, 0);

      // Calculate appropriate vertical spacing based on logo height
      y = Math.max(y + calculatedHeight + 15, 55);

      // Add company info to the top right if available
      if (companyData) {
        pdf.setFontSize(10);
        let companyY = 28; // Starting Y position at top margin
        const rightMargin = 190; // Right side of the page

        if (companyData.name) {
          pdf.setFont("helvetica", "bold");
          pdf.text(companyData.name, rightMargin, companyY, { align: "right" });
          companyY += 5;
        }

        pdf.setFont("helvetica", "normal");

        if (companyData.address) {
          pdf.text(companyData.address, rightMargin, companyY, {
            align: "right",
          });
          companyY += 4;
        }

        if (companyData.postal_code) {
          pdf.text(companyData.postal_code, rightMargin, companyY, {
            align: "right",
          });
        }
      }

      // Confirmation section with room count on the same line
      const confirmationNumber = bookingData.confirmationNo || bookingData._id;
      const roomCount = stays?.length || 0;

      // Add confirmation number on the left with "Confirmation" in bold
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Confirmation ", pageMargins.left, y);

      // Calculate width of the bold "Confirmation " text
      const confirmationTextWidth = pdf.getTextWidth("Confirmation ");

      // Add the confirmation number in normal font
      pdf.setFont("helvetica", "normal");
      pdf.text(confirmationNumber, pageMargins.left + confirmationTextWidth, y);

      // Add room count on the right of the same line
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Rooms (${roomCount})`, 190, y, { align: "right" });

      y += 8; // Move y down after the confirmation header

      // Function to add key-value row and update y position
      const addRow = (
        key: string,
        value: string,
        indent = 0,
        isLink = false,
        url = ""
      ): number => {
        pdf.setFontSize(10);

        // Calculate available width for the value
        const valueStartX = 75;
        const maxValueWidth = 190 - valueStartX; // Right margin (190) minus value start position

        // Split text into lines if it would exceed the available width
        pdf.setFont("helvetica", "normal");
        const splitValue = pdf.splitTextToSize(value, maxValueWidth);
        const lineCount = splitValue.length;

        // Calculate row height based on number of lines (6mm per line)
        const rowHeight = 6 * lineCount;

        // Check if we need a new page for this row
        if (checkNewPage(rowHeight)) {
          // We're now on a new page with reset y position
        }

        // Add the key in bold
        pdf.setFont("helvetica", "bold");
        pdf.text(key, pageMargins.left + indent, y);

        // Add the value with potential line wrapping
        pdf.setFont("helvetica", "normal");

        if (isLink) {
          // Keep text color black for hyperlinks
          pdf.setTextColor(0, 0, 0);

          if (lineCount === 1) {
            // Add text and link for single line
            pdf.textWithLink(value, valueStartX, y, { url: url });
            // Add black underline
            pdf.setDrawColor(0, 0, 0);
            pdf.line(
              valueStartX,
              y + 1,
              valueStartX + pdf.getTextWidth(value),
              y + 1
            );
          } else {
            // For multiline links - handle each line
            splitValue.forEach((line: string, index: number) => {
              const yPos = y + index * 6;
              pdf.textWithLink(line, valueStartX, yPos, { url: url });
              // Add black underline for each line
              const lineWidth = pdf.getTextWidth(line);
              pdf.setDrawColor(0, 0, 0);
              pdf.line(
                valueStartX,
                yPos + 1,
                valueStartX + lineWidth,
                yPos + 1
              );
            });
          }
        } else {
          // Regular text (non-link)
          if (lineCount === 1) {
            // Single line - simple case
            pdf.text(value, valueStartX, y);
          } else {
            // Multiple lines - render each line
            splitValue.forEach((line: string, index: number) => {
              pdf.text(line, valueStartX, y + index * 6);
            });
          }
        }

        // Return height used
        return rowHeight;
      };

      // Add booking details
      y += addRow(
        "Confirmation Date:",
        formatDate(bookingData.confirmationDate)
      );
      y += addRow("By order of:", getBookerName());
      y += addRow("Status:", getStatusLabel(bookingData.status));
      y += addRow("Cost centre:", getCostCenterLabel(bookingData.costCentre));
      y += addRow(
        "Travel Period:",
        `${formatDate(bookingData.travelPeriodStart)} to ${formatDate(
          bookingData.travelPeriodEnd
        )}`
      );
      y += addRow(
        "Guarantee:",
        "Reservation is guaranteed for payment and (late) arrival."
      );
      y += addRow(
        "Privacy Policy:",
        "Privacy Policy confirmations",
        0, // No indent
        true, // This is a link
        "https://www.corporatemeetingpartner.com/privacy-policy"
      );

      y += 5; // Add some extra space

      // If no stays, show message
      if (!stays || stays.length === 0) {
        checkNewPage(10); // Check if we need a new page for this message

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.text("No stays associated with this booking", 105, y, {
          align: "center",
        });
        y += 10;
      } else {
        // Process each stay
        for (let i = 0; i < stays.length; i++) {
          const stay = stays[i];

          // Estimate height needed for this stay
          let stayHeight = 80; // Base height for a stay

          // Function to estimate text height
          const estimateTextHeight = (
            text?: string,
            maxWidth = 115
          ): number => {
            if (!text) return 0;
            pdf.setFontSize(10);
            const lines = pdf.splitTextToSize(text, maxWidth);
            return lines.length * 6; // 6mm per line
          };

          // Add more height for optional fields with potential wrapping
          if (stay.specialRequests)
            stayHeight += estimateTextHeight(stay.specialRequests);
          if (stay.remarks) stayHeight += estimateTextHeight(stay.remarks);
          if (stay.paymentInstructions)
            stayHeight += estimateTextHeight(stay.paymentInstructions);
          if (stay.cancellations)
            stayHeight += estimateTextHeight(stay.cancellations);

          // Check if we need a new page for this stay
          checkNewPage(stayHeight);
          const nights = calculateNights(stay.checkInDate, stay.checkOutDate);

          // Stay header
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Room ${i + 1}: `, pageMargins.left, y);
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");

          // y += addRow("Number of Nights:", nights);

          const nightsText =
            parseInt(nights) === 1 ? `${nights} Night ` : `${nights} Nights `;
          pdf.text(nightsText, 190, y, { align: "right" });
          // pdf.text(getStatusLabel(stay.status), 190, y, { align: "right" });
          y += 3;
          // Draw a line above the check-in/check-out section
          pdf.setDrawColor(220, 220, 220);
          pdf.line(pageMargins.left, y, 190, y);

          // Add some space after the top line
          y += 3;

          // Check-in
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          pdf.text("Check-in: ", 30, y + 4);
          const checkInTextWidth = pdf.getTextWidth("Check-in: ");
          pdf.setFont("helvetica", "bold");
          pdf.text(formatDate(stay.checkInDate), 30 + checkInTextWidth, y + 4);

          // Line separator between check-in and check-out
          pdf.setDrawColor(220, 220, 220);
          pdf.line(105, y - 2, 105, y + 8);

          // Check-out
          pdf.setFont("helvetica", "normal");
          pdf.text("Check-out: ", 120, y + 4);
          const checkOutTextWidth = pdf.getTextWidth("Check-out: ");
          pdf.setFont("helvetica", "bold");
          pdf.text(
            formatDate(stay.checkOutDate),
            120 + checkOutTextWidth,
            y + 4
          );

          // Add some space before the bottom line
          y += 8;

          // Draw a line below the check-in/check-out section
          pdf.setDrawColor(220, 220, 220);
          pdf.line(pageMargins.left, y, 190, y);

          y += 5;

          // Stay details
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");

          y += addRow("Hotel:", stay.hotelName || "Unknown hotel");
          // y += addRow("Hotel ID:", stay.hotelId || "-");
          y += addRow("Room Type:", stay.roomType || "-");

          // Add number of nights row
          // const nights = calculateNights(stay.checkInDate, stay.checkOutDate);
          // y += addRow("Number of Nights:", nights);

          y += addRow(
            "Room Price:",
            stay.roomPrice
              ? `${stay.roomPrice} ${stay.roomCurrency || ""}`
              : "-"
          );
          // y += addRow("Reference:", stay.reference || "-");
          y += addRow("Guest IDs:", stay.guestIds?.join(", ") || "-");

          if (stay.specialRequests) {
            y += addRow("Special Requests:", stay.specialRequests);
          }

          if (stay.remarks) {
            y += addRow("Remarks:", stay.remarks);
          }

          if (stay.paymentInstructions) {
            // For long text fields like payment instructions, ensure proper wrapping
            y += addRow("Payment Instructions:", stay.paymentInstructions);
          }

          if (stay.cancellations) {
            // For long text fields like cancellation policy, ensure proper wrapping
            y += addRow("Cancellation Policy:", stay.cancellations);
          }

          // Add space between stays
          y += 10;
        }

        // Add closing message after all stays
        // Check if we need a new page for the closing message
        checkNewPage(25); // Estimate 25mm for the message

        // Add some space before the closing message
        y += 5;

        // Add the closing message in italic
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.text(
          "We thank you for your reservation and we wish you a pleasant stay!",
          pageMargins.left,
          y
        );

        y += 8; // Move down for the "With best regards" line
        pdf.text("With best regards,", pageMargins.left, y);

        y += 8; // Move down for the name
        pdf.setFont("helvetica", "normal"); // Normal font for the name
        pdf.text("Ruben Boon", pageMargins.left, y);

        // Add additional space after the signature
        y += 10;
      }

      // Add footers to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        addFooter(i, totalPages);
      }

      // Save the PDF
      pdf.save(
        `confirmation_${bookingData.confirmationNo || bookingData._id}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="download-button-container">
      <Button
        icon={FileDown}
        onClick={handleDownloadPDF}
        size="md"
        intent="primary"
        disabled={isGenerating || disabled}
      >
        {isGenerating ? "Generating PDF..." : "Download PDF"}
      </Button>
      <Button icon={Mail} intent="ghost">
        <a href="mailto:ruben95bo@gmail.com?subject=Order Confirmed – We’ve Got Your Order!&body=Hi%20%5BCustomer%20Name%5D%2C%0A%0AThanks%20for%20your%20purchase!%20We%E2%80%99re%20excited%20to%20let%20you%20know%20that%20your%20order%20has%20been%20successfully%20received%20and%20is%20now%20being%20processed.%0A%0AOnce%20your%20items%20are%20on%20the%20way%2C%20we%E2%80%99ll%20send%20you%20a%20shipping%20confirmation%20with%20tracking%20info%20so%20you%20can%20follow%20your%20delivery%20right%20to%20your%20doorstep.%0A%0AIf%20you%20have%20any%20questions%20in%20the%20meantime%2C%20feel%20free%20to%20reply%20to%20this%20email%20or%20reach%20out%20to%20our%20support%20team%20at%20support%40spacegoodies.com%20%E2%80%94%20we%E2%80%99re%20here%20to%20help!%0A%0AThanks%20again%20for%20choosing%20Space%20Goodies.%20We%20can%E2%80%99t%20wait%20for%20you%20to%20enjoy%20your%20new%20gear!%20%F0%9F%9A%80%0A%0AAll%20the%20best%2C%0AThe%20Space%20Goodies%20Team%0Aspacegoodies.com">
          Send confirmation
        </a>
      </Button>
      {disabled && (
        <div className="download-disabled-message">
          Save or discard changes before downloading
        </div>
      )}
    </div>
  );
}
