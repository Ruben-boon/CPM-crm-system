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

  // --- MODIFICATION START: Auto-save on navigation ---
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

          // --- FIX: Decide whether to create or update the booking ---
          const isNewBooking = !selectedItem?._id;
          const saveOperation = isNewBooking ? createItem(selectedItem) : updateItem(selectedItem);
          
          const success = await saveOperation;
          
          toast.dismiss(toastId);
          setIsSaving(false);

          if (success) {
            toast.success("Changes saved automatically.");
            // If it was a new booking, the context should now have the new ID.
            // We can now safely navigate.
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
  // --- MODIFICATION END ---

  const handleSelectBooking = (booking, isNew = false) => {
    // This function is now simpler, as the click handler manages the save logic.
    if (isNew) {
      router.push("/bookings/new");
    } else if (booking && booking._id) {
      router.push(`/bookings/${booking._id}`);
    } else {
      router.push("/bookings");
    }
  };

  const handleCopyBooking = async (booking) => {
    // The global click handler will manage auto-saving if the form is dirty.
    // This function can now focus only on the copy logic.
    try {
        router.push("/bookings/new");
        const result = await searchDocuments("bookings", booking._id.toString(), "_id");
        
        if (Array.isArray(result) && result.length > 0) {
            const sourceBooking = JSON.parse(JSON.stringify(result[0]));
            delete sourceBooking._id;
            if (sourceBooking.confirmationNo) {
                sourceBooking.confirmationNo = `${sourceBooking.confirmationNo} (Copy)`;
            }
            setTimeout(() => {
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
            {/* The global click handler will catch this navigation */}
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

      {/* The UnsavedChangesDialog is no longer needed */}
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