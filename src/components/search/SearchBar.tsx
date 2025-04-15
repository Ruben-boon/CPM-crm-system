"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

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
  const contactFields = [
    { value: "general.firstName", label: "First Name" },
    { value: "general.lastName", label: "Last Name" },
    { value: "general.email", label: "Email" },
  ] as const;

  const companyFields = [
    { value: "name", label: "Name" },
    { value: "address", label: "Address" },
    { value: "city", label: "City" },
    { value: "country", label: "Country" },
    { value: "postal_code", label: "Postal Code" },
  ] as const;

  const bookingFields = [
    { value: "confirmationNo", label: "Confirmation No." },
    { value: "travelPeriodStart", label: "Travel Start" },
    { value: "travelPeriodEnd", label: "Travel End" },
    { value: "companyName", label: "Company" },
    { value: "bookerName", label: "Booker" },
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
    { value: "checkInDate", label: "Check-in Date" },
    { value: "checkOutDate", label: "Check-out Date" },
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
  const [statusOptions, setStatusOptions] = useState<JSX.Element | null>(null);

  useEffect(() => {
    onSearch("", searchField);
  }, []);

  // Reset search field when type changes
  useEffect(() => {
    setSearchField(getSearchableFields()[0].value);
  }, [type]);

  // Show status dropdown when status is selected
  useEffect(() => {
    if (searchField === "status" && type === "bookings") {
      setStatusOptions(
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
      );
    } else {
      setStatusOptions(null);
    }
  }, [searchField, type]);

  const handleSearch = () => {
    onSearch(searchTerm.trim(), searchField);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-group">
      <div className="search-bar">
        <Search className="search-bar__icon" size={20} strokeWidth={1.5} />
        {!statusOptions ? (
          <input
            type="text"
            className="search-bar__input"
            placeholder={`Search by ${searchableFields.find(f => f.value === searchField)?.label}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        ) : (
          statusOptions
        )}
      </div>
      <select
        className="search-filter"
        value={searchField}
        onChange={(e) => {
          setSearchField(e.target.value);
          // Clear search term when changing fields
          setSearchTerm("");
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

      {/* Add some styling for the status dropdown */}
      <style jsx>{`
        .status-dropdown {
          flex: 1;
          padding: 8px 12px;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
        }
      `}</style>
    </div>
  );
}