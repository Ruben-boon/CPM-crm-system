"use client";
import { useState, useEffect, useRef } from "react";

interface LoadingSpinnerProps {
  isLoading: boolean;
  minDisplayTime?: number; // Minimum time in ms to show the spinner
}

export function LoadingSpinner({
  isLoading,
  minDisplayTime = 400, // Default to 800ms minimum display time
}: LoadingSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false);
  const spinnerColor = "#ff5722";
  const spinnerTimer = useRef<NodeJS.Timeout | null>(null);
  const spinnerStartTime = useRef<number>(0);

  useEffect(() => {
    // When loading starts
    if (isLoading && !showSpinner) {
      // Record the start time
      spinnerStartTime.current = Date.now();
      setShowSpinner(true);
    }
    // When loading ends
    else if (!isLoading && showSpinner) {
      // Calculate how long the spinner has been visible
      const elapsedTime = Date.now() - spinnerStartTime.current;
      
      // If it hasn't been visible for the minimum time, set a timer
      if (elapsedTime < minDisplayTime) {
        const remainingTime = minDisplayTime - elapsedTime;
        
        // Clear any existing timer
        if (spinnerTimer.current) {
          clearTimeout(spinnerTimer.current);
        }
        
        // Set new timer to hide spinner after remaining time
        spinnerTimer.current = setTimeout(() => {
          setShowSpinner(false);
        }, remainingTime);
      } else {
        // If it's been visible long enough, hide it immediately
        setShowSpinner(false);
      }
    }

    // Cleanup function
    return () => {
      if (spinnerTimer.current) {
        clearTimeout(spinnerTimer.current);
      }
    };
  }, [isLoading, showSpinner, minDisplayTime]);

  if (!showSpinner) return null;

  return (
    <div className="spinner-overlay">
      <span className="loader"></span>
      <style jsx>{`
        .spinner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f6f6f8;
          z-index: 1000;
        }
        .loader {
          width: 48px;
          height: 48px;
          margin: auto;
          position: relative;
        }
        .loader:before {
          content: "";
          width: 48px;
          height: 5px;
          background: #000;
          opacity: 0.15;
          position: absolute;
          top: 60px;
          left: 0;
          border-radius: 50%;
          animation: shadow 0.5s linear infinite;
        }
        .loader:after {
          content: "";
          width: 100%;
          height: 100%;
          background: ${spinnerColor};
          animation: bxSpin 0.5s linear infinite;
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 4px;
          z-index: 0;
        }
        @keyframes bxSpin {
          17% {
            border-bottom-right-radius: 3px;
          }
          25% {
            transform: translateY(9px) rotate(22.5deg);
          }
          50% {
            transform: translateY(18px) scale(1, 0.9) rotate(45deg);
            border-bottom-right-radius: 40px;
          }
          75% {
            transform: translateY(9px) rotate(67.5deg);
          }
          100% {
            transform: translateY(0) rotate(90deg);
          }
        }

        @keyframes shadow {
          0%,
          100% {
            transform: scale(1, 1);
          }
          50% {
            transform: scale(1.2, 1);
          }
        }
      `}</style>
    </div>
  );
}