import React from "react";

const SectionTitle = ({
  title,
  subtitle,
  align = "center",
  className = "",
}) => {
  const alignment = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={`
        w-full flex flex-col gap-4 mb-12
        ${alignment[align]}
        ${className}
      `}
    >
      {/* Decorative Accent Line */}
      <div className="h-1 w-16 bg-accent rounded-full" />

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="max-w-2xl text-base md:text-lg text-secondary/80">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;