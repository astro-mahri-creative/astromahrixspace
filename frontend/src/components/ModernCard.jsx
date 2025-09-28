import React from "react";

const ModernCard = ({
  children,
  header = null,
  footer = null,
  className = "",
  hover = true,
  ...props
}) => {
  const classes = [
    "card",
    hover ? "transition-base hover:-translate-y-1" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {header && <div className="card-header">{header}</div>}

      <div className="card-body">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default ModernCard;
