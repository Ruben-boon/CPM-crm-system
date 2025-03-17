"use client";

import { useEffect, useState } from "react";
import { searchDocuments } from "@/app/actions/crudActions";
import { DynamicForm } from "./DynamicForm";
import { GenericDataContextType } from "@/context/GenericDataContext";

interface GenericDetailPageProps {
  itemId: string;
  context: GenericDataContextType;
}

export function GenericDetailPage({ itemId, context }: GenericDetailPageProps) {
    const { selectItem, entityConfig } = context;
    const [isLoading, setIsLoading] = useState(true);
    // Use React's useRef to maintain a counter without triggering rerenders
    const loadAttemptsRef = useRef(0);
    const MAX_ATTEMPTS = 3;
    // Use a state to force a "stopped" state after max attempts
    const [loadingStopped, setLoadingStopped] = useState(false);
  
    useEffect(() => {
      // Important: Reset the attempt counter when the ID changes
      if (loadAttemptsRef.current > 0) {
        loadAttemptsRef.current = 0;
        setLoadingStopped(false);
      }
      
      const loadItem = async () => {
        // Skip if we've already hit max attempts
        if (loadAttemptsRef.current >= MAX_ATTEMPTS) {
          console.warn(`Max load attempts (${MAX_ATTEMPTS}) reached for ${entityConfig.name} ${itemId}, stopping.`);
          setLoadingStopped(true);
          setIsLoading(false);
          return;
        }
        
        loadAttemptsRef.current += 1;
        console.log(`[${new Date().toISOString()}] Attempting to load ${entityConfig.name} with ID: ${itemId}, attempt ${loadAttemptsRef.current}/${MAX_ATTEMPTS}`);
        
        setIsLoading(true);
  
        try {
          // "new" case should always work without API calls
          if (itemId === "new") {
            selectItem({}, true);
            setIsLoading(false);
            return;
          }
          
          // MOCK MODE: Temporarily disable real API calls to stop the loop
          const USE_MOCK_MODE = true;
          
          if (USE_MOCK_MODE) {
            console.log(`Using mock mode to break load cycle for ${entityConfig.name} ${itemId}`);
            // Create a minimal mock item
            selectItem({ 
              _id: itemId,
              // Add minimum required fields based on entity type
              ...(entityConfig.name === 'contacts' ? { 
                general: { 
                  firstName: "Loading Failed", 
                  lastName: "Please Refresh", 
                  role: "guest" 
                } 
              } : {}),
              ...(entityConfig.name === 'companies' ? { name: "Loading Failed - Please Refresh" } : {}),
              ...(entityConfig.name === 'hotels' ? { name: "Loading Failed - Please Refresh" } : {}),
              ...(entityConfig.name === 'stays' ? { reference: "Loading Failed - Please Refresh" } : {})
            });
            setIsLoading(false);
          } else {
            try {
              const result = await searchDocuments(
                entityConfig.name,
                itemId,
                "_id"
              );
              
              if (Array.isArray(result) && result.length > 0) {
                selectItem(result[0]);
              } else {
                console.error(`${entityConfig.displayName} not found`);
                selectItem({
                  _id: itemId,
                  notFound: true
                });
              }
            } catch (error) {
              console.error(`Error loading ${entityConfig.displayName.toLowerCase()}:`, error);
              // On failure, create a placeholder item with just the ID
              selectItem({ 
                _id: itemId,
                loadError: true
              });
            }
            setIsLoading(false);
          }
        } catch (error) {
          console.error(`Unexpected error in GenericDetailPage:`, error);
          setIsLoading(false);
          
          if (loadAttemptsRef.current >= MAX_ATTEMPTS) {
            setLoadingStopped(true);
          }
        }
      };
  
      // Only attempt to load if not already stopped
      if (!loadingStopped) {
        loadItem();
      }
    }, [itemId, entityConfig.name, entityConfig.displayName, selectItem, loadingStopped]);
  
    // After reaching max attempts, show an error page
    if (loadingStopped) {
      return (
        <div className="error-page">
          <h2>Unable to load {entityConfig.displayName}</h2>
          <p>There was a problem loading the data. The server might be unavailable.</p>
          <div className="error-actions">
            <button 
              onClick={() => window.location.href = `/${entityConfig.name}`}
              className="button"
            >
              Return to List
            </button>
            <button 
              onClick={() => {
                loadAttemptsRef.current = 0;
                setLoadingStopped(false);
              }}
              className="button"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <>
        {isLoading ? (
          <div className="gray-screen">
            <div className="loading-indicator">Loading...</div>
          </div>
        ) : (
          <DynamicForm context={context} />
        )}
      </>
    );
  }