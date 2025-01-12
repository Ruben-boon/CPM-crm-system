import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'sm' | 'md' | 'lg';
  intent?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: LucideIcon;
}

const Button: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  variant = 'md',
  intent = 'primary',
  className,
  ...props
}) => {
  return (
    <button
      className={`
        button 
        button--${variant} 
        button--${intent}
        ${className || ''} 
        ${children ? 'button--with-text' : 'button--icon-only'}
      `}
      {...props}
    >
      {Icon && <Icon className="button-icon" />}
      {children}
    </button>
  );
};

export default Button;