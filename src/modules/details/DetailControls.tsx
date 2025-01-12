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
      {!isBulkEditing && !hasChanges && (
        <button
          onClick={onEdit}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={isNew || hasChanges}
        >
          {isBulkEditing ? "Cancel editing" : "Edit"}
        </button>
      )}
      {isBulkEditing && hasChanges && (
        <div className="flex gap-2">
          <button onClick={onDiscard}>
            {isNew ? "Clear input fields" : "Discard changes"}
          </button>
          <button onClick={onSave}>
            {isNew ? "Create database entry" : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
}
