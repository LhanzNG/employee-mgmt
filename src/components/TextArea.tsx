import React from "react";

type TextAreaProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
};

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder = "",
  name = "",
  className = "",
  disabled = false,
}) => {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border px-3 py-2 rounded-lg w-full ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled}
    />
  );
};

export default TextArea;
