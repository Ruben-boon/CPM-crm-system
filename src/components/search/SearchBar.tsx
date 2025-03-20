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
    { value: "general.role", label: "Role" },
  ] as const;

  const companyFields = [
    { value: "name", label: "Name" },
    { value: "address", label: "Address" },
    { value: "city", label: "City" },
    { value: "country", label: "Country" },
    { value: "postal_code", label: "Postal Code" },
    { value: "parentCompanyName", label: "Parent Company" },
    { value: "childCompanyName", label: "Child Company" },
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
    { value: "reference", label: "Reference" },
    { value: "roomNumber", label: "Room Number" },
    { value: "checkInDate", label: "Check-in Date" },
    { value: "checkOutDate", label: "Check-out Date" },
    { value: "status", label: "Status" },
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
    onSearch("", searchField);
  }, []);

  // Reset search field when type changes
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

  return (
    <div className="search-group">
      <div className="search-bar">
        <Search className="search-bar__icon" size={20} strokeWidth={1.5} />
        <input
          type="text"
          className="search-bar__input"
          placeholder={`Search by ${searchableFields.find(f => f.value === searchField)?.label}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>
      <select
        className="search-filter"
        value={searchField}
        onChange={(e) => setSearchField(e.target.value)}
        disabled={isLoading}
      >
        {searchableFields.map((field) => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </select>
    </div>
  );
}