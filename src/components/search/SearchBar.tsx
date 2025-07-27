"use client";
import { Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string, searchField: string) => void;
  isLoading?: boolean;
  type?: "contacts" | "companies" | "bookings" | "hotels" | "stays";
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  type = "contacts"
}: SearchBarProps) {
  const lastValidDateRef = useRef<string>("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const contactFields = [
    { value: "general.firstName", label: "First Name" },
    { value: "general.lastName", label: "Last Name" },
    { value: "general.email", label: "Email" },
    { value: "general.companyName", label: "Company" },
  ] as const;

  const companyFields = [
    { value: "name", label: "Name" },
    { value: "address", label: "Address" },
    { value: "city", label: "City" },
    { value: "country", label: "Country" },
    { value: "postal_code", label: "Postal Code" },
  ] as const;

  const bookingFields = [
    { value: "hotelName", label: "Hotel" },
    { value: "confirmationNo", label: "Booking reference" },
    { value: "companyName", label: "Company" },
    { value: "bookerName", label: "Booker" },
    { value: "guestName", label: "Guest Name" },
    // { value: "dateInRange", label: "Date in Range" }, 
    // { value: "travelPeriodStart", label: "Earliest check in" }, 
    // { value: "travelPeriodEnd", label: "Latest check out" },
    { value: "status", label: "Status" },
    { value: "costCentre", label: "Cost Centre" },
  ] as const;

  const hotelFields = [
    { value: "name", label: "Name" },
    { value: "address", label: "Address" },
    { value: "city", label: "City" },
    { value: "country", label: "Country" },
    { value: "postal_code", label: "Postal Code" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
  ] as const;

  const stayFields = [
    { value: "hotelName", label: "Hotel" },
    // { value: "checkInDate", label: "Check-in Date" },
    // { value: "checkOutDate", label: "Check-out Date" },
    { value: "guestName", label: "Guest Name" },
  ] as const;

  const getSearchableFields = () => {
    switch(type) {
      case "contacts": return contactFields;
      case "companies": return companyFields;
      case "bookings": return bookingFields;
      case "hotels": return hotelFields;
      case "stays": return stayFields;
      default: return contactFields;
    }
  };

  const searchableFields = getSearchableFields();

  const [searchField, setSearchField] = useState(searchableFields[0].value);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Perform an initial search when the component mounts
    onSearch("", searchField);
  }, []);

  // Reset search field when the entity type changes
  useEffect(() => {
    setSearchField(getSearchableFields()[0].value);
  }, [type]);

  const handleSearch = () => {
    onSearch(searchTerm.trim(), searchField);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Helper function to check if a date string is valid and complete
  const isValidCompleteDate = (dateStr: string): boolean => {
    if (!dateStr || dateStr.length !== 10) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime()) && dateStr.includes('-');
  };

  // Handle date changes with validation
  const handleDateChange = (value: string) => {
    setSearchTerm(value);
    
    // Only search if:
    // 1. We have a valid, complete date
    // 2. It's different from the last valid date we processed
    // 3. The change represents an actual date selection (not navigation)
    if (isValidCompleteDate(value) && value !== lastValidDateRef.current) {
      // Small delay to ensure the date picker has time to close
      setTimeout(() => {
        // Double-check that the input still has this value (user didn't continue navigating)
        if (dateInputRef.current && dateInputRef.current.value === value) {
          lastValidDateRef.current = value;
          onSearch(value, searchField);
        }
      }, 100);
    }
  };

  const isStatusField = type === "bookings" && searchField === "status";
  const isDateField = type === "bookings" && (
    searchField === "dateInRange" || 
    searchField === "travelPeriodStart" || 
    searchField === "travelPeriodEnd"
  ) || type === "stays" && (
    searchField === "checkInDate" || 
    searchField === "checkOutDate"
  );

  return (
    <div className="search-group">
      <div className="search-bar">
        <Search className="search-bar__icon" size={20} strokeWidth={1.5} />
        
        {isStatusField ? (
          <select 
            className="status-dropdown"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch(e.target.value, searchField);
            }}
          >
            <option value="">All Statuses</option>
            <option value="upcoming_no_action">Upcoming - No action taken</option>
            <option value="upcoming_confirmation_sent">Upcoming - Confirmation send</option>
            <option value="stayed_missing_invoice">Stayed - Missing Purchase Invoice(s)</option>
            <option value="invoicing_missing_both">Invoicing - Missing sales invoice and commision</option>
            <option value="invoicing_missing_sales">Invoicing - Missing sales invoice</option>
            <option value="invoicing_missing_commission">Invoicing - Missing commision</option>
            <option value="completed">Completed</option>
          </select>
        ) : isDateField ? (
          <input
            ref={dateInputRef}
            type="date"
            className="search-bar__input"
            value={searchTerm}
            onChange={(e) => {
              // Use our smart date change handler
              handleDateChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        ) : (
          <input
            type="text"
            className="search-bar__input"
            placeholder={`Search by ${searchableFields.find(f => f.value === searchField)?.label}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        )}
      </div>
      <select
        className="search-filter"
        value={searchField}
        onChange={(e) => {
          setSearchField(e.target.value);
          setSearchTerm("");
          lastValidDateRef.current = ""; // Reset the last valid date when changing fields
          onSearch("", e.target.value);
        }}
        disabled={isLoading}
      >
        {searchableFields.map((field) => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </select>

      <style jsx>{`
        .status-dropdown,
        .search-bar__input[type="date"] {
          flex: 1;
          padding: 8px 12px;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
          color: inherit;
        }
        
        .search-bar__input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}