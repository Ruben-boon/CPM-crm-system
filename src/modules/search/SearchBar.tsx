"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  filterList: string[];
  onSearch: (searchField: string, searchTerm: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({
  filterList,
  onSearch,
  isLoading = false,
}: SearchBarProps) {
  const [searchField, setSearchField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (filterList.length > 0) {
      setSearchField(filterList[0]);
    }
  }, [filterList]);

  const handleSearch = () => {
    onSearch(searchField, searchTerm.trim());
    console.log(searchField, searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <Search className="search-bar__icon" size={20} strokeWidth={1.5} />
        <input
          type="text"
          className="search-bar__input"
          placeholder={`Search by ${searchField.replace(".", " ")}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>

      <select
        className="search-filter"
        value={searchField}
        onChange={(e) => {
          setSearchField(e.target.value);
        }}
        disabled={isLoading}
      >
        {filterList.map((field) => {
          return (
            <option key={field} value={field}>
              {field.replace(".", " ")}
            </option>
          );
        })}
      </select>
    </div>
  );
}
