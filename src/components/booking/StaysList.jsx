"use client";
import { Plus } from "lucide-react";
import Button from "@/components/common/Button";
import { StayCard } from "./StayCard";

export function StaysList({
  bookingsContext,
  stays,
  onAddStay,
  onEditStay,
  onCopyStay,
  onViewStay,
  onRemoveStay
}) {
  return (
    <div className="related-stays-container">
      <div className="related-stays">
        <div className="related-stays-header">
          <h4 className="related-title">Stays</h4>
          {bookingsContext.isEditing && (
            <Button icon={Plus} onClick={onAddStay} size="sm">
              Add Stay
            </Button>
          )}
        </div>

        {stays.length === 0 ? (
          <div className="no-stays-message">
            No stays found for this booking
          </div>
        ) : (
          <div className="stays-list">
            {stays.map((stay, index) => (
              <StayCard
                key={stay._id}
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
        .related-stays-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
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