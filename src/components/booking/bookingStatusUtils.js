
export function determineBookingStatus(booking, stays) {
  // Default status for new bookings
  if (!booking) return "upcoming_no_action";

  // Check if departure date has passed
  const currentDate = new Date();
  const departureDate = booking.travelPeriodEnd ? new Date(booking.travelPeriodEnd) : null;
  
  // Log for debugging
  console.log('Current date:', currentDate);
  console.log('Departure date string:', booking.travelPeriodEnd);
  console.log('Parsed departure date:', departureDate);
  console.log('Has departure date passed?', departureDate && departureDate < currentDate);
  
  const hasDepatureDatePassed = departureDate && departureDate < currentDate;

  // When departure date has passed, we prioritize these statuses
  if (hasDepatureDatePassed) {
    // Check if all stays have purchase invoices - THIS HAS HIGHEST PRIORITY
    const allStaysHavePurchaseInvoices = stays.length > 0 && 
      stays.every(stay => stay.purchaseInvoice && stay.purchaseInvoice.trim() !== "");
    
    // When departure date has passed and at least one stay missing purchase invoice
    // THIS TAKES PRECEDENCE OVER EVERYTHING ELSE
    if (!allStaysHavePurchaseInvoices) {
      return "stayed_missing_invoice";
    }
    
    // If we get here, all purchase invoices are present
    // Only now do we check sales invoice and commission
    const hasSalesInvoice = booking.salesInvoice && booking.salesInvoice.trim() !== "";
    // UPDATED: Check all stays for a commission invoice number
    const hasCommission = stays.length > 0 && 
      stays.every(stay => stay.commissionInvoice && stay.commissionInvoice.trim() !== "");

    // Both sales invoice and commission are missing
    if (!hasSalesInvoice && !hasCommission) {
      return "invoicing_missing_both";
    }
    
    // Sales invoice is missing but commission is present
    if (!hasSalesInvoice && hasCommission) {
      return "invoicing_missing_sales";
    }
    
    // Commission is missing but sales invoice is present
    if (hasSalesInvoice && !hasCommission) {
      return "invoicing_missing_commission";
    }
    
    // Everything is present - completed
    if (hasSalesInvoice && hasCommission) {
      return "completed";
    }
  } else {
    // For upcoming bookings (departure date hasn't passed yet)
    
    // When confirmation_sent is checked
    if (booking.confirmationSent) {
      return "upcoming_confirmation_sent";
    }
    
    // Default for upcoming bookings with no confirmation sent
    return "upcoming_no_action";
  }

  // Default fallback (should never reach here, but just in case)
  return "upcoming_no_action";
}

// Get the display label for a status value
export function getStatusLabel(statusValue, options) {
  const option = options.find(opt => opt.value === statusValue);
  return option ? option.label : "Unknown Status";
}