import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "sm" | "md" | "lg";
  intent?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  icon?: LucideIcon;
  isLoading?: boolean; // kept for compatibility
  iconAfter?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  variant = "md",
  intent = "primary",
  isLoading: _isLoading = false, // unused
  iconAfter = false,
  className = "",
  disabled,
  ...props
}) => {
  const buttonClasses = [
    "button",
    `button--${variant}`,
    `button--${intent}`,
    children ? "button--with-text" : "button--icon-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    if (Icon) {
      return <Icon className="button-icon" />;
    }
    return null;
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {!iconAfter && renderIcon()}
      {children}
      {iconAfter && renderIcon()}
    </button>
  );
};

export default Button;