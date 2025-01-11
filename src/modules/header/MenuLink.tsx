"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

interface MenuLinkProps {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export default function MenuLink({ title, url, icon: Icon }: MenuLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === url;
  
  return (
    <Link 
      href={url} 
      className={`menu-link ${isActive ? 'active' : ''} menu-link-container`}
    >
      {Icon && <Icon className="menu-link-icon" />}
      {title}
    </Link>
  );
}