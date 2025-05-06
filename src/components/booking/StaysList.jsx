// StaysList.jsx
"use client";
import { useState, useMemo } from "react";
import { Plus, ArrowUpDown } from "lucide-react";
import Button from "@/components/common/Button";
import { StayCard } from "./StayCard";

// Simple skeletal loader for stays
function StaySkeletonLoader({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="stay-skeleton">
          <div className="stay-skeleton-header">
            <div className="skeleton-bar skeleton-title"></div>
            <div className="skeleton-bar skeleton-badge"></div>
          </div>
        </div>
      ))}
    </>
  );
}

export function StaysList({
  bookingsContext,
  stays = [],
  isLoading = false,
  onAddStay,
  onEditStay,
  onCopyStay,
  onViewStay,
  onRemoveStay,
}) {
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  // Sort stays based on hotel name and then by check-in date
  const sortedStays = useMemo(() => {
    if (!stays || stays.length === 0) return [];

    return [...stays].sort((a, b) => {
      // First sort by hotel name
      const hotelA = (a.hotelName || "").toLowerCase();
      const hotelB = (b.hotelName || "").toLowerCase();

      let comparison = 0;
      if (sortOrder === "asc") {
        comparison = hotelA.localeCompare(hotelB);
      } else {
        comparison = hotelB.localeCompare(hotelA);
      }

      // If same hotel, sort by check-in date
      if (comparison === 0) {
        const dateA = a.checkInDate || "";
        const dateB = b.checkInDate || "";

        if (sortOrder === "asc") {
          return dateA.localeCompare(dateB);
        } else {
          return dateB.localeCompare(dateA);
        }
      }

      return comparison;
    });
  }, [stays, sortOrder]);

  // Toggle sort order - make sure this doesn't trigger form updates
  const toggleSortOrder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="related-stays-container">
      <div className="related-stays">
        <div className="related-stays-header">
          <div className="stays-header-left">
            <h4 className="related-title">Stays</h4>
            <Button
              icon={ArrowUpDown}
              onClick={toggleSortOrder}
              size="sm"
              intent="ghost"
              title={`Sort ${sortOrder === "asc" ? "A to Z" : "Z to A"}`}
              type="button"
            >
              {sortOrder === "asc" ? "A → Z" : "Z → A"}
            </Button>
          </div>
          {bookingsContext.isEditing && (
            <Button 
              icon={Plus} 
              onClick={onAddStay} 
              size="sm"
              type="button"
            >
              Add Stay
            </Button>
          )}
        </div>

        {isLoading ? (
          <StaySkeletonLoader count={4} />
        ) : sortedStays.length === 0 ? (
          <div className="no-stays-message">
            No stays found for this booking
          </div>
        ) : (
          <div className="stays-list">
            {sortedStays.map((stay, index) => (
              <StayCard
                key={stay._id || index}
                stay={stay}
                index={index}
                isEditing={bookingsContext.isEditing}
                onEditStay={onEditStay}
                onCopyStay={onCopyStay}
                onViewStay={onViewStay}
                onRemoveStay={onRemoveStay}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .stay-list {
          padding-bottom: 2px;
        }
        .related-stays-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .stays-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .related-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .no-stays-message {
          padding: 20px;
          text-align: center;
          color: #6b7280;
          background-color: #f9fafb;
          border-radius: 8px;
          border: 1px dashed #e5e7eb;
        }
      `}</style>
    </div>
  );
}