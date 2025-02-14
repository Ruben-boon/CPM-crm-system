"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string, searchField: string) => void;
  isLoading?: boolean;
  type?: "contacts" | "companies";
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
    { value: "general.phone", label: "Phone" },
  ] as const;

  const companyFields = [
    { value: "supplierName", label: "Supplier Name" },
    { value: "entityName", label: "Entity Name" },
    { value: "vatNo", label: "VAT No." },
    { value: "invoicingEmail", label: "Invoicing Email" },
  ] as const;

  const searchableFields = type === "contacts" ? contactFields : companyFields;

  const [searchField, setSearchField] = useState(searchableFields[0].value);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    onSearch("", searchField);
  }, []);

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