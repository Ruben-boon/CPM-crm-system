"use client";

import Button from "@/components/common/Button";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { HotelsProvider, useHotelsData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchDocuments } from "@/app/actions/crudActions";

function HotelsLayoutContent({ children }) {
  const { items, isLoading, searchItems, selectItem } = useHotelsData();
  const router = useRouter();

  // Handle selecting a hotel to view
  const handleSelectHotel = (hotel, isNew = false) => {
    if (isNew) {
      router.push("/hotels/new");
    } else if (hotel && hotel._id) {
      router.push(`/hotels/${hotel._id}`);
    } else {
      router.push("/hotels");
    }
  };

  // Handle copying a hotel - directly fetch and set the data
  const handleCopyHotel = async (hotel) => {
    try {
      // First navigate to the new page
      router.push("/hotels/new");
      
      // Then fetch the full hotel data to ensure we have all fields
      const result = await searchDocuments("hotels", hotel._id.toString(), "_id");
      
      if (Array.isArray(result) && result.length > 0) {
        // Make a deep clone of the source hotel
        const sourceHotel = JSON.parse(JSON.stringify(result[0]));
        
        // Remove the _id to create a new hotel
        delete sourceHotel._id;
        
        // Update the name to indicate it's a copy
        if (sourceHotel.name) {
          sourceHotel.name = `${sourceHotel.name} (Copy)`;
        }
        
        // Use setTimeout to ensure this runs after navigation is complete
        setTimeout(() => {
          // Select the hotel with edit mode enabled
          selectItem(sourceHotel, true);
        }, 100);
      }
    } catch (error) {
      console.error("Error creating hotel copy:", error);
    }
  };

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar
            onSearch={searchItems}
            isLoading={isLoading}
            type="hotels"
          />
          <div className="button-container">
            <Button intent="outline" icon={Plus} onClick={() => handleSelectHotel({}, true)}>
              New Hotel
            </Button>
          </div>
          <SearchResults
            items={items}
            onSelect={handleSelectHotel}
            onCopy={handleCopyHotel}
            type="hotels"
          />
        </div>
      </div>

      <div className="details-panel">
        {children}
      </div>
    </>
  );
}

export default function HotelsLayout({ children }) {
  return (
    <HotelsProvider>
      <HotelsLayoutContent>{children}</HotelsLayoutContent>
    </HotelsProvider>
  );
}