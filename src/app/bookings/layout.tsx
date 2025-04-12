"use client";

import Button from "@/components/common/Button";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { BookingsProvider, useBookingsData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchDocuments } from "@/app/actions/crudActions";

function BookingsLayoutContent({ children }) {
  const { items, isLoading, searchItems, selectItem } = useBookingsData();
  const router = useRouter();

  // Handle selecting a booking to view
  const handleSelectBooking = (booking, isNew = false) => {
    if (isNew) {
      router.push("/bookings/new");
    } else if (booking && booking._id) {
      router.push(`/bookings/${booking._id}`);
    } else {
      router.push("/bookings");
    }
  };

  // Handle copying a booking - directly fetch and set the data
  const handleCopyBooking = async (booking) => {
    try {
      // First navigate to the new page
      router.push("/bookings/new");
      
      // Then fetch the full booking data to ensure we have all fields
      const result = await searchDocuments("bookings", booking._id.toString(), "_id");
      
      if (Array.isArray(result) && result.length > 0) {
        // Make a deep clone of the source booking
        const sourceBooking = JSON.parse(JSON.stringify(result[0]));
        
        // Remove the _id to create a new booking
        delete sourceBooking._id;
        
        // Update the reference to indicate it's a copy
        if (sourceBooking.confirmationNo) {
          sourceBooking.confirmationNo = `${sourceBooking.confirmationNo} (Copy)`;
        }
        
        // Use setTimeout to ensure this runs after navigation is complete
        setTimeout(() => {
          // Select the booking with edit mode enabled
          selectItem(sourceBooking, true);
        }, 100);
      }
    } catch (error) {
      console.error("Error creating booking copy:", error);
    }
  };

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar
            onSearch={searchItems}
            isLoading={isLoading}
            type="bookings"
          />
          <div className="button-container">
            <Button intent="outline" icon={Plus} onClick={() => handleSelectBooking({}, true)}>
              New Booking
            </Button>
          </div>
          <SearchResults
            items={items}
            onSelect={handleSelectBooking}
            onCopy={handleCopyBooking}
            type="bookings"
          />
        </div>
      </div>

      <div className="details-panel">
        {children}
      </div>
    </>
  );
}

export default function BookingsLayout({ children }) {
  return (
    <BookingsProvider>
      <BookingsLayoutContent>{children}</BookingsLayoutContent>
    </BookingsProvider>
  );
}