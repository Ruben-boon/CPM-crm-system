import { Contact } from "@/types/types";
import { Copy } from "lucide-react";

interface SearchResultProps {
  searchList: Contact[];
  onOpenDetail: (isNew: boolean, dataDetails: Contact) => void;
}

export default function SearchResults({
  searchList,
  onOpenDetail,
}: SearchResultProps) {
  if (searchList.length === 0) {
    return <div className="search-results__no-results">No results found</div>;
  }

  return (
    <ul className="search-results">
      {searchList.map((contact, index) => (
        <li 
          key={`${contact.email}-${index}`} 
          className="search-results__item"
        >
          <div 
            className="search-results__content"
            onClick={() => onOpenDetail(false, contact)}
          >
            <div className="search-results__header">
              <div className="search-results__header-name">
                {contact.firstName} {contact.lastName}
              </div>
              <button
                className="search-results__header-copy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(true, contact);
                }}
              >
                <Copy size={16}/>
              </button>
            </div>

            <dl className="search-results__details">
              {contact.email && (
                <div className="search-results__details-section">
                  <dd>{contact.email}</dd>
                </div>
              )}
              {contact.phone && (
                <div className="search-results__details-section">
                  <dd>{contact.phone}</dd>
                </div>
              )}
              {contact.company?.name && (
                <div className="search-results__details-section">
                  <dd>{contact.company.name}</dd>
                </div>
              )}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}