"use client";

import Button from "@/components/common/Button";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { StaysProvider, useStaysData } from "@/context/DataContext";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchDocuments } from "@/app/actions/crudActions";

function StaysLayoutContent({ children }) {
  const { items, isLoading, searchItems, selectItem } = useStaysData();
  const router = useRouter();

  // Handle selecting a stay to view
  const handleSelectStay = (stay, isNew = false) => {
    if (isNew) {
      router.push("/stays/new");
    } else if (stay && stay._id) {
      router.push(`/stays/${stay._id}`);
    } else {
      router.push("/stays");
    }
  };

  // Handle copying a stay - directly fetch and set the data
  const handleCopyStay = async (stay) => {
    try {
      // First navigate to the new page
      router.push("/stays/new");
      
      // Then fetch the full stay data to ensure we have all fields
      const result = await searchDocuments("stays", stay._id.toString(), "_id");
      
      if (Array.isArray(result) && result.length > 0) {
        // Make a deep clone of the source stay
        const sourceStay = JSON.parse(JSON.stringify(result[0]));
        
        // Remove the _id to create a new stay
        delete sourceStay._id;
        
        // Update the name/identifier to indicate it's a copy
        if (sourceStay.reference) {
          sourceStay.reference = `${sourceStay.reference} (Copy)`;
        }
        
        // Use setTimeout to ensure this runs after navigation is complete
        setTimeout(() => {
          // Select the stay with edit mode enabled
          selectItem(sourceStay, true);
        }, 100);
      }
    } catch (error) {
      console.error("Error creating stay copy:", error);
    }
  };

  return (
    <>
      <div className="search-area">
        <div className="search-panel">
          <SearchBar
            onSearch={searchItems}
            isLoading={isLoading}
            type="stays"
          />
          <div className="button-container">
            <Button intent="outline" icon={Plus} onClick={() => handleSelectStay({}, true)}>
              New Stay
            </Button>
          </div>
          <SearchResults
            items={items}
            onSelect={handleSelectStay}
            onCopy={handleCopyStay}
            type="stays"
          />
        </div>
      </div>

      <div className="details-panel">
        {children}
      </div>
    </>
  );
}

export default function StaysLayout({ children }) {
  return (
    <StaysProvider>
      <StaysLayoutContent>{children}</StaysLayoutContent>
    </StaysProvider>
  );
}