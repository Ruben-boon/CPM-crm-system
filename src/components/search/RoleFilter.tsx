import React from "react";

interface RoleFilterProps {
  bookerChecked: boolean;
  guestChecked: boolean;
  onBookerChange: (checked: boolean) => void;
  onGuestChange: (checked: boolean) => void;
}

export function RoleFilter({
  bookerChecked,
  guestChecked,
  onBookerChange,
  onGuestChange
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
    </div>
  );
}