"use client";
import { useState, useCallback, useRef, useEffect } from "react";

export function useLoadingCoordinator() {
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const pendingUpdatesRef = useRef<{[key: string]: boolean}>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Process updates in batches to avoid render loops
  const processUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const updates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = {};
      
      setLoadingItems(prev => {
        const newState = {...prev};
        
        // Apply all updates
        Object.entries(updates).forEach(([key, shouldLoad]) => {
          if (shouldLoad) {
            newState[key] = true;
          } else {
            delete newState[key];
          }
        });
        
        // Determine if anything is still loading
        const stillLoading = Object.keys(newState).length > 0;
        setIsLoading(stillLoading);
        
        return newState;
      });
    }, 0);
  }, []);
  
  // Register a loading item
  const startLoading = useCallback((itemKey: string) => {
    pendingUpdatesRef.current[itemKey] = true;
    processUpdates();
  }, [processUpdates]);
  
  // Unregister a loading item
  const finishLoading = useCallback((itemKey: string) => {
    pendingUpdatesRef.current[itemKey] = false;
    processUpdates();
  }, [processUpdates]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    isLoading,
    startLoading,
    finishLoading,
    loadingItems
  };
}