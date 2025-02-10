import { Plus } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { contactSearchableFields } from "@/domain_old/contacts/contactModel";
import Button from "../common/Button";

interface contactSearchProps {
  handleSelectContact: (contact: any) => void;
  handleCopyContact: (contact: any) => void;
  handleCreateContact: () => void;
}

export function ContactSearch({
  handleSelectContact,
  handleCopyContact,
  handleCreateContact}:contactSearchProps
) {
  return (
    <div className="search-panel">
      <SearchBar searchableFields={contactSearchableFields} />

      <div className="button-container">
        <Button intent="ghost" icon={Plus} onClick={handleCreateContact}>
          Create new entry
        </Button>
      </div>

      <SearchResults
        passSelectContact={handleSelectContact}
        passCopyContact={handleCopyContact}
      />
    </div>
  );
}
