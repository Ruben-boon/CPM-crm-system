// components/header/ThemeControls.tsx
"use client";
import { Palette, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { toast } from "sonner";
import {
  getUserPreferences,
  saveUserPreferences,
} from "@/app/actions/userPrefences";

export const ThemeControls = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [color, setColor] = useState("#F17827");
  const [fontSize, setFontSize] = useState("16px");
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from database when user is authenticated
  useEffect(() => {
    const loadPreferences = async () => {
      if (!userId) {
        // Fall back to localStorage if not logged in
        const savedColor = localStorage.getItem("accent-color");
        const savedSize = localStorage.getItem("font-size");

        if (savedColor) {
          setColor(savedColor);
          document.documentElement.style.setProperty(
            "--accent-color",
            savedColor
          );
        }
        if (savedSize) {
          setFontSize(savedSize);
          document.documentElement.style.setProperty("--font-size", savedSize);
        }

        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const prefs = await getUserPreferences(userId);

        if (prefs) {
          if (prefs.accentColor) {
            setColor(prefs.accentColor);
            document.documentElement.style.setProperty(
              "--accent-color",
              prefs.accentColor
            );
          }

          if (prefs.fontSize) {
            setFontSize(prefs.fontSize);
            document.documentElement.style.setProperty(
              "--font-size",
              prefs.fontSize
            );
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [userId]);

  const handleColorChange = async (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    document.documentElement.style.setProperty("--accent-color", newColor);

    // Save to both localStorage (for non-logged in state) and database (for persistence)
    localStorage.setItem("accent-color", newColor);

    if (userId) {
      try {
        const success = await saveUserPreferences(userId, {
          accentColor: newColor,
        });
        if (!success) {
          toast.error("Failed to save color preference");
        }
      } catch (error) {
        console.error("Error saving color preference:", error);
        toast.error("Failed to save color preference");
      }
    }
  };

  const handleFontSizeChange = async (e) => {
    const newSize = e.target.value + "px";
    setFontSize(newSize);
    document.documentElement.style.setProperty("--font-size", newSize);

    // Save to both localStorage and database
    localStorage.setItem("font-size", newSize);

    if (userId) {
      try {
        const success = await saveUserPreferences(userId, {
          fontSize: newSize,
        });
        if (!success) {
          toast.error("Failed to save font size preference");
        }
      } catch (error) {
        console.error("Error saving font size preference:", error);
        toast.error("Failed to save font size preference");
      }
    }
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="theme-controls">
      <div className="theme-controls__text">
        <Type size={20} />

        <input
          type="range"
          min="14"
          max="18"
          step="2"
          value={fontSize.replace("px", "")}
          onChange={handleFontSizeChange}
          style={{ width: "80px" }}
        />
      </div>
      <div className="theme-controls__color">
        <Palette size={20} />

        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          style={{
            width: "32px",
            height: "32px",
            padding: 0,
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
};
