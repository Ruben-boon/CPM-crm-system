import Link from "next/link";

interface MenuLinkProps {
  title: string;
  url: string;
}

export default function MenuLink({ title, url }: MenuLinkProps) {
  return <Link href={url} className="menu-link-container">{title}</Link>;
}
