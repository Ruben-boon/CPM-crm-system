"use client";
import React from "react";



import { X } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { StayModalContent } from "../stay/StayModalContent";
import { ContactModalContent } from "../contact/ContactModalContent";

export function ModalContainer() {
  const { isOpen, modalType, modalData, closeModal } = useModal();

  if (!isOpen) return null;

  // Render the appropriate modal content based on type
  const renderModalContent = () => {
    switch (modalType) {
      case "stay":
        return <StayModalContent data={modalData} onClose={closeModal} />;
      case "contact":
        return <ContactModalContent data={modalData} onClose={closeModal} />;
      default:
        return <div>Unknown modal type</div>;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{modalType === "stay" ? "Stay Details" : "Add Contact"}</h2>
          <button className="close-button" onClick={closeModal}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-content">{renderModalContent()}</div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-container {
          background-color: white;
          border-radius: 8px;

          max-width: 90%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background-color: #f0f0f0;
        }

        .modal-content {
          padding: 1.5rem;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}