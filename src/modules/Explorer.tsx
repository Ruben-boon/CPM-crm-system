"use client";
import { useState } from "react";
import DetailsPanel from "./details/DetailPanel";
import Search from "./search/Search";
import { FormField } from "@/types";
import SearchPanel from "./search/SearchPanel";
import CreateDocument from "./search/CreateDocument";
import SearchResults from "./search/SearchResults";

interface ExplorerProps {
  schemaLayout: FormField[];
  type: string;
  onOpenDetail: (isNew: boolean, detailData: {}) => void; 
}
export default function Explorer({
  onOpenDetail,
  schemaLayout,
  type,
}: ExplorerProps) {
  const [filteredData, setFilteredData] = useState<any[]>([]);

  //when filter changes display results
  const handleFilterUpdate = (data: any[]) => {
    setFilteredData(data);
    // console.log(data);
  };
  //when an action is taken pass to parent to open the details pane
  const handleDetailsToParent = (isNew: boolean, detailData: {}) => {
    onOpenDetail(isNew, detailData);
  };

  return (
    <>
      <SearchPanel type="contacts" onFilter={handleFilterUpdate} />
      <div className="create-document" onClick={() => handleDetailsToParent(true, [])}>Create document</div>
      <SearchResults type="contacts" onOpenDetail={handleDetailsToParent} searchList={filteredData} />
    </>
  );
}
