"use client";
import { useState, useEffect } from "react";

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export function LoadingSpinner({
  isLoading,
}: LoadingSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false);
  const [spinnerColor, setSpinnerColor] = useState("#ff5722"); // Default orange color

  // Generate a random color when the spinner is shown
  useEffect(() => {
    if (isLoading) {
      // Array of bright, vibrant colors that work well with white text
      const colors = [
        "#ff5722", // Orange (like your logo)
      ];
      
      // Pick a random color from the array
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setSpinnerColor(randomColor);
    }
  }, [isLoading]);

  // Directly control spinner visibility based on isLoading
  useEffect(() => {
    setShowSpinner(isLoading);
  }, [isLoading]);

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