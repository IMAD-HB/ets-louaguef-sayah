import React from "react";
import classNames from "classnames";

// Card Container
export const Card = ({ className = "", children, ...props }) => {
  return (
    <div
      className={classNames(
        "bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header
export const CardHeader = ({ className = "", children, ...props }) => {
  return (
    <div
      className={classNames(
        "p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title
export const CardTitle = ({ className = "", children, ...props }) => {
  return (
    <h3
      className={classNames(
        "text-lg font-semibold text-gray-800 tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

// Card Content
export const CardContent = ({ className = "", children, ...props }) => {
  return (
    <div
      className={classNames("p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};
