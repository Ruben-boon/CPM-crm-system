"use client";
import { useState } from "react";
import SearchResults from "./SearchResults";
import SearchHandler from "./SearchHandler";
import { Plus } from "lucide-react";
import Button from "../Button";

interface ExplorerProps {
  type: string;
  onOpenDetail: (isNew: boolean, detailData: any) => void;
}
export default function SearchContainer({ onOpenDetail, type }: ExplorerProps) {
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleFilterUpdate = (data: any[]) => {
    setFilteredData(data);
    console.log("Searchresults:", data);
  };

  const handleDetailsToParent = (isNew: boolean, detailData: any) => {
    onOpenDetail(isNew, detailData);
  };

  return (
    <>
      <SearchHandler type={type} onFilter={handleFilterUpdate} />

      <SearchResults
        onOpenDetail={handleDetailsToParent}
        searchList={filteredData}
      />
      <div className="button-container">
        <Button icon={Plus} onClick={() => handleDetailsToParent(true, [])}>
          Create new entry
        </Button>
      </div>
    </>
  );
}
