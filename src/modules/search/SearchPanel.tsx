import React from "react";
import sampleData from "../../DUMMY_MONGO";
import SearchBar from "./SearchBar";

interface SearchPanelProps {
  type: keyof typeof sampleData; // Type from your dummy data
  onFilter: (data: any[]) => void; // Callback to pass filtered data to the parent
}

export default function SearchPanel({ type, onFilter }: SearchPanelProps) {
  // Get searchable fields
  const getSearchableFields = () => {
    const firstItem = sampleData[type][0];
    if (!firstItem) return [];

    return Object.keys(firstItem).filter(
      (key) =>
        typeof firstItem[key] === "string" ||
        (typeof firstItem[key] === "object" && firstItem[key]?.name) // Include nested objects with `name`
    );
  };

  // Handle search and filter data (fetch from mongoDB)
  const handleSearch = (searchField: string, searchTerm: string) => {
    const data = sampleData[type];

    const filteredData = data.filter((item) => {
      if (searchField.includes(".")) {
        const [parent, child] = searchField.split(".");
        return item[parent]?.[child]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
      return String(item[searchField])
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
    onFilter(filteredData); // Pass the filtered data upwards
  };

  return (
    <div className="search-panel">
      <SearchBar filterList={getSearchableFields()} onSearch={handleSearch} />
    </div>
  );
}
