"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign in to your account</h1>
        <p>Choose your authentication provider:</p>
        <div className="auth-buttons">
          <button 
            onClick={() => handleSignIn('google')} 
            disabled={isLoading}
            className="google-signin-btn"
          >
            Sign in with Google
          </button>
          <button 
            onClick={() => handleSignIn('azure-ad')} 
            disabled={isLoading}
            className="microsoft-signin-btn"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
        }
        .auth-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h1 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }
        button {
          padding: 0.75rem 1rem;
          border-radius: 4px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .google-signin-btn {
          background-color: #4285F4;
          color: white;
        }
        .microsoft-signin-btn {
          background-color: #2F2F2F;
          color: white;
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}