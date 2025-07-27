// hooks/useUnsavedChanges.ts
"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseUnsavedChangesOptions {
  isDirty: boolean;
  isEditing: boolean;
  onSave: () => Promise<boolean>;
}

export function useUnsavedChanges({ 
  isDirty, 
  isEditing, 
  onSave 
}: UseUnsavedChangesOptions) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && isEditing) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isEditing]);

  // Intercept navigation attempts
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      if (isNavigatingRef.current) return;

      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Check if it's an internal navigation
      const isExternal = anchor.hostname !== window.location.hostname;
      const isDownload = anchor.hasAttribute('download');
      const isSamePageAnchor = href.startsWith('#');

      if (isExternal || isDownload || isSamePageAnchor) return;

      // If we have unsaved changes, prevent navigation and show modal
      if (isDirty && isEditing) {
        event.preventDefault();
        event.stopPropagation();
        setPendingNavigation(href);
        setShowModal(true);
        return false;
      }
    };

    document.addEventListener('click', handleLinkClick, true); // Use capture phase
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [isDirty, isEditing]);

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      const success = await onSave();
      if (success && pendingNavigation) {
        isNavigatingRef.current = true;
        router.push(pendingNavigation);
      } else if (!success) {
        toast.error('Failed to save changes');
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
      setShowModal(false);
      setPendingNavigation(null);
    }
  };

  const handleDiscardAndContinue = () => {
    if (pendingNavigation) {
      isNavigatingRef.current = true;
      router.push(pendingNavigation);
    }
    setShowModal(false);
    setPendingNavigation(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingNavigation(null);
  };

  return {
    showModal,
    isSaving,
    handleSaveAndContinue,
    handleDiscardAndContinue,
    handleCancel,
  };
}