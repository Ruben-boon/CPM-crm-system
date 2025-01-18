import { ForwardedRef, forwardRef } from "react";
import { FormField } from "@/types/types";
import DetailHandler from "./DetailHandler";

interface DetailContainerProps {
  isNew: boolean;
  initialFormFields: FormField[];
  type: string;
  onPendingChanges?: (hasPending: boolean) => void;
}

const DetailContainer = forwardRef(
  (
    {
      isNew = false,
      initialFormFields,
      type,
      onPendingChanges,
    }: DetailContainerProps,
    ref: ForwardedRef<{
      handleSave: () => Promise<void>;
      handleDiscard: () => void;
    }>
  ) => {
    return (
      <DetailHandler
        ref={ref}
        isNew={isNew}
        initialFormFields={initialFormFields}
        type={type}
        onPendingChanges={onPendingChanges}
      />
    );
  }
);

DetailContainer.displayName = "DetailContainer";

export default DetailContainer;
