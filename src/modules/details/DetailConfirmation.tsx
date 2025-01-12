import React from "react";
import { ChangeRecord } from "@/types/types";

interface DetailConfirmationProps {
  changes?: Record<string, ChangeRecord>;
  title?: string;
  message?: string;
  confirm?: string;
  cancel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DetailConfirmation({
  changes,
  title = "Confirm changes",
  message,
  confirm = "Save changes",
  cancel = "Cancel",
  onConfirm,
  onCancel,
}: DetailConfirmationProps) {
  // Prevent clicks inside the dialog from bubbling up
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="detail-confirmation" onClick={onCancel}>
      <div className="confirmation-dialog" onClick={handleDialogClick}>
        <h2 className="confirmation-title">{title}</h2>

        {message && <p className="confirmation-message">{message}</p>}

        {changes && (
          <div className="changes-list">
            {Object.values(changes).map((change) => (
              <div key={change.fieldId} className="change-item">
                <p className="change-label">{change.label}</p>
                <p className="change-old">{change.oldValue || "Empty"}</p>
                <p className="change-new">{change.newValue || "Empty"}</p>
              </div>
            ))}
          </div>
        )}

        <div className="confirmation-actions">
          <button
            type="button"
            onClick={onCancel}
            className="button button-secondary"
          >
            {cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="button button-danger"
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// import { ChangeRecord } from "@/types/types";

// interface DetailConfirmationProps {
//   changes?: Record<string, ChangeRecord>;
//   title?: string;
//   message?: string;
//   confirm?: string;
//   cancel?: string;
//   onConfirm: () => void;
//   onCancel: () => void;
// }

// export default function DetailConfirmation({
//   changes,
//   title = "Confirm changes",
//   message,
//   confirm,
//   cancel,
//   onConfirm,
//   onCancel,
// }: DetailConfirmationProps) {
//   return (
//     <div className="detail-confirmation">
//       <div className="detail-confirmation__inner">
//         <h2 className="text-xl font-bold mb-4">{title}</h2>
//         {message && <p className="mb-6">{message}</p>}
//         {changes && (
//           <div className="max-h-96 overflow-y-auto mb-6">
//             {Object.values(changes).map((change) => (
//               <div key={change.fieldId} className="p-2 bg-gray-50 rounded">
//                 <p className="font-medium">{change.label}</p>
//                 <p className="text-red-500 line-through">{change.oldValue}</p>
//                 <p className="text-green-500">{change.newValue}</p>
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="mt-6 flex justify-end space-x-2">
//           <button onClick={onCancel} className="px-4 py-2 border rounded">
//             {cancel ? cancel : "cancel"}
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 bg-red-500 text-white rounded"
//           >
//             {confirm ? confirm : "Save changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
