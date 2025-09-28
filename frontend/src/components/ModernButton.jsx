import React from "react";

const ModernButton = ({
  children,
  variant = "primary",
  size = "base",
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClasses = "btn transition-fast";
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    outline: "btn-outline",
    ghost: "btn-ghost",
  };

  const sizeClasses = {
    xs: "btn-xs",
    sm: "btn-sm",
    base: "",
    lg: "btn-lg",
    xl: "btn-xl",
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || "",
    fullWidth ? "btn-full" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div
          className="loading-spinner"
          style={{ width: "1em", height: "1em" }}
        />
      )}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {!loading && <span className="btn-text">{children}</span>}
    </button>
  );
};

export default ModernButton;
