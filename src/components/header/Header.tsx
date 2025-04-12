"use client";

import MenuLink from "./MenuLink";
import {
  Users,
  Briefcase,
  Calendar,
  Bed,
  Hotel,
  LogOut,
  LogIn,
} from "lucide-react";
import { ThemeControls } from "./ThemeControls";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <nav id="main-menu">
      {isAuthenticated ? (
        <>
          <MenuLink title="Bookings" url="/bookings" icon={Calendar} />
          <MenuLink title="Stays" url="/stays" icon={Bed} />
          <MenuLink title="Hotels" url="/hotels" icon={Hotel} />
          <MenuLink title="Companies" url="/companies" icon={Briefcase} />
          <MenuLink title="Contacts" url="/contacts" icon={Users} />
          <div className="user-section">
            <div className="user-info">
              {session?.user?.name || session?.user?.email}
            </div>
            <div className="log-section">
              <button className="logout-button" onClick={() => signOut()}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="log-section">
          <button className="login-button" onClick={() => signIn()}>
            Sign In
            <LogIn size={16} />
          </button>
        </div>
      )}

      <ThemeControls />
    </nav>
  );
}
