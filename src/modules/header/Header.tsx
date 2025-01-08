import MenuLink from "./MenuLink";

export default function Header() {
  return (
    <nav>
      <MenuLink title={"Contacts"} url={"/contacts"} />
      <MenuLink title={"Travelplans"} url={"/travelplans"} />
      <MenuLink title={"Locations"} url={"/locations"} />
    </nav>
  );
}
