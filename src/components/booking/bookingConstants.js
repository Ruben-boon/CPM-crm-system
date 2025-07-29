
export const BOOKING_STATUS_OPTIONS = [
  //default status when a booking is created
  { value: "upcoming_no_action", label: "Upcoming - No action taken" },
  //when the field confirmation_sent is checked
  {
    value: "upcoming_confirmation_sent",
    label: "Upcoming - Confirmation send",
  },
  //when the departure date has passed (is bigger then the current date) and one of the stays within the booking has a purchaseInvoice is false (is not there).
  {
    value: "stayed_missing_invoice",
    label: "Stayed - Missing Purchase Invoice(s)",
  },
  //when all purchaseInvoices are present but both the salesInvoice and commision are missing
  {
    value: "invoicing_missing_both",
    label: "Invoicing - Missing sales invoice and commision",
  },
  //when all purchaseInvoices are present but  the salesInvoice is missing but the commision is present (is there / true)
  {
    value: "invoicing_missing_sales",
    label: "Invoicing - Missing sales invoice",
  },
  //when all purchaseInvoices are present but  the commision is missing but the salesInvoice is present (is there / true)
  {
    value: "invoicing_missing_commission",
    label: "Invoicing - Missing commision",
  },
  //when all purchaseInvoices are present and the commision and salesInvoice is present.
  { value: "completed", label: "Completed" },
];

export const STAY_STATUS_OPTIONS = [
  { value: "unconfirmed", label: "Unconfirmed" },
  { value: "unconfirmed_prepaid", label: "Unconfirmed Prepaid" },
  { value: "confirmed_prepaid_upcoming", label: "Confirmed Prepaid Upcoming" },
  { value: "confirmed_upcoming", label: "Confirmed Upcoming" },
  { value: "confirmed_prepaid_stayed", label: "Confirmed Prepaid Stayed" },
  { value: "confirmed_stayed", label: "Confirmed Stayed" },
  { value: "purchase_invoice_received", label: "Purchase Invoice Received" },
  { value: "cancelled", label: "Cancelled" },
];

export const PREPAID_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];

    return `${day} ${month}`;
  } catch (error) {
    return dateString;
  }
};

export const getGuestCountText = (guestIds) => {
  // Only return count, no names
  if (!guestIds || !Array.isArray(guestIds)) return "0 guests";
  const count = guestIds.length;
  return count === 1 ? "1 guest" : `${count} guests`;
};

export const getStatusLabel = (status) => {
  if (!status) return "-";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
