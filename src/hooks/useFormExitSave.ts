import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FormExitSaveOptions<T> {
  // The item being edited
  item: T | null;
  // Is the form in edit mode?
  isEditing: boolean;
  // Is the form dirty (has unsaved changes)?
  isDirty: boolean;
  // Function to save the item
  saveItem: (item: T) => Promise<boolean>;
  // For new items, function to create instead of update
  createItem?: (item: T) => Promise<boolean>;
  // Is this a new item?
  isNewItem?: boolean;
  // Optional callback after saving
  onSaveComplete?: (success: boolean) => void;
}

/**
 * Hook that saves form data ONLY when navigating away from the form
 * Not on every input change or state update
 */
export function useFormExitSave<T>({
  item,
  isEditing,
  isDirty,
  saveItem,
  createItem,
  isNewItem = false,
  onSaveComplete
}: FormExitSaveOptions<T>) {
  // Track if we've already attempted to save
  const hasSavedRef = useRef(false);
  const isNavigatingAwayRef = useRef(false);
  
  // Handle saving logic
  const saveForm = async (): Promise<boolean> => {
    if (!item || !isEditing || !isDirty || hasSavedRef.current) {
      return false;
    }
    
    // Only allow save during actual navigation events
    if (!isNavigatingAwayRef.current) {
      return false;
    }
    
    try {
      // Mark that we've attempted to save to prevent duplicate saves
      hasSavedRef.current = true;
      
      let success = false;
      
      if (isNewItem && createItem) {
        success = await createItem(item);
      } else {
        success = await saveItem(item);
      }
      
      if (success) {
        toast.success('Changes saved', { 
          duration: 2000,
          position: 'bottom-right'
        });
        
        if (onSaveComplete) onSaveComplete(true);
        return true;
      } else {
        if (onSaveComplete) onSaveComplete(false);
        return false;
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      if (onSaveComplete) onSaveComplete(false);
      return false;
    } finally {
      isNavigatingAwayRef.current = false;
    }
  };
  
  // Reset the save flag when item or edit mode changes
  useEffect(() => {
    hasSavedRef.current = false;
  }, [item, isEditing]);
  
  // Set up window beforeunload event to handle refreshes/closures
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && isDirty && item) {
        // Set the navigation flag
        isNavigatingAwayRef.current = true;
        
        // Try to save (async operation won't complete before unload)
        saveForm();
        
        // Standard browser confirmation dialog
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Save when unmounting if needed
      if (isEditing && isDirty && item) {
        isNavigatingAwayRef.current = true;
        saveForm();
      }
    };
  }, [isEditing, isDirty, item]);
  
  // Return functions that can be used by parent components
  return {
    // Method to manually initiate save on navigation
    saveOnNavigation: () => {
      isNavigatingAwayRef.current = true;
      return saveForm();
    },
    
    // Method to just mark that navigation is happening
    setNavigating: (isNavigating: boolean) => {
      isNavigatingAwayRef.current = isNavigating;
    }
  };
}