"use client";

import Button from "@/components/Button";
import { BookingForm } from "@/components/booking/BookingForm";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { BookingsProvider, useBookingsData } from "@/context/DataContext";
import { Plus } from "lucide-react";

function PageContent() {
  const {
    selectItem,
    items,
    isLoading,
    searchItems,
  } = useBookingsData();

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
            <Button icon={Plus} onClick={() => selectItem({}, true)}>
              New Booking
            </Button>
          </div>
          <SearchResults 
            items={items} 
            onSelect={selectItem} 
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