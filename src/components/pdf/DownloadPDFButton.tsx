import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FileDown, Mail } from "lucide-react";
import Button from "@/components/common/Button";
import { jsPDF } from "jspdf";
import { searchDocuments } from "@/app/actions/crudActions";

// MODIFIED: Updated Stay interface to match the correct data structure
interface Stay {
  _id: string;
  checkInDate?: string;
  checkOutDate?: string;
  hotelName?: string;
  hotelId?: string;
  hotelAddress?: string;
  hotelPostcode?: string;
  hotelCity?: string;
  hotelCountry?: string;
  roomType?: string;
  roomNumber?: string;
  roomPrice?: string;
  roomCurrency?: string;
  paymentType?: string;
  taxAmount?: string; // Correct field for tax amount
  taxCurrency?: string; // Correct field for tax currency
  reference?: string;
  guestIds?: string[];
  guestNames?: string[];
  specialRequests?: string;
  remarks?: string;
  paymentInstructions?: string;
  cancellations?: string;
  confirmationNo?: string;
  hotelConfirmationNo?: string;
}

interface BookingData {
  _id: string;
  confirmationNo?: string;
  confirmationDate?: string;
  travelPeriodStart?: string;
  travelPeriodEnd?: string;
  costCentre?: string;
  notes?: string;
  companyId?: string;
  bookerId?: string;
  stayIds?: string[];
  confirmationEntity?: string;
}

interface DownloadPDFButtonProps {
  bookingData: BookingData;
  stays: Stay[];
  disabled?: boolean;
  onSendConfirmation: (bookerData: any, preparedStays: Stay[]) => void;
}

