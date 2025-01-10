import { ChangeRecord } from "@/types/types";

interface DetailConfirmationProps {
  changes: Record<string, ChangeRecord>;
  onConfirm: () => void;
  onCancel: () => void;
}
export default function DetailConfirmation({
  onConfirm,
  onCancel,
}: DetailConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h2>Bevestig Wijzigingen</h2>
        {/* Changed fields display */}
        <div className="mt-6 flex justify-end space-x-2">
          <button onClick={onCancel}>Annuleren</button>
          <button onClick={onConfirm}>Bevestig Wijzigingen</button>
        </div>
      </div>
    </div>
  );
}
