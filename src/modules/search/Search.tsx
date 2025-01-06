"use client";

import { useState } from "react";
import sampleData from "../../DUMMY_MONGO";
// import CreateDocument from "./CreateDocument";

interface Contact {
  type: string[];
  company: {
    name: string;
    vatNumber: string;
    entity: string;
    entityAddress: string;
    currency: string[];
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    houseNumber: string;
    zipCode: string;
    country: string;
  };
  birthday: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function Search({
  onSelectContact,
  onCreateContact,
}: {
  onSelectContact: (contact: any) => void;
  onCreateContact: (contact: any) => void;
}) {
  const [searchKey, setSearchKey] = useState<keyof Contact>("lastName"); // Default filter
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const filteredContacts = sampleData.contacts.filter(
        (contact: Contact) => {
          const value = searchKey.includes(".")
            ? searchKey
                .split(".")
                .reduce((acc: any, key: string) => acc?.[key], contact)
            : contact[searchKey];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        }
      );
      setResults(filteredContacts);
      setLoading(false);
    }, 500); // Simulate a delay for loading
  };

  return (
    <div className="search-area">
      <div className="search-container">
        {/* Searchbar */}
        <div className="searchbar">
          <input
            type="text"
            placeholder={`Search by ${searchKey}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Search on Enter
          />
        </div>

        {/* Search Filter */}
        <div className="searchfilter">
          <label htmlFor="filter">Filter by:</label>
          <select
            id="filter"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value as keyof Contact)}
          >
            <option value="lastName">Last Name</option>
            <option value="firstName">First Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="company.name">Company Name</option>
          </select>
        </div>
      </div>
      {/* Add contact */}

      <div className="create-contact create-document">
        <strong>
          <p onClick={() => onCreateContact()}>create</p>
        </strong>
      </div>

      {/* Search Results */}
      <div className="search-results">
        {loading ? (
          <p>Loading...</p>
        ) : results.length > 0 ? (
          <ul>
            {results.map((contact, index) => (
              <li
                key={index}
                onClick={() => onSelectContact(contact)} // Send selected contact to parent
                style={{ cursor: "pointer" }}
              >
                <p>
                  <strong>
                    {contact.firstName} {contact.lastName}
                  </strong>
                </p>
                <p>Email: {contact.email}</p>
                <p>Phone: {contact.phone}</p>
                <p>Company: {contact.company?.name}</p>
                <strong>
                  <p
                    onClick={() => onCreateContact(contact)} // Send selected contact to parent
                    style={{ cursor: "pointer" }}
                  >
                    Copy contact
                  </p>
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}
