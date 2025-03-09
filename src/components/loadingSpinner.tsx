"use client";
import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  isLoading: boolean;
  minDuration?: number;
}

export function LoadingSpinner({ isLoading, minDuration = 500 }: LoadingSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      setShowSpinner(true);
    } else if (showSpinner) {
      // When loading finishes, ensure spinner stays visible for minDuration
      timeoutId = setTimeout(() => {
        setShowSpinner(false);
      }, minDuration);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, minDuration, showSpinner]);
  
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
          background-color: white;
          z-index: 1000;
        }
        
        .loader {
          color: #black;
          font-size: 45px;
          text-indent: -9999em;
          overflow: hidden;
          width: 1em;
          height: 1em;
          border-radius: 50%;
          position: relative;
          transform: translateZ(0);
          animation: mltShdSpin 1.7s infinite ease, round 1.7s infinite ease;
        }
        
        @keyframes mltShdSpin {
          0% {
            box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
          }
          5%, 95% {
            box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
          }
          10%, 59% {
            box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;
          }
          20% {
            box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em, -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, -0.749em -0.34em 0 -0.477em;
          }
          38% {
            box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em, -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, -0.82em -0.09em 0 -0.477em;
          }
          100% {
            box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
          }
        }
        
        @keyframes round {
          0% {
            transform: rotate(0deg)
          }
          100% {
            transform: rotate(360deg)
          }
        }
      `}</style>
    </div>
  );
}