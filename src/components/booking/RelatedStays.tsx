"use client";
import { useState, useEffect } from "react";
import { searchDocuments, updateDocument } from "@/app/actions/crudActions";
import Button from "@/components/common/Button";
import { Plus, Edit, ExternalLink, Copy, X } from "lucide-react";
import { LoadingSpinner } from "../loadingSpinner";
import { StayModal } from "./StayModal";
import { toast } from "sonner";

interface RelatedStaysProps {
  stayIds: string[];
  onStaysChange: (stayIds: string[], stayDetails: any[]) => void;
  travelPeriodStart?: string;
  travelPeriodEnd?: string;
  companyId?: string;
  hotelId?: string;
  isEditing?: boolean;
}

function RemoveConfirmationDialog({ isOpen, onClose, onConfirm, stayReference }) {
  if (!isOpen) return null;

  return (
    <div className="remove-confirmation-overlay">
      <div className="remove-confirmation-dialog">
        <h3>Confirm Removal</h3>
        <p>Are you sure you want to remove {stayReference || "this stay"} from the booking?</p>
        <p className="info-text">The stay will not be deleted, just removed from this booking.</p>
        <div className="dialog-buttons">
          <Button intent="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button intent="primary" onClick={onConfirm}>
            Remove
          </Button>
        </div>
      </div>

      <style jsx>{`
        .remove-confirmation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .remove-confirmation-dialog {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          width: 400px;
          max-width: 90vw;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }

        p {
          margin-bottom: 16px;
        }

        .info-text {
          color: #555;
          font-style: italic;
        }

        .dialog-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

export function RelatedStays({
  stayIds = [],
  onStaysChange,
  travelPeriodStart,
  travelPeriodEnd,
  companyId,
  hotelId,
  isEditing = false
}: RelatedStaysProps) {
  const [stays, setStays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [selectedStay, setSelectedStay] = useState<any>(null);
  const [isCopyMode, setIsCopyMode] = useState(false);
  
  // State for remove confirmation
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [stayToRemove, setStayToRemove] = useState<{id: string, index: number, name: string} | null>(null);

  // Load related stays whenever stayIds changes
  useEffect(() => {
    loadRelatedStays();
  }, [stayIds]);

  const loadRelatedStays = async () => {
    if (!stayIds || stayIds.length === 0) {
      setStays([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedStays = [];
      
      // Fetch each stay by ID
      for (const stayId of stayIds) {
        const result = await searchDocuments("stays", stayId, "_id");
        if (Array.isArray(result) && result.length > 0) {
          loadedStays.push(result[0]);
        }
      }
      
      setStays(loadedStays);
    } catch (err) {
      console.error("Error loading related stays:", err);
      setError("Failed to load stays");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "checked_in": return "Checked In";
      case "checked_out": return "Checked Out";
      case "cancelled": return "Cancelled";
      case "no_show": return "No Show";
      default: return status || "-";
    }
  };

  const getStayDisplayName = (stay) => {
    if (!stay) return "New Stay";
    
    let name = '';
    
    // Add check-in/check-out dates if available
    if (stay.checkInDate) {
      name += formatDate(stay.checkInDate);
      
      if (stay.checkOutDate) {
        name += ` - ${formatDate(stay.checkOutDate)}`;
      }
    }
    
    // Add hotel name if available
    if (stay.hotelName) {
      name += stay.hotelName ? ` at ${stay.hotelName}` : '';
    }
    
    // Add room info if available
    if (stay.roomNumber) {
      name += ` (Room ${stay.roomNumber})`;
    } else if (stay.roomType) {
      name += ` (${stay.roomType})`;
    }
    
    return name.trim() || `Stay ${formatDate(new Date().toISOString())}`;
  };

  const handleAddStay = () => {
    // Create a new stay with default values from the booking
    setSelectedStay({
      checkInDate: travelPeriodStart || "",
      checkOutDate: travelPeriodEnd || "",
      hotelId: hotelId || "",
      status: "confirmed",
    });
    setIsCopyMode(false);
    setIsStayModalOpen(true);
  };

  const handleEditStay = (stay: any) => {
    setSelectedStay(stay);
    setIsCopyMode(false);
    setIsStayModalOpen(true);
  };

  const handleCopyStay = (stay: any) => {
    // Create a deep copy of the stay
    const stayCopy = JSON.parse(JSON.stringify(stay));
    
    // Remove the _id to ensure it creates a new stay
    delete stayCopy._id;
    
    // Optionally modify the reference to indicate it's a copy
    if (stayCopy.reference) {
      stayCopy.reference = `${stayCopy.reference} (Copy)`;
    }
    
    setSelectedStay(stayCopy);
    setIsCopyMode(true);
    setIsStayModalOpen(true);
  };

  const handleRemoveClick = (stay: any, index: number) => {
    setStayToRemove({
      id: stay._id,
      index,
      name: getStayDisplayName(stay)
    });
    setShowRemoveConfirmation(true);
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirmation(false);
    setStayToRemove(null);
  };

  const handleConfirmRemove = () => {
    if (!stayToRemove) {
      setShowRemoveConfirmation(false);
      return;
    }
    
    // Create new arrays without the removed stay
    const newStayIds = [...stayIds];
    newStayIds.splice(stayToRemove.index, 1);
    
    const newStays = [...stays];
    newStays.splice(stayToRemove.index, 1);
    
    // Update the parent component
    onStaysChange(newStayIds, newStays);
    
    // Update local state
    setStays(newStays);
    
    // Show success message and reset state
    toast.success("Stay removed from booking");
    setShowRemoveConfirmation(false);
    setStayToRemove(null);
  };

  const handleViewStay = (stayId: string) => {
    window.open(`/stays/${stayId}`, '_blank');
  };

  const handleStayModalClose = () => {
    setIsStayModalOpen(false);
    setSelectedStay(null);
    setIsCopyMode(false);
  };

  const handleStaySaved = (savedStay) => {
    setIsStayModalOpen(false);
    
    if (!savedStay || !savedStay._id) {
      // Something went wrong with saving
      return;
    }
    
    // If this is a new stay (not already in the stayIds array)
    if (!stayIds.includes(savedStay._id)) {
      // Add the new stay to the stayIds array
      const newStayIds = [...stayIds, savedStay._id];
      
      // Reload the stays with the new ID included
      loadRelatedStays().then(() => {
        // After loading, update the parent component with the new IDs and loaded stays
        onStaysChange(newStayIds, stays);
      });
    } else {
      // If it's an existing stay that was updated, just reload the stays
      loadRelatedStays();
    }
    
    setSelectedStay(null);
    setIsCopyMode(false);
  };

  return (
    <div className="related-stays">
      <div className="related-stays-header">
        <h3 className="related-title">Related Stays</h3>
        {isEditing && ( // Only show Add Stay button in edit mode
          <Button 
            icon={Plus} 
            onClick={handleAddStay} 
            size="sm"
          >
            Add Stay
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner isLoading={true} />
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : stays.length === 0 ? (
        <div className="no-stays-message">No stays found for this booking</div>
      ) : (
        <div className="stays-list">
          {stays.map((stay, index) => (
            <div key={stay._id} className="stay-item">
              <div className="stay-info">
                <div className="stay-dates">
                  {formatDate(stay.checkInDate)} - {formatDate(stay.checkOutDate)}
                </div>
                <div className="stay-details">
                  <span className="stay-hotel">{stay.hotelName || "Unknown hotel"}</span>
                  {stay.roomNumber && <span className="stay-room">Room: {stay.roomNumber}</span>}
                  <span className="stay-status">Status: {getStatusLabel(stay.status)}</span>
                </div>
                <div className="stay-guests">
                  {stay.guestNames && stay.guestNames.length > 0 ? (
                    <span>{stay.guestNames.join(", ")}</span>
                  ) : (
                    <span className="no-guests">No guests assigned</span>
                  )}
                </div>
              </div>
              <div className="stay-actions">
                {isEditing ? ( // Only show action buttons in edit mode
                  <>
                    <Button 
                      icon={X} 
                      onClick={() => handleRemoveClick(stay, index)} 
                      size="sm" 
                      intent="ghost"
                      title="Remove stay from booking"
                    >
                      Remove
                    </Button>
                    <Button 
                      icon={Copy} 
                      onClick={() => handleCopyStay(stay)} 
                      size="sm" 
                      intent="secondary"
                      title="Copy stay"
                    >
                      Copy
                    </Button>
                    <Button 
                      icon={Edit} 
                      onClick={() => handleEditStay(stay)} 
                      size="sm" 
                      intent="secondary"
                      title="Edit stay"
                    >
                      Edit
                    </Button>
                  </>
                ) : null}
                {/* View button is always available regardless of edit mode */}
                <Button 
                  icon={ExternalLink} 
                  onClick={() => handleViewStay(stay._id)} 
                  size="sm" 
                  intent="ghost"
                  title="View in new tab"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stay Modal */}
      {isStayModalOpen && (
        <StayModal
          stay={selectedStay}
          isOpen={isStayModalOpen}
          onClose={handleStayModalClose}
          onSave={handleStaySaved}
          isCopyMode={isCopyMode}
          // No bookingId passed here, since stays won't directly reference bookings
        />
      )}

      {/* Remove Confirmation Dialog */}
      <RemoveConfirmationDialog
        isOpen={showRemoveConfirmation}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        stayReference={stayToRemove ? stayToRemove.name : "this stay"}
      />

      <style jsx>{`
        .related-stays {
          margin-top: 2rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 1rem;
          background-color: #fafafa;
        }

        .related-stays-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .related-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
          height: 100px;
          position: relative;
        }

        .error-message {
          color: #e53935;
          padding: 1rem;
          text-align: center;
        }

        .no-stays-message {
          color: #757575;
          padding: 2rem 0;
          text-align: center;
          font-style: italic;
        }

        .stays-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .stay-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .stay-info {
          flex: 1;
        }

        .stay-dates {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stay-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .stay-room, .stay-status {
          color: #616161;
        }

        .stay-guests {
          font-size: 0.9rem;
          color: #616161;
        }

        .no-guests {
          font-style: italic;
          color: #9e9e9e;
        }

        .stay-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}