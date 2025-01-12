import { Copy } from "lucide-react";

interface SearchResultProps {
  searchList: any;
  onOpenDetail: (isNew: boolean, dataDetails: any) => void;
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
      {searchList.map((singleResult: any) => (
        <li key={singleResult._id} className="search-results__item">
          <div
            className="search-results__content"
            onClick={() => onOpenDetail(false, singleResult)}
          >
            <div className="search-results__header">
              <div className="search-results__header-name">
                {singleResult.general.firstName}
                {singleResult.general.LastName}
              </div>

              <button
                className="search-results__header-copy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(true, singleResult.general);
                }}
              >
                <Copy size={16} />
              </button>
            </div>

            <dl className="search-results__details">
              {singleResult.general.email && (
                <div className="search-results__details-section">
                  <dd>{singleResult.general.email}</dd>
                </div>
              )}
              {singleResult.general.phone && (
                <div className="search-results__details-section">
                  <dd>{singleResult.general.phone}</dd>
                </div>
              )}
              {singleResult.general.company?.name && (
                <div className="search-results__details-section">
                  <dd>{singleResult.general.company.name}</dd>
                </div>
              )}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}
