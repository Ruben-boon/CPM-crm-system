"use client";

import { CSVDownloadButton } from "@/components/export/CSVDownloadButton";
import { FileSpreadsheet, Users, Calendar, Building, Bed } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="export-page">
      <div className="export-container">
        <div className="export-header">
          <h1>Data Export</h1>
          <p className="export-description">
            Export your CRM data in various formats for analysis, reporting, or backup purposes.
          </p>
        </div>

        <div className="export-sections">
          <div className="export-section">
            <div className="export-section-header">
              <div className="export-section-icon">
                <Bed className="w-6 h-6" />
              </div>
              <div className="export-section-info">
                <h3>Stays Export</h3>
                <p>Export all stays data with guest information, booking details, and pricing information.</p>
              </div>
            </div>
            <div className="export-section-actions">
              <CSVDownloadButton />
            </div>
          </div>

          {/* <div className="export-section">
            <div className="export-section-header">
              <div className="export-section-icon">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="export-section-info">
                <h3>Bookings Export</h3>
                <p>Export booking information with stay summaries and customer details.</p>
              </div>
            </div>
            <div className="export-section-actions">
              <button 
                className="export-button-disabled"
                disabled
                title="Coming soon"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div> */}

          {/* <div className="export-section">
            <div className="export-section-header">
              <div className="export-section-icon">
                <Users className="w-6 h-6" />
              </div>
              <div className="export-section-info">
                <h3>Contacts Export</h3>
                <p>Export contact information and customer details.</p>
              </div>
            </div>
            <div className="export-section-actions">
              <button 
                className="export-button-disabled"
                disabled
                title="Coming soon"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div> */}

          {/* <div className="export-section">
            <div className="export-section-header">
              <div className="export-section-icon">
                <Building className="w-6 h-6" />
              </div>
              <div className="export-section-info">
                <h3>Companies Export</h3>
                <p>Export company information and business details.</p>
              </div>
            </div>
            <div className="export-section-actions">
              <button 
                className="export-button-disabled"
                disabled
                title="Coming soon"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
