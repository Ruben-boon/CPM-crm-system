"use client";
import React, { ReactNode } from "react";
import { ModalProvider } from "../context/ModalContext";
import { ModalContainer } from "./common/ModalContainer";

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <ModalProvider>
      {children}
      <ModalContainer />
    </ModalProvider>
  );
}