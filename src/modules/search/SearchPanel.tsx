// SearchPanel.tsx
import sampleData from "../../DUMMY_MONGO";
import SearchBar from "./SearchBar";

interface SearchPanelProps {
  type: keyof typeof sampleData; // this allows it to work with any type in your dummy data
}

export default function SearchPanel({ type }: SearchPanelProps) {
  // Get field names from the first item in the data
  const getSearchableFields = () => {
    const firstItem = sampleData[type][0];
    if (!firstItem) return [];

    return Object.keys(firstItem).filter(
      (key) =>
        // Only include fields that we can search in
        typeof firstItem[key] === "string" ||
        (typeof firstItem[key] === "object" && firstItem[key]?.name) // for nested objects with name property
    );
  };

  const handleSearch = (searchField: string, searchTerm: string) => {
    const data = sampleData[type];

    const filteredData = data.filter((item) => {
      if (searchField.includes(".")) {
        // Handle nested fields (like company.name)
        const [parent, child] = searchField.split(".");
        return item[parent]?.[child]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
      // Handle regular fields
      return String(item[searchField])
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });

    console.log("Filtered Data:", filteredData);
    return filteredData;
  };

  return (
    <div className="search-panel">
      <SearchBar filterList={getSearchableFields()} onSearch={handleSearch} />
      {/* search results next */}
    </div>
  );
}
