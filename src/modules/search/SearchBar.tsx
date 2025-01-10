"use client";
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
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex-1">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Search by ${searchField.replace(".", " ")}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
}
