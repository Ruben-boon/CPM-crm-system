import React from "react";

interface RoleFilterProps {
  bookerChecked: boolean;
  guestChecked: boolean;
  supplierContactChecked: boolean;
  onBookerChange: (checked: boolean) => void;
  onGuestChange: (checked: boolean) => void;
  onSupplierContactChange: (checked: boolean) => void;
}

export function RoleFilter({
  bookerChecked,
  guestChecked,
  supplierContactChecked,
  onBookerChange,
  onGuestChange,
  onSupplierContactChange
}: RoleFilterProps) {
  return (
    <div className="role-filter">
      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={bookerChecked}
          onChange={(e) => onBookerChange(e.target.checked)}
        />
        <span className="checkbox-label">Bookers</span>
      </label>
      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={guestChecked}
          onChange={(e) => onGuestChange(e.target.checked)}
        />
        <span className="checkbox-label">Guests</span>
      </label>
      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={supplierContactChecked}
          onChange={(e) => onSupplierContactChange(e.target.checked)}
        />
        <span className="checkbox-label">SC</span>
      </label>
    </div>
  );
}