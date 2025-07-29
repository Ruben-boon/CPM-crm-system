"use client";
import { useState, useEffect, useRef } from "react";
import { useBookingsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { BookingDetails } from "./BookingDetails";
import { StaysList } from "./StaysList";
import { StayModal } from "../stay/StayModal";
import { searchDocuments } from "@/app/actions/crudActions";
import { toast } from "sonner";
import { BOOKING_STATUS_OPTIONS } from "./bookingConstants";
import { getStatusLabel } from "./bookingStatusUtils";

export function BookingForm() {
  const bookingsContext = useBookingsData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStay, setSelectedStay] = useState(null);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [stays, setStays] = useState([]);
  const [loadingStays, setLoadingStays] = useState(false);
  const loadingRef = useRef(false);

const getDisplayName = (item) => {
  // For new bookings (no _id), always show "New Booking"
  if (!item._id) {
    return "New Booking";
  }
  // For existing bookings, show confirmation number or fallback
  return item.confirmationNo ? item.confirmationNo : "Booking";
};

useEffect(() => {
  if (bookingsContext.selectedItem) {
    const topBarTitle = document.querySelector(".top-bar__title");
    if (topBarTitle) {
      topBarTitle.innerHTML = "";

      const confirmationSpan = document.createElement("span");
      
      // Use the updated logic: "New Booking" for new items, confirmation number for existing
      let displayText;
      if (!bookingsContext.selectedItem._id) {
        displayText = "New Booking";
      } else {
        displayText = bookingsContext.selectedItem.confirmationNo || "Booking";
      }
      
      confirmationSpan.textContent = displayText;
      topBarTitle.appendChild(confirmationSpan);

      // Get status directly from the selected item
      if (bookingsContext.selectedItem.status) {
        const statusBadge = document.createElement("span");
        statusBadge.className = `status-badge status-${bookingsContext.selectedItem.status}`;
        statusBadge.textContent = getStatusLabel(
          bookingsContext.selectedItem.status,
          BOOKING_STATUS_OPTIONS
        );
        topBarTitle.appendChild(statusBadge);
      }
    }
  }
}, [
  bookingsContext.selectedItem,
  bookingsContext.selectedItem?._id,
  bookingsContext.selectedItem?.confirmationNo,
  bookingsContext.selectedItem?.status,
]);



  useEffect(() => {
    if (bookingsContext.selectedItem?._id) {
      setStays([]);
      loadRelatedStays(bookingsContext.selectedItem._id);
    } else if (bookingsContext.selectedItem?.staySummaries?.length > 0) {
      loadRelatedStaysFromSummaries(bookingsContext.selectedItem.staySummaries);
    } else {
      setStays([]);
    }
  }, [
    bookingsContext.selectedItem?._id,
    bookingsContext.selectedItem?.staySummaries,
  ]);

  const loadRelatedStaysFromSummaries = async (staySummaries) => {
    if (!staySummaries || staySummaries.length === 0 || loadingRef.current)
      return;

    try {
      loadingRef.current = true;
      setLoadingStays(true);

      const stayIdsToLoad = staySummaries.map((summary) => summary.stayId);
      const stayPromises = stayIdsToLoad.map((stayId) =>
        searchDocuments("stays", stayId, "_id")
      );

      const stayResults = await Promise.all(stayPromises);
      const loadedStays = stayResults.flat().filter(Boolean);

      setStays(loadedStays);
    } catch (err) {
      console.error("Error loading stays from summaries:", err);
      toast.error("Failed to load stays");
    } finally {
      loadingRef.current = false;
      setLoadingStays(false);
    }
  };

  const loadRelatedStays = async (bookingId) => {
    if (!bookingId || loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoadingStays(true);

      const booking = bookingsContext.selectedItem;
      const staySummaries = booking?.staySummaries || [];

      if (staySummaries.length === 0) {
        setStays([]);
        return;
      }

      const stayIdsToLoad = staySummaries.map(summary => summary.stayId);

      const stayPromises = stayIdsToLoad.map((stayId) =>
        searchDocuments("stays", stayId, "_id")
      );

      const stayResults = await Promise.all(stayPromises);
      const loadedStays = stayResults.flat().filter(Boolean);

      // Enhance stays with guest names from summaries
      const enhancedStays = loadedStays.map(stay => {
        // Find the corresponding summary for this stay
        const summary = staySummaries.find(s => s.stayId === stay._id);
        
        if (summary && summary.guestNames && summary.guestNames.length > 0) {
          // Add guest names from summary to the stay object
          return {
            ...stay,
            summaryGuestNames: summary.guestNames // Keep summary guest names separate
          };
        }
        
        return stay;
      });

      setStays(enhancedStays);

    } catch (err) {
      console.error("Error loading related stays:", err);
      toast.error("Failed to load stays");
    } finally {
      loadingRef.current = false;
      setLoadingStays(false);
    }
  };

  const handleAddStay = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newStay = {
      checkInDate: bookingsContext.selectedItem?.travelPeriodStart || "",
      checkOutDate: bookingsContext.selectedItem?.travelPeriodEnd || "",
      status: "unconfirmed",
      prepaid: "no",
    };

    setSelectedStay(newStay);
    setIsCopyMode(false);
    setIsModalOpen(true);
  };

  const handleEditStay = (stay) => {
    setSelectedStay(stay);
    setIsCopyMode(false);
    setIsModalOpen(true);
  };

  const handleCopyStay = (stay) => {
    const stayCopy = JSON.parse(JSON.stringify(stay));
    delete stayCopy._id;

    if (stayCopy.reference) {
      stayCopy.reference = `${stayCopy.reference} (Copy)`;
    } else {
      stayCopy.reference = `${stay.hotelName} (Copy)`;
    }

    stayCopy.hotelConfirmationNo = "";
    stayCopy.purchaseInvoice = "";
    stayCopy.commissionInvoice = "";
    stayCopy.status = "unconfirmed";

    setSelectedStay(stayCopy);
    setIsCopyMode(true);
    setIsModalOpen(true);
  };

  const handleViewStay = (stayId) => {
    const stayToView = stays.find((stay) => stay._id === stayId);
    if (stayToView) {
      setSelectedStay(stayToView);
      setIsCopyMode(false);
      setIsModalOpen(true);
    } else {
      const fetchStay = async () => {
        try {
          const result = await searchDocuments("stays", stayId, "_id");
          if (Array.isArray(result) && result.length > 0) {
            setSelectedStay(result[0]);
            setIsCopyMode(false);
            setIsModalOpen(true);
          } else {
            toast.error("Could not find stay details");
          }
        } catch (error) {
          console.error("Error fetching stay details:", error);
          toast.error("Error loading stay details");
        }
      };
      fetchStay();
    }
  };

  const handleRemoveStay = async (stayIdToRemove) => {
    if (
      confirm(
        `Are you sure you want to remove this stay from the booking? This will not delete the stay itself.`
      )
    ) {
      const newStays = stays.filter((stay) => stay._id !== stayIdToRemove);

      // Create summaries with guest names for remaining stays
      const newSummaries = await createStaySummariesWithGuestNames(newStays);

      bookingsContext.updateField("staySummaries", newSummaries);
      setStays(newStays);

      const { stayIds, ...bookingData } = bookingsContext.selectedItem;
      const updatedBooking = {
        ...bookingData,
        staySummaries: newSummaries,
      };
      bookingsContext.updateItem(updatedBooking);

      toast.success("Stay removed and booking saved.");
    }
  };

  // const autoSaveBookingAfterStayChange = async (newStaysList) => {
  //   if (!bookingsContext.selectedItem._id) return false;

  //   try {
  //     const newSummaries = newStaysList.map((stay) => ({
  //       stayId: stay._id,
  //       hotelName: stay.hotelName || "Unknown Hotel",
  //       checkInDate: stay.checkInDate,
  //       checkOutDate: stay.checkOutDate,
  //     }));

  //     bookingsContext.updateField("staySummaries", newSummaries);

  //     const { stayIds, ...bookingData } = bookingsContext.selectedItem;
  //     const updatedBooking = {
  //       ...bookingData,
  //       staySummaries: newSummaries,
  //     };

  //     const saveSuccess = await bookingsContext.updateItem(updatedBooking);
  //     return saveSuccess;
  //   } catch (error) {
  //     console.error("Error auto-saving booking:", error);
  //     return false;
  //   }
  // };

  const handleStaySaved = async (savedStay) => {
    if (!savedStay || !savedStay._id) {
      return;
    }

    const existingStayIndex = stays.findIndex(
      (stay) => stay._id === savedStay._id
    );
    const newStaysList = [...stays];
    const isNewStay = existingStayIndex === -1;

    if (isNewStay) {
      newStaysList.push(savedStay);
      setStays(newStaysList);

      // Create summaries with guest names
      const newSummaries = await createStaySummariesWithGuestNames(
        newStaysList
      );
      bookingsContext.updateField("staySummaries", newSummaries);

      if (bookingsContext.selectedItem._id) {
        const { stayIds, ...bookingData } = bookingsContext.selectedItem;
        const updatedBooking = {
          ...bookingData,
          staySummaries: newSummaries,
        };

        const saveSuccess = await bookingsContext.updateItem(updatedBooking);

        if (saveSuccess) {
          toast.success("Stay added and booking updated", {
            description: "The stay has been created and linked to this booking",
          });
        } else {
          toast.warning("Stay created but booking not updated", {
            description: "Please save the booking to confirm changes",
          });
        }
      }
    } else {
      newStaysList[existingStayIndex] = savedStay;
      setStays(newStaysList);

      // Update summaries with guest names
      const updatedSummaries = await createStaySummariesWithGuestNames(
        newStaysList
      );
      bookingsContext.updateField("staySummaries", updatedSummaries);
      toast.success("Stay updated successfully");
    }

    setIsModalOpen(false);
  };

  const createStaySummariesWithGuestNames = async (staysList) => {
    const summariesWithGuestNames = [];

    for (const stay of staysList) {
      let guestNames = [];

      // If the stay has guestIds, fetch the guest names
      if (
        stay.guestIds &&
        Array.isArray(stay.guestIds) &&
        stay.guestIds.length > 0
      ) {
        try {
          // Fetch all guest details in parallel
          const guestPromises = stay.guestIds.map((guestId) =>
            searchDocuments("contacts", guestId, "_id")
          );

          const guestResults = await Promise.all(guestPromises);

          guestNames = guestResults
            .filter((result) => Array.isArray(result) && result.length > 0)
            .map((result) => {
              const contact = result[0];
              const firstName = contact.general?.firstName || "";
              const lastName = contact.general?.lastName || "";
              return `${firstName} ${lastName}`.trim();
            })
            .filter((name) => name.length > 0);
        } catch (error) {
          console.error(
            `Error fetching guest names for stay ${stay._id}:`,
            error
          );
          // Continue with empty guest names if there's an error
        }
      }

      summariesWithGuestNames.push({
        stayId: stay._id,
        hotelName: stay.hotelName || "Unknown Hotel",
        checkInDate: stay.checkInDate,
        checkOutDate: stay.checkOutDate,
        guestNames: guestNames, // Add guest names array
      });
    }

    return summariesWithGuestNames;
  };

  return (
    <>
      {isModalOpen && (
        <StayModal
          stay={selectedStay}
          isCopyMode={isCopyMode}
          bookingId={bookingsContext.selectedItem?._id}
          onSave={handleStaySaved}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <CommonForm
        dataContext={bookingsContext}
        itemName="Booking"
        entityType="booking"
        basePath="bookings"
        displayName={getDisplayName}
      >
        <BookingDetails bookingsContext={bookingsContext} stays={stays} />
        <div className="col-full">
          <StaysList
            bookingsContext={bookingsContext}
            stays={stays}
            isLoading={loadingStays}
            onAddStay={handleAddStay}
            onEditStay={handleEditStay}
            onCopyStay={handleCopyStay}
            onViewStay={handleViewStay}
            onRemoveStay={handleRemoveStay}
          />
        </div>
      </CommonForm>

      <style jsx global>{`
        .top-bar__title {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          span {
            font-size: 1rem;
          }
        }

        .status-upcoming_no_action {
          background-color: #8b5cf6;
        }

        .status-upcoming_confirmation_sent {
          background-color: #3b82f6;
        }

        .status-stayed_missing_invoice {
          background-color: #f59e0b;
        }

        .status-invoicing_missing_both {
          background-color: #ef4444;
        }

        .status-invoicing_missing_sales {
          background-color: #f97316;
        }

        .status-invoicing_missing_commission {
          background-color: #f97316;
        }

        .status-completed {
          background-color: #10b981;
        }
      `}</style>
    </>
  );
}