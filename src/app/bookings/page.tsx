"use client";

import Button from "@/components/Button";
import { BookingForm } from "@/components/booking/BookingForm";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { BookingsProvider, useBookingsData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useNavigation } from "@/app/layout"; // Import the navigation hook

function PageContent() {
  const {
    selectItem,
    items,
    isLoading,
    searchItems,
  } = useBookingsData();
  
  const { currentId, navigateTo } = useNavigation();
  
  // When a booking is selected, update the URL
  const handleSelectBooking = (booking) => {
    // Update URL when a booking is selected
    if (booking && booking._id) {
      navigateTo('/bookings', booking._id);
    } else {
      navigateTo('/bookings', null);
    }
    
    // Call the original selectItem function
    selectItem(booking);
  };
  
  // Load booking from URL parameter on initial load or when it changes
  useEffect(() => {
    const loadBookingFromUrl = async () => {
      if (currentId) {
        console.log("Loading booking from URL param:", currentId);
        
        // Check if the booking is already in our items
        const existingBooking = items.find(item => item._id === currentId);
        if (existingBooking) {
          selectItem(existingBooking);
          return;
        }
        
        // If not found in current items, search for it
        await searchItems(currentId, "_id");
        
        // Check if it was found in the search results
        const booking = items.find(item => item._id === currentId);
        if (booking) {
          selectItem(booking);
        }
      }
    };
    
    if (currentId) {
      loadBookingFromUrl();
    }
  }, [currentId, items.length === 0]);

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
            <Button icon={Plus} onClick={() => handleSelectBooking({}, true)}>
              New Booking
            </Button>
          </div>
          <SearchResults 
            items={items} 
            onSelect={handleSelectBooking} 
            type="bookings"
          />
        </div>
      </div>

      <div className="details-panel">
        <BookingForm />
      </div>
    </>
  );
}

export default function Page() {
  return (
    <BookingsProvider>
      <PageContent />
    </BookingsProvider>
  );
}