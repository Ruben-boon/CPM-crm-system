import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { determineBookingStatus } from '../components/booking/bookingStatusUtils';

interface UseBookingStatusProps {
  booking: any;
  stays: any[];
  onStatusUpdate: (newStatus: string) => Promise<boolean>;
}

export function useBookingStatus({ 
  booking, 
  stays, 
  onStatusUpdate
}: UseBookingStatusProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  // Calculate status
  const calculateStatus = useCallback(() => {
    if (!booking) return "upcoming_no_action";
    return determineBookingStatus(booking, stays);
  }, [booking, stays]);

  // Update status
  const updateStatus = useCallback(async (newStatus: string) => {
    if (!booking?._id) return false;

    console.log(`🚀 Starting status update to: ${newStatus}`);

    try {
      setIsCalculating(true);
      setError(null);

      const success = await onStatusUpdate(newStatus);
      
      if (success) {
        lastStatusRef.current = newStatus;
        console.log(`✅ Status update successful: ${newStatus}`);
      } else {
        console.log(`❌ Status update failed`);
      }
      
      return success;
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error updating status');
      return false;
    } finally {
      setIsCalculating(false);
    }
  }, [booking?._id, onStatusUpdate]);

  // DISABLED: Auto-update status when booking or stays change
  // This was causing infinite loops. Status updates should be manual only.
  /*
  useEffect(() => {
    if (!booking?._id) return;

    const calculatedStatus = calculateStatus();
    const currentStatus = booking.status;
    
    console.log(`🔍 Status check: current=${currentStatus}, calculated=${calculatedStatus}, last=${lastStatusRef.current}`);
    
    // Only update if status has actually changed AND we're not currently calculating
    // AND the calculated status is different from the last one we tried to update to
    if (calculatedStatus !== currentStatus && 
        calculatedStatus !== lastStatusRef.current && 
        !isCalculating) {
      console.log(`🔄 Status changed: ${currentStatus} → ${calculatedStatus}`);
      updateStatus(calculatedStatus);
    } else {
      console.log(`⏭️ No status update needed`);
    }
  }, [booking, stays, calculateStatus, updateStatus, isCalculating]);
  */

  return {
    currentStatus: booking?.status || "upcoming_no_action",
    calculatedStatus: calculateStatus(),
    isCalculating,
    error,
    updateStatus
  };
}
