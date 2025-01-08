import { FormField } from "@/types/types";
import { useState } from "react";

interface SearchResultProps {
  type: string;
  searchList: FormField[];
  onOpenDetail: (isNew: boolean, dataDetails: {}) => void;
}

export default function SearchResults({
  type,
  searchList,
  onOpenDetail,
}: SearchResultProps) {
  //   console.log(searchList);

  return (
    <div className="search-results">
      {searchList.length > 0 ? (
        <ul>
          {searchList.map((singleSearch, index) => (
            //this needs to be more dynamic but should be discussed what info it should show
            <li key={index} style={{ cursor: "pointer" }}>
              <div onClick={() => onOpenDetail(false, singleSearch)}>
                <p>
                  <strong>
                    {singleSearch.firstName} {singleSearch.lastName}
                  </strong>
                </p>
                <p>Email: {singleSearch.email}</p>
                <p>Phone: {singleSearch.phone}</p>
                <p>Company: {singleSearch.company?.name}</p>
              </div>
              <strong>
                <div
                  onClick={() => onOpenDetail(true, singleSearch)}
                  style={{ cursor: "pointer" }}
                >
                  <p>Copy contact</p>
                </div>
              </strong>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
}