export function DownloadPDFButton({
  bookingData,
  stays,
  disabled = false,
  onSendConfirmation,
}: DownloadPDFButtonProps) {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [bookerData, setBookerData] = useState<any>(null);

  // FIXED: Define pageMargins at the top level
  const pageMargins = {
    top: 20,
    bottom: 20,
    left: 16,
    right: 16
  };

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

  const prepareStaysWithGuestNames = async (
    staysData: Stay[]
  ): Promise<Stay[]> => {
    if (!staysData || staysData.length === 0) return [];

    const staysWithNames = [...staysData];

    for (let i = 0; i < staysWithNames.length; i++) {
      const stay = staysWithNames[i];
      if (
        stay.guestIds &&
        stay.guestIds.length > 0 &&
        (!stay.guestNames || stay.guestNames.length === 0)
      ) {
        stay.guestNames = [];

        for (const guestId of stay.guestIds) {
          try {
            const result = await searchDocuments("contacts", guestId, "_id");
            if (Array.isArray(result) && result.length > 0) {
              const contact = result[0];
              const firstName = contact.general?.firstName || "";
              const lastName = contact.general?.lastName || "";
              const fullName = `${firstName} ${lastName}`.trim();
              if (fullName) {
                stay.guestNames.push(fullName);
              }
            }
          } catch (error) {
            console.error(
              `Error fetching guest name for ID ${guestId}:`,
              error
            );
          }
        }
      }
    }

    return staysWithNames;
  };

  const fetchAndAttachHotelDetails = async (
    staysToPrepare: Stay[]
  ): Promise<Stay[]> => {
    if (!staysToPrepare || staysToPrepare.length === 0) return [];

    const hotelIds = [
      ...new Set(staysToPrepare.map((stay) => stay.hotelId).filter((id) => id)),
    ];
    if (hotelIds.length === 0) return staysToPrepare;

    try {
      const hotelPromises = hotelIds.map((id) =>
        searchDocuments("hotels", id, "_id")
      );
      const hotelResults = await Promise.all(hotelPromises);

      const hotelsMap = new Map<string, any>();
      hotelResults.forEach((result) => {
        if (Array.isArray(result) && result.length > 0) {
          const hotel = result[0];
          hotelsMap.set(hotel._id, hotel);
        }
      });

      return staysToPrepare.map((stay) => {
        if (stay.hotelId && hotelsMap.has(stay.hotelId)) {
          const hotelData = hotelsMap.get(stay.hotelId);
          return {
            ...stay,
            hotelAddress: hotelData.address,
            hotelPostcode: hotelData.postal_code,
            hotelCity: hotelData.city,
            hotelCountry: hotelData.country,
          };
        }
        return stay;
      });
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      // toast.error("Could not fetch hotel details.");
      return staysToPrepare; // Return original stays if fetching fails
    }
  };

  const handleSendConfirmation = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSending(true);

    try {
      let preparedStays = await prepareStaysWithGuestNames(stays);
      preparedStays = await fetchAndAttachHotelDetails(preparedStays);

      // Sort stays by check-in date (same as PDF)
      preparedStays.sort((a, b) => {
        const dateA = a.checkInDate ? new Date(a.checkInDate).getTime() : 0;
        const dateB = b.checkInDate ? new Date(b.checkInDate).getTime() : 0;
        return dateA - dateB;
      });

      onSendConfirmation(bookerData, preparedStays);
    } catch (error) {
      console.error("Error preparing confirmation data:", error);
      alert("Failed to prepare confirmation data. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

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

  // Simplified helper for guest names with prepared data
  const formatGuestNames = (stay: Stay): string => {
    if (!stay.guestIds || stay.guestIds.length === 0) {
      return "-";
    }

    if (
      stay.guestNames &&
      Array.isArray(stay.guestNames) &&
      stay.guestNames.length > 0
    ) {
      return stay.guestNames.join(", ");
    }

    return stay.guestIds.join(", ");
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
      let preparedStays = await prepareStaysWithGuestNames(stays);
      preparedStays = await fetchAndAttachHotelDetails(preparedStays);

      // Sort stays by check-in date
      preparedStays.sort((a, b) => {
        const dateA = a.checkInDate ? new Date(a.checkInDate).getTime() : 0;
        const dateB = b.checkInDate ? new Date(b.checkInDate).getTime() : 0;
        return dateA - dateB;
      });

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // FIXED: Now pageMargins is properly defined and accessible
      const contentHeight = 297 - pageMargins.top - pageMargins.bottom - 40; // A4 height minus margins and footer space

      // Current y position on the page
      let y = pageMargins.top;

      // Current page number
      let currentPage = 1;
      let isFirstPage = true;

      // Function to add footer to current page
      const addFooter = (page: number, totalPages: number) => {
        const selectedEntity =
          bookingData.confirmationEntity || "Corporate Meeting Partner B.V.";

        let entityDetails;

        // MODIFIED: Added TIDS number to entity details
        if (selectedEntity === "Corporate Meeting Partner (UK) Ltd.") {
          entityDetails = {
            name: "Corporate Meeting Partner (UK) Ltd.",
            addressLine1: "59 St. Martin's Lane",
            addressLine2: "London, WC2N 4JS (UK)",
            phone: "Tel. +44 (0)20 4579 0714",
            line1: "Companies House: 15675410",
            tids: "TIDS by IATA: 96172016",
          };
        } else {
          // Default to Dutch entity
          entityDetails = {
            name: "Corporate Meeting Partner B.V.",
            addressLine1: "Dorpsstraat 20",
            addressLine2: "2361 BB Warmond (NL)",
            phone: "Tel. +31 (0)85 0030 395",
            line1: "ICC: 77251563",
            tids: "TIDS by IATA: 96075464",
          };
        }

        pdf.setPage(page);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");

        // Draw a light gray line above the footer
        pdf.setDrawColor(200, 200, 200);
        pdf.line(16, 255, 190, 255);

        // Add page numbers
        pdf.text(`Page ${page} of ${totalPages}`, 190, 260, {
          align: "right",
        });

        // Add corporate information in the footer
        // Company name - bold
        pdf.setFont("helvetica", "bold");
        pdf.text(entityDetails.name, 16, 264);

        // Rest of the information - normal
        pdf.setFont("helvetica", "normal");
        const lineSpacing = 4;

        // Left column for address
        pdf.text(entityDetails.addressLine1, 16, 264 + lineSpacing);
        pdf.text(entityDetails.addressLine2, 16, 264 + lineSpacing * 2);
        pdf.text(entityDetails.line1, 16, 264 + lineSpacing * 3);
        // MODIFIED: Render TIDS number
        pdf.text(entityDetails.tids, 16, 264 + lineSpacing * 4);

        // Middle column for contact
        pdf.text(entityDetails.phone, 80, 268);
        pdf.text("www.corporatemeetingpartner.com", 80, 268 + lineSpacing);
        pdf.text(
          "reservations@corporatemeetingpartner.com",
          80,
          268 + lineSpacing * 2
        );
      };

      const checkNewPage = (requiredHeight: number) => {
        if (isFirstPage) {
          return false;
        }

        if (y + requiredHeight > pageMargins.top + contentHeight) {
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

      // Add full company address to the top right
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

        const cityLine = [companyData.postal_code, companyData.city]
          .filter(Boolean)
          .join(" ");
        if (cityLine) {
          pdf.text(cityLine, rightMargin, companyY, { align: "right" });
          companyY += 4;
        }

        if (companyData.country) {
          pdf.text(companyData.country, rightMargin, companyY, {
            align: "right",
          });
        }
      }

      // Confirmation section
      const confirmationNumber = bookingData.confirmationNo || bookingData._id;

      // Add confirmation number on the left with "Confirmation" in bold
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Confirmation ", pageMargins.left, y);
      const confirmationTextWidth = pdf.getTextWidth("Confirmation ");
      pdf.text(confirmationNumber, pageMargins.left + confirmationTextWidth, y);

      y += 8;

      // Function to add key-value row and update y position
      const addRow = (
        key: string,
        value: string,
        indent = 0,
        isLink = false,
        url = ""
      ): number => {
        pdf.setFontSize(10);

        const valueStartX = 75;
        const maxValueWidth = 190 - valueStartX;

        pdf.setFont("helvetica", "normal");
        const splitValue = pdf.splitTextToSize(value, maxValueWidth);
        const lineCount = splitValue.length;
        const rowHeight = 6 * lineCount;

        if (checkNewPage(rowHeight)) {
          // New page
        }

        pdf.setFont("helvetica", "bold");
        pdf.text(key, pageMargins.left + indent, y);

        pdf.setFont("helvetica", "normal");

        if (isLink) {
          pdf.setTextColor(0, 0, 0);
          if (lineCount === 1) {
            pdf.textWithLink(value, valueStartX, y, { url: url });
            pdf.setDrawColor(0, 0, 0);
            pdf.line(
              valueStartX,
              y + 1,
              valueStartX + pdf.getTextWidth(value),
              y + 1
            );
          } else {
            splitValue.forEach((line: string, index: number) => {
              const yPos = y + index * 6;
              pdf.textWithLink(line, valueStartX, yPos, { url: url });
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
          if (lineCount === 1) {
            pdf.text(value, valueStartX, y);
          } else {
            splitValue.forEach((line: string, index: number) => {
              pdf.text(line, valueStartX, y + index * 6);
            });
          }
        }

        return rowHeight;
      };

      // Add booking details
      y += addRow("By order of:", getBookerName());
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
        0,
        true,
        "https://www.corporatemeetingpartner.com/privacy-policy"
      );

      y += 5;
      isFirstPage = false;

      if (!preparedStays || preparedStays.length === 0) {
        checkNewPage(10);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.text("No stays associated with this booking", 105, y, {
          align: "center",
        });
        y += 10;
      } else {
        // Process each stay
        for (let i = 0; i < preparedStays.length; i++) {
          const stay = preparedStays[i];
          const isFirstStay = i === 0;

          let stayHeight = 80;
          const estimateTextHeight = (
            text?: string,
            maxWidth = 115
          ): number => {
            if (!text) return 0;
            pdf.setFontSize(10);
            const lines = pdf.splitTextToSize(text, maxWidth);
            return lines.length * 6;
          };

          if (stay.specialRequests)
            stayHeight += estimateTextHeight(stay.specialRequests);
          if (stay.remarks) stayHeight += estimateTextHeight(stay.remarks);
          if (stay.paymentInstructions)
            stayHeight += estimateTextHeight(stay.paymentInstructions);
          if (stay.cancellations)
            stayHeight += estimateTextHeight(stay.cancellations);

          // Only check for new page if it's NOT the first stay
          if (!isFirstStay) {
            checkNewPage(stayHeight);
          }

          const nights = calculateNights(stay.checkInDate, stay.checkOutDate);
          const nightsText =
            parseInt(nights) === 1 ? `${nights} Night` : `${nights} Nights`;

          // Stay header
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");

          const guestNamesForTitle = formatGuestNames(stay);
          const fullTitle = `Stay: ${guestNamesForTitle} - ${nightsText}`;

          const maxTitleWidth = 130;
          const truncatedTitle = pdf.splitTextToSize(
            fullTitle,
            maxTitleWidth
          )[0];

          const displayTitle =
            truncatedTitle.length < fullTitle.length
              ? truncatedTitle + "..."
              : truncatedTitle;

          pdf.text(displayTitle, pageMargins.left, y);
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");

          y += 3;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(pageMargins.left, y, 190, y);
          y += 3;

          // Check-in
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          pdf.text("Check-in: ", 30, y + 4);
          const checkInTextWidth = pdf.getTextWidth("Check-in: ");
          pdf.setFont("helvetica", "bold");
          pdf.text(formatDate(stay.checkInDate), 30 + checkInTextWidth, y + 4);

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

          y += 8;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(pageMargins.left, y, 190, y);
          y += 5;

          // Modified addRow function for first stay to skip page breaks
          const addRowForStay = (
            key: string,
            value: string,
            indent = 0,
            isLink = false,
            url = ""
          ): number => {
            pdf.setFontSize(10);

            const valueStartX = 75;
            const maxValueWidth = 190 - valueStartX;

            pdf.setFont("helvetica", "normal");
            const splitValue = pdf.splitTextToSize(value, maxValueWidth);
            const lineCount = splitValue.length;
            const rowHeight = 6 * lineCount;

            // Only check for new page if it's NOT the first stay
            if (!isFirstStay && checkNewPage(rowHeight)) {
              // New page
            }

            pdf.setFont("helvetica", "bold");
            pdf.text(key, pageMargins.left + indent, y);

            pdf.setFont("helvetica", "normal");

            if (isLink) {
              pdf.setTextColor(0, 0, 0);
              if (lineCount === 1) {
                pdf.textWithLink(value, valueStartX, y, { url: url });
                pdf.setDrawColor(0, 0, 0);
                pdf.line(
                  valueStartX,
                  y + 1,
                  valueStartX + pdf.getTextWidth(value),
                  y + 1
                );
              } else {
                splitValue.forEach((line: string, index: number) => {
                  const yPos = y + index * 6;
                  pdf.textWithLink(line, valueStartX, yPos, { url: url });
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
              if (lineCount === 1) {
                pdf.text(value, valueStartX, y);
              } else {
                splitValue.forEach((line: string, index: number) => {
                  pdf.text(line, valueStartX, y + index * 6);
                });
              }
            }

            return rowHeight;
          };

          // Stay details using the modified addRowForStay function
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");

          y += addRowForStay("Hotel:", stay.hotelName || "Unknown hotel");

          const addressParts = [
            stay.hotelAddress,
            stay.hotelPostcode,
            stay.hotelCity,
            stay.hotelCountry,
          ].filter(Boolean);

          if (addressParts.length > 0) {
            const cityLine = [stay.hotelPostcode, stay.hotelCity]
              .filter(Boolean)
              .join(" ");
            const fullAddress = [stay.hotelAddress, cityLine, stay.hotelCountry]
              .filter(Boolean)
              .join(", ");
            y += addRowForStay("Hotel address:", fullAddress);
          }

          if (stay.hotelConfirmationNo) {
            y += addRowForStay(
              "Hotel Confirmation No.:",
              stay.hotelConfirmationNo
            );
          }
          y += addRowForStay("Room Type:", stay.roomType || "-");

          y += addRowForStay(
            "Room Price:",
            stay.roomPrice
              ? `${stay.roomPrice} ${stay.roomCurrency || ""} per night`
              : "-"
          );

          if (stay.paymentType) {
            y += addRowForStay("", stay.paymentType);
          }

          if (stay.roomPrice) {
            const disclaimerText =
              "Quoted rates reflect average nightly prices and may vary with changes in stay duration or room type";
            const disclaimerLines = pdf.splitTextToSize(
              disclaimerText,
              190 - 75
            );

            // Only check for new page if it's NOT the first stay
            if (!isFirstStay) {
              checkNewPage(disclaimerLines.length * 4);
            }

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "italic");
            pdf.text(disclaimerLines, 75, y);
            y += disclaimerLines.length * 3.5;

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            y += 5;
          }

          y += addRowForStay("Guests:", formatGuestNames(stay));

          if (stay.taxAmount) {
            const taxValue = `${stay.taxAmount} ${
              stay.taxCurrency || ""
            }`.trim();
            y += addRowForStay("Total local taxes:", taxValue);
          }

          if (stay.specialRequests) {
            y += addRowForStay("Special Requests:", stay.specialRequests);
          }

          if (stay.remarks) {
            y += addRowForStay("Remarks:", stay.remarks);
          }

          if (stay.paymentInstructions) {
            y += addRowForStay(
              "Payment Instructions:",
              stay.paymentInstructions
            );
          }

          if (stay.cancellations) {
            y += addRowForStay("Cancellation Policy:", stay.cancellations);
          }

          y += 10;
        }

        checkNewPage(25);
        y += 5;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          "Thank you for booking with us, we hope you and/or your guest(s) have a pleasant stay!",
          pageMargins.left,
          y
        );

        y += 8;
        pdf.text("With best regards,", pageMargins.left, y);

        y += 8;
        const userName = session?.user?.name || "CMP Team";
        pdf.text(userName, pageMargins.left, y);

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
    <>
      <div className="download-button-container">
        <Button
          icon={FileDown}
          onClick={handleDownloadPDF}
          size="md"
          intent="primary"
          disabled={isGenerating || isSending || disabled}
          type="button"
        >
          {isGenerating ? "Generating PDF..." : "Generate Confirmation PDF"}
        </Button>
        <Button
          icon={Mail}
          intent="secondary"
          onClick={handleSendConfirmation}
          type="button"
          disabled={isGenerating || isSending || disabled}
        >
          {isSending ? "Preparing..." : "Send confirmation"}
        </Button>
      </div>
      {disabled && (
        <div className="download-disabled-message">
          Save or discard changes before downloading
        </div>
      )}
    </>
  );
}
