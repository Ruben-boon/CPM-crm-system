// Shared constants for stay components
export const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
  { value: "JPY", label: "JPY" },
  { value: "CHF", label: "CHF" },
  { value: "HUF", label: "HUF" },
  { value: "PLN", label: "PLN" },
  { value: "DKK", label: "DKK" },
  { value: "CAD", label: "CAD" },
  { value: "SEK", label: "SEK" },
  { value: "HKD", label: "HKD" },
  { value: "BRL", label: "BRL" },
  { value: "TRY", label: "TRY" },
  { value: "CZK", label: "CZK" },
  { value: "ISK", label: "ISK" },
  { value: "INR", label: "INR" },
  { value: "NOK", label: "NOK" },
  { value: "RSD", label: "RSD" },
  { value: "SGD", label: "SGD" },
  { value: "HRK", label: "HRK" },
  { value: "BGN", label: "BGN" },
];

export const PAYMENT_INVOICE_PAID_OPTIONS = [
  { value: "not_paid", label: "Not paid" },
  { value: "paid_bank_transfer", label: "Paid by Bank Transfer" },
  { value: "paid_credit_card", label: "Paid by Credit Card" },
  { value: "custom", label: "Custom ..." },
];

export const CANCELLATION_OPTIONS = [
  {
    value:
      "Cancellations made up to 24 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.",
    label: "24h",
  },
  {
    value:
      "Cancellations made up to 48 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.",
    label: "48h",
  },
  {
    value:
      "Cancellations made up to 72 hours prior to arrival will incur no charge. Cancellations made within this timeframe will be charged at 100% of the total cost.",
    label: "72h",
  },
  {
    value:
      "Non-Refundable Reservation – This booking cannot be canceled or modified without incurring charges.",
    label: "Non-ref",
  },
  {
    value: "custom",
    label: "Custom cancellation ..",
  },
];

export const PAYMENT_INSTRUCTION_OPTIONS = [
  {
    value:
      "Room and breakfast charges, along with applicable taxes, will be billed to the credit card provided by Corporate Meeting Partner. Any additional expenses incurred during the stay will be settled by the guest upon check-out.",
    label: "Creditcard: Room, breakfast and tax",
  },
  {
    value:
      "Room and applicable tax charges will be billed to the credit card provided by Corporate Meeting Partner. Any additional expenses incurred during the stay will be settled by the guest upon check-out.",
    label: "Creditcard: Room and tax",
  },
  {
    value:
      "All charges will be billed to the credit card provided by Corporate Meeting Partner.",
    label: "Creditcard: All charges",
  },
  {
    value:
      "Room and breakfast charges, along with applicable taxes, will be invoiced to Corporate Meeting Partner. Any additional expenses will be settled by the guest upon check-out.",
    label: "Billed: Room, breakfast and tax",
  },
  {
    value:
      "Room and applicable tax charges will be invoiced to Corporate Meeting Partner. Any additional expenses will be settled by the guest upon check-out.",
    label: "Billed: Room and tax",
  },
  {
    value: "All charges will be invoiced to Corporate Meeting Partner.",
    label: "Billed: All charges",
  },
  {
    value: "All charges will be settled by the guest upon check-out.",
    label: "Own Account",
  },
  {
    value: "custom",
    label: "Custom payment ..",
  },
];

export const PAYMENT_TYPE_OPTIONS = [
  {
    value: "Above rate is including breakfast and excluding Citytax",
    label: "Incl. BK, Exc. Citytax",
  },
  {
    value: "Above rate is including breakfast and including Citytax",
    label: "Incl. BK & Citytax",
  },
  {
    value: "Above rate is excluding breakfast and including Citytax",
    label: "Exc. BK, Incl. Citytax",
  },
  {
    value: "Above rate is excluding breakfast and excluding Citytax",
    label: "Exc. BK & Citytax",
  },
];

export const STATUS_OPTIONS = [
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

export const DEFAULT_ROOM_TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "suite", label: "Suite" },
  { value: "deluxe", label: "Deluxe" },
];
