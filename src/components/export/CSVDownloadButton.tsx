"use client";

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { exportStaysToCSV } from "@/app/actions/exportActions";
import { toast } from "sonner";
import Button from "@/components/common/Button";

interface CSVDownloadButtonProps {
  className?: string;
  disabled?: boolean;
}

export function CSVDownloadButton({ 
  className = "", 
  disabled = false 
}: CSVDownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting || disabled) return;

    try {
      setIsExporting(true);
      
      // Show initial loading toast
      toast.loading("Preparing stays data for export...", {
        id: "csv-export"
      });

      // Call the server action
      const result = await exportStaysToCSV();

      if (result.success && result.data) {
        // Create and download the CSV file
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          
          // Generate filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          link.setAttribute('download', `stays-export-${timestamp}.csv`);
          
          // Hide the link and trigger download
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the URL object
          URL.revokeObjectURL(url);
        }

        // Show success toast
        toast.success(
          `Successfully exported ${result.recordCount || 0} stays to CSV`, 
          { id: "csv-export" }
        );
      } else {
        // Show error toast
        toast.error(
          result.error || "Failed to export stays data", 
          { id: "csv-export" }
        );
      }
    } catch (error) {
      console.error("Error during CSV export:", error);
      toast.error(
        "An unexpected error occurred during export", 
        { id: "csv-export" }
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || disabled}
      icon={FileSpreadsheet}
      intent="secondary"
      variant="md"
      className={className}
      title="Export all stays data to CSV"
    >
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
