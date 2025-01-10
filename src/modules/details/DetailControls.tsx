interface DetailControlsProps {
  isNew: boolean;
  isBulkEditing: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export default function DetailControls({
  isNew,
  isBulkEditing,
  hasChanges,
  onEdit,
  onSave,
  onDiscard,
}: DetailControlsProps) {
  return (
    <div className="flex justify-between mb-4">
      <button
        onClick={onEdit}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        disabled={isNew || hasChanges}
      >
        {isBulkEditing ? "Beëindig Bewerken" : "Bewerk Alles"}
      </button>

      {isBulkEditing && hasChanges && (
        <div className="flex gap-2">
          <button onClick={onDiscard}>Wijzigingen Annuleren</button>
          <button onClick={onSave}>Wijzigingen Opslaan</button>
        </div>
      )}
    </div>
  );
}
