import MenuLink from "./MenuLink";

export default function Header() {
  return (
    <header>
      <MenuLink title={"Contacts"} />
      <MenuLink title={"Travelplans"} />
      <MenuLink title={"Locations"} />
    </header>
  );
}
