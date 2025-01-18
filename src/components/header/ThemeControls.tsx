import { Palette, Type } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";

export const ThemeControls = () => {
    const [color, setColor] = useState("#7c3aed");
    const [fontSize, setFontSize] = useState("16px");
  
    useEffect(() => {
      const savedColor = localStorage.getItem("accent-color");
      const savedSize = localStorage.getItem("font-size");
  
      if (savedColor) {
        setColor(savedColor);
        document.documentElement.style.setProperty("--accent-color", savedColor);
      }
      if (savedSize) {
        setFontSize(savedSize);
        document.documentElement.style.setProperty("--font-size", savedSize);
      }
    }, []);
  
    const handleColorChange = (e) => {
      const newColor = e.target.value;
      setColor(newColor);
      document.documentElement.style.setProperty("--accent-color", newColor);
      localStorage.setItem("accent-color", newColor);
    };
  
    const handleFontSizeChange = (e) => {
      const newSize = e.target.value + "px";
      setFontSize(newSize);
      document.documentElement.style.setProperty("--font-size", newSize);
      localStorage.setItem("font-size", newSize);
    };
  
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="range"
            min="14"
            max="18"
            step="2"
            value={fontSize.replace("px", "")}
            onChange={handleFontSizeChange}
            style={{ width: "80px" }}
          />
          <Type size={16} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
          <Palette size={16} />
        </div>
      </div>
    );
  };