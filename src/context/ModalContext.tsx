"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

// Types of modals available in the application
export type ModalType = "stay" | "contact" | null;

// Modal context type definition
interface ModalContextType {
  isOpen: boolean;
  modalType: ModalType;
  modalData: any;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
}

// Create context with default values
const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  modalType: null,
  modalData: null,
  openModal: () => {},
  closeModal: () => {},
});

// Provider component
export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Function to open a modal
  const openModal = (type: ModalType, data?: any) => {
    setModalType(type);
    setModalData(data || null);
    setIsOpen(true);
  };

  // Function to close the current modal
  const closeModal = () => {
    setIsOpen(false);
    // Clear the data after a slight delay to prevent UI flickers
    setTimeout(() => {
      setModalType(null);
      setModalData(null);
    }, 200);
  };

  return (
    <ModalContext.Provider
      value={{ isOpen, modalType, modalData, openModal, closeModal }}
    >
      {children}
    </ModalContext.Provider>
  );
}

// Custom hook to use modal context
export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
