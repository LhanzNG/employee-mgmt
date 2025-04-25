import React from "react";

type TextAreaProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
};

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`textarea ${className}`}
    />
  );
};

export default TextArea;
