"use client";

import Button from "@/components/common/Button";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { BookingsProvider, useBookingsData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { searchDocuments } from "@/app/actions/crudActions";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function BookingsLayoutContent({ children }) {
  const dataContext = useBookingsData();
  const { items, isLoading, searchItems, selectItem, isDirty, selectedItem, updateItem, createItem, resetForm } = dataContext;
  const router = useRouter();
  const pathname = usePathname();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleLinkClick = async (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;

      const newPath = anchor.pathname;
      const isExternal = anchor.hostname !== window.location.hostname;
      const isDownload = anchor.hasAttribute('download');

      if (!isExternal && !isDownload && newPath !== pathname) {
        if (isDirty) {
          event.preventDefault();
          setIsSaving(true);
          const toastId = toast.loading("Auto-saving changes...");

          const isNewBooking = !selectedItem?._id;
          const saveOperation = isNewBooking ? createItem(selectedItem) : updateItem(selectedItem);
          
          const success = await saveOperation;
          
          toast.dismiss(toastId);
          setIsSaving(false);

          if (success) {
            toast.success("Changes saved automatically.");
            router.push(newPath);
          } else {
            toast.error("Auto-save failed. Please save manually before leaving.");
          }
        }
      }
    };

    document.body.addEventListener('click', handleLinkClick);

    return () => {
      document.body.removeEventListener('click', handleLinkClick);
    };
  }, [isDirty, pathname, router, selectedItem, updateItem, createItem]);

  const handleSelectBooking = (booking, isNew = false) => {
    console.log('[DEBUG] handleSelectBooking called:', { booking, isNew });

    if (isNew) {
      router.push("/bookings/new");
    } else if (booking && booking._id) {
      router.push(`/bookings/${booking._id}`);
    } else {
      router.push("/bookings");
    }
  };

  const handleCopyBooking = async (booking) => {
    console.log('[DEBUG] handleCopyBooking started for booking:', booking._id);
    
    try {
      // 1. Fetch and prepare the data FIRST.
      console.log('[DEBUG] Fetching booking data...');
      const result = await searchDocuments("bookings", booking._id.toString(), "_id");
      
      if (Array.isArray(result) && result.length > 0) {
        const sourceBooking = JSON.parse(JSON.stringify(result[0]));
        console.log('[DEBUG] Source booking fetched:', {
          originalId: sourceBooking._id,
          confirmationNo: sourceBooking.confirmationNo,
          bookerName: sourceBooking.bookerName,
          bookerId: sourceBooking.bookerId
        });
        
        delete sourceBooking._id; 
        sourceBooking.confirmationNo = `${sourceBooking.confirmationNo} (Copy)`;
        sourceBooking.status = "upcoming_no_action";
        
        console.log('[DEBUG] Prepared booking copy:', {
          confirmationNo: sourceBooking.confirmationNo,
          status: sourceBooking.status,
          hasId: !!sourceBooking._id,
          bookerName: sourceBooking.bookerName,
          bookerId: sourceBooking.bookerId
        });

        // 2. Set the state in the context BEFORE navigating
        console.log('[DEBUG] Calling selectItem with prepared booking...');
        selectItem(sourceBooking, true);
        
        // 3. Navigate immediately - the new page will preserve the data
        console.log('[DEBUG] Navigating to /bookings/new');
        router.push("/bookings/new");
        
      } else {
        console.error('[DEBUG] No booking found in search result');
        toast.error("Booking not found for copying.");
      }
    } catch (error) {
      console.error("[DEBUG] Error creating booking copy:", error);
      toast.error("An error occurred while copying the booking.");
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
            onSelect={(item) => handleSelectBooking(item, false)}
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