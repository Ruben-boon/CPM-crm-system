"use client";

import { useParams } from "next/navigation";
import { GenericDetailPage } from "@/components/generic/GenericDetailPage";
import { useContactsData } from "@/context/EnitityHooks";

export default function ContactDetailPage() {
  const context = useContactsData();
  const params = useParams();
  const contactId = params.id as string;

  return <GenericDetailPage itemId={contactId} context={context} />;
}