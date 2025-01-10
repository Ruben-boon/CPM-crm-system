import { FormField } from "@/types/types";
import DetailHandler from "./DetailHandler";

interface DetailContainerProps {
  isNew: boolean;
  initialFormFields: FormField[];
  type: string;
}

export default function DetailContainer({
  isNew = false,
  initialFormFields,
  type,
}: DetailContainerProps) {
  return (
    <DetailHandler
      isNew={isNew}
      initialFormFields={initialFormFields}
      type={type}
    />
  );
}
