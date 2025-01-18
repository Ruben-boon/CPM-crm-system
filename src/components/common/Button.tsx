import React from "react";
import { LucideIcon, Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "sm" | "md" | "lg";
  intent?: "primary" | "secondary" | "outline" | "ghost";
  icon?: LucideIcon;
  isLoading?: boolean;
  iconAfter?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  variant = "md",
  intent = "primary",
  isLoading = false,
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
    if (isLoading) {
      return <Loader2 className="button-icon animate-spin" />;
    }
    if (Icon) {
      return <Icon className="button-icon" />;
    }
    return null;
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {!iconAfter && renderIcon()}
      {children}
      {iconAfter && renderIcon()}
    </button>
  );
};

export default Button;
