import { useContactStore } from "@/store/contactsStore";
import { Copy } from "lucide-react";

interface SearchResultsProps {
  passSelectContact: (contact: any) => void;
  passCopyContact: (contact: any) => void;
}

export function SearchResults({
  passSelectContact,
  passCopyContact,
}: SearchResultsProps) {
  const { contacts, setSelectedContact } = useContactStore();

  if (contacts.length === 0) {
    return <div className="search-results__no-results">No results found</div>;
  }

  return (
    <ul className="search-results">
      {contacts.map((contact) => (
        <li key={contact._id} className="search-results__item">
          <div
            className="search-results__content"
            onClick={() => passSelectContact(contact)}
          >
            <div className="search-results__header">
              <div className="search-results__header-name">
                {`${contact.general.firstName} ${contact.general.lastName}`}
              </div>

              <button
                className="search-results__header-copy-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click
                  passCopyContact(contact);
                }}
              >
                <Copy size={16} />
              </button>
            </div>

            <dl className="search-results__details">
              {contact.general.email && (
                <div className="search-results__details-section">
                  <dd>{contact.general.email}</dd>
                </div>
              )}
              {contact.general.phone && (
                <div className="search-results__details-section">
                  <dd>{contact.general.phone}</dd>
                </div>
              )}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}
