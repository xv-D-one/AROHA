import React from "react";

const Button = ({
  children,
  type = "button",
  onClick,
  disabled = false,
  fullWidth = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        px-6 py-3
        rounded-xl
        font-medium
        text-primary
        bg-light
        transition-all duration-300 ease-in-out
        hover:bg-accent hover:text-white
        hover:scale-105
        active:scale-95
        shadow-md hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md" : ""}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>

      {/* Subtle animated background glow */}
      <span
        className="
          absolute inset-0
          bg-linear-to-r from-accent to-secondary
          opacity-0
          transition-opacity duration-300
          hover:opacity-20
        "
      />
    </button>
  );
};

export default Button;