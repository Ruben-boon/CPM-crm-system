"use client";

import MenuLink from "./MenuLink";
import { Users, Briefcase, Calendar, FileText, Bed, Hotel } from "lucide-react";
import { ThemeControls } from "./ThemeControls";

export default function Header() {
  return (
    <nav id="main-menu">
      <MenuLink title="Bookings" url="/bookings" icon={Calendar} />
      <MenuLink title="Stays" url="/stays" icon={Bed} />

      <MenuLink title="Hotels" url="/hotels" icon={Hotel} />
      <MenuLink title="Companies" url="/companies" icon={Briefcase} />
      <MenuLink title="Contacts" url="/contacts" icon={Users} />
      <div style={{ marginTop: "auto" }}>
        <ThemeControls />
      </div>
    </nav>
  );
}
