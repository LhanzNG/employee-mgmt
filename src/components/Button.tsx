import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger"; // Added primary variant
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
}) => {
  const variantClass =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary/90"
      : variant === "outline"
      ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg flex items-center justify-center ${className} ${variantClass} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
