import React from "react";

const ModernInput = ({
  label = "",
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  onFocus,
  onBlur,
  error = "",
  success = "",
  disabled = false,
  required = false,
  className = "",
  rows = 4,
  ...props
}) => {
  const inputClasses = [
    "form-input",
    error ? "border-error-500 focus:border-error-500" : "",
    success ? "border-success-500 focus:border-success-500" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const InputComponent = type === "textarea" ? "textarea" : "input";

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <InputComponent
        type={type === "textarea" ? undefined : type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={type === "textarea" ? rows : undefined}
        {...props}
      />

      {error && <div className="text-error-500 text-sm mt-1">{error}</div>}

      {success && (
        <div className="text-success-500 text-sm mt-1">{success}</div>
      )}
    </div>
  );
};

export default ModernInput;
