"use client";

import { GenericLayout } from "@/components/generic/GenericLayout";
import { ContactsProvider, useContactsData } from "@/context/EnitityHooks";

function ContactsLayoutContent({ children }) {
  const context = useContactsData();
  return <GenericLayout context={context}>{children}</GenericLayout>;
}

export default function ContactsLayout({ children }) {
  return (
    <ContactsProvider>
      <ContactsLayoutContent>{children}</ContactsLayoutContent>
    </ContactsProvider>
  );
}
