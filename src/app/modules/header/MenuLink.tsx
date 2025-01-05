interface MenuLinkProps {
  title: string;
}

export default function MenuLink({ title }: MenuLinkProps) {
  return <div className="menu-link-container">{title}</div>;
}
