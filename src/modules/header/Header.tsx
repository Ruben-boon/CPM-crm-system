"use client";

import MenuLink from "./MenuLink";
import { Users, Map, Plane} from "lucide-react";
import { ThemeControls } from "./ThemeControls";

export default function Header() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      <MenuLink title="Contacts" url="/contacts" icon={Users} />
      <MenuLink title="Travelplans" url="/travelplans" icon={Plane} />
      <MenuLink title="Locations" url="/locations" icon={Map} />
      <div style={{ marginTop: "auto" }}>
        <ThemeControls />
      </div>
    </nav>
  );
}
