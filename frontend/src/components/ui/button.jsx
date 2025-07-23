import React, { useRef } from "react";
import classNames from "classnames";

// Optional: throttle clicks to prevent rapid firing
const useThrottleClick = (callback, delay = 500) => {
  const lastCalled = useRef(0);
  return (...args) => {
    const now = Date.now();
    if (now - lastCalled.current >= delay) {
      lastCalled.current = now;
      callback(...args);
    }
  };
};

export const Button = ({
  children,
  onClick,
  variant = "default",
  className = "",
  type = "button",
  throttle = false,
  throttleDelay = 500,
  ...props
}) => {
  const throttledClick = useThrottleClick(onClick, throttleDelay);

  const baseStyles =
    "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    ghost: "text-gray-600 hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  };

  return (
    <button
      type={type}
      onClick={throttle ? throttledClick : onClick}
      className={classNames(baseStyles, variants[variant] || variants.default, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
