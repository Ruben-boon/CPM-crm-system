"use client";
import { useState } from "react";
import SearchResults from "./SearchResults";
import SearchHandler from "./SearchHandler";

interface ExplorerProps {
  type: string;
  onOpenDetail: (isNew: boolean, detailData: any) => void;
}
export default function SearchContainer({ onOpenDetail, type }: ExplorerProps) {
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleFilterUpdate = (data: any[]) => {
    setFilteredData(data);
    console.log(data, "data with the filter applied");
  };

  const handleDetailsToParent = (isNew: boolean, detailData: any) => {
    onOpenDetail(isNew, detailData);
  };

  return (
    <>
      <SearchHandler type={type} onFilter={handleFilterUpdate} />
      <div
        className="create-document"
        onClick={() => handleDetailsToParent(true, [])}
      >
        Create document
      </div>
      <SearchResults
        type={type}
        onOpenDetail={handleDetailsToParent}
        searchList={filteredData}
      />
    </>
  );
}
