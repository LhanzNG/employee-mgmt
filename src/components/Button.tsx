import React from "react";

type ButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  className,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn ${className}`}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
