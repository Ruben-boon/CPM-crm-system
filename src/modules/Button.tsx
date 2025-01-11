import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

const Button: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  variant = 'md',
  className,
  ...props
}) => {
  return (
    <button
      className={`button button--${variant} ${className || ''} ${
        children ? 'button--with-text' : 'button--icon-only'
      }`}
      {...props}
    >
      {Icon && <Icon className="button-icon" />}
      {children}
    </button>
  );
};

export default Button;