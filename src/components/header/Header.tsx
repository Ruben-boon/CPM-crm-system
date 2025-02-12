"use client";

import MenuLink from "./MenuLink";
import { Users, Briefcase, Calendar, FileText } from "lucide-react";
import { ThemeControls } from "./ThemeControls";

export default function Header() {
  return (
    <nav>
      <MenuLink title="Bookings" url="/bookings" icon={Calendar} />
      <MenuLink title="Companies" url="/companies" icon={Briefcase} />
      <MenuLink title="Contacts" url="/contacts" icon={Users} />
      <MenuLink title="Documents" url="/documents" icon={FileText} />
      <div style={{ marginTop: "auto" }}>
        <ThemeControls />
      </div>
    </nav>
  );
}
