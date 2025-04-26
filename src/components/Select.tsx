import React from "react";

type SelectProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  name?: string;
  className?: string;
  disabled?: boolean;
};

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  name = "",
  className = "",
  disabled = false,
}) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`border px-3 py-2 rounded-lg w-full ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
