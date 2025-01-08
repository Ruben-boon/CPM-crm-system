"use client"
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

interface SearchPanelProps {
  type: string; // Type from your API route (e.g., "contacts")
  onFilter: (data: any[]) => void; // Callback to pass filtered data to the parent
}

export default function SearchPanel({ type, onFilter }: SearchPanelProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/fields/${type}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  // Get searchable fields
  const getSearchableFields = () => {
    const firstItem = data[0];
    if (!firstItem) return [];

    return Object.keys(firstItem).filter(
      (key) =>
        typeof firstItem[key] === "string" ||
        (typeof firstItem[key] === "object" && firstItem[key]?.name) // Include nested objects with `name`
    );
  };

  // Handle search and filter data
  const handleSearch = (searchField: string, searchTerm: string) => {
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

  if (loading) {
    return <div>Loading...</div>; // Render a loading state while data is fetched
  }

  return (
    <div className="search-panel">
      <SearchBar filterList={getSearchableFields()} onSearch={handleSearch} />
    </div>
  );
}
