"use client";
import { useState, useEffect } from "react";

interface LoadingSpinnerProps {
  minDisplayTime?: number;
}

export function LoadingSpinner({ minDisplayTime = 1500 }: LoadingSpinnerProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  if (!visible) return null;

  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <style jsx>{`
        .loading-spinner-overlay {
          position: absolute;
          border-radius:12px;
          top: 0;
          left: 0;
          right:0;
          left:0;
          background-color: #f6f6f8;
          display: flex;
          justify-content: center;
          z-index: 1000;
          height:100vh;
        }
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #F17826;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}