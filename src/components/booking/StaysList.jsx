// StaysList.jsx
"use client";
import { useState, useMemo } from "react";
import { Plus, ArrowUpDown } from "lucide-react";
import Button from "@/components/common/Button";
import { StayCard } from "./StayCard";
import { searchDocuments } from "@/app/actions/crudActions";
import { toast } from "sonner";

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
  onStayUpdated,
  onStaysUpdate,
}) {
  const [sortOrder, setSortOrder] = useState("asc");

  const staySummaries = bookingsContext.selectedItem?.staySummaries || [];
  const combinedStays = useMemo(() => {
    if (!stays || stays.length === 0) return [];

    return stays.map((stay) => {
      const summary = staySummaries.find((summary) => summary.stayId === stay._id);
      return {
        stay,
        summary: summary || {
          stayId: stay._id,
          hotelName: stay.hotelName,
          checkInDate: stay.checkInDate,
          checkOutDate: stay.checkOutDate,
          guestNames: []
        }
      };
    });
  }, [stays, staySummaries]);

  const sortedData = useMemo(() => {
    return [...combinedStays].sort((a, b) => {
      const hotelA = (a.summary.hotelName || "").toLowerCase();
      const hotelB = (b.summary.hotelName || "").toLowerCase();

      let comparison =
        sortOrder === "asc"
          ? hotelA.localeCompare(hotelB)
          : hotelB.localeCompare(hotelA);

      if (comparison === 0) {
        const dateA = a.summary.checkInDate || "";
        const dateB = b.summary.checkInDate || "";
        return sortOrder === "asc"
          ? dateA.localeCompare(dateB)
          : dateB.localeCompare(dateA);
      }
      return comparison;
    });
  }, [combinedStays, sortOrder]);

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
            <Button icon={Plus} onClick={onAddStay} size="sm" type="button">
              Add Stay
            </Button>
          )}
        </div>

        {isLoading ? (
          <StaySkeletonLoader count={4} />
        ) : sortedData.length === 0 ? (
          <div className="no-stays-message">
            No stays found for this booking
          </div>
        ) : (
          <div className="stays-list">
            {sortedData.map((item) => (
              <StayCard
                key={item.stay._id}
                staySummary={item.summary}
                stay={item.stay}
                stays={stays}
                isEditing={bookingsContext.isEditing}
                onEditStay={onEditStay}
                onCopyStay={onCopyStay}
                onViewStay={onViewStay}
                onRemoveStay={onRemoveStay}
                onStayUpdated={onStayUpdated}
                onStaysUpdate={onStaysUpdate}
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