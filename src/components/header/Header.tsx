"use client";

import MenuLink from "./MenuLink";
import { Users, Briefcase, Calendar, FileText } from "lucide-react";
import { ThemeControls } from "./ThemeControls";

export default function Header() {
  return (
    <nav>
      <MenuLink title="Contacts" url="/contacts" icon={Users} />
      <MenuLink
        title="Supplier Contact"
        url="/supplier-contacts"
        icon={Briefcase}
      />
      <MenuLink title="Bookings" url="/bookings" icon={Calendar} />
      <MenuLink title="Documents" url="/documents" icon={FileText} />
      <div style={{ marginTop: "auto" }}>
        <ThemeControls />
      </div>
    </nav>
  );
}
