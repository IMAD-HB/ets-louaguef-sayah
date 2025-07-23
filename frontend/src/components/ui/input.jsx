import React, { useCallback, useRef } from "react";
import classNames from "classnames";
import debounce from "lodash.debounce"; // You can switch to throttle if needed

export const Input = ({
  type = "text",
  value,
  onChange,
  onThrottleChange, // Optional throttled handler
  placeholder = "",
  className = "",
  throttleDelay = 300, // ms delay for throttled change
  ...props
}) => {
  const throttledChange = useRef();

  // Throttled callback (debounced to avoid performance hit)
  const handleThrottledChange = useCallback(
    debounce((val) => {
      if (onThrottleChange) onThrottleChange(val);
    }, throttleDelay),
    [onThrottleChange, throttleDelay]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    onChange?.(e);
    if (onThrottleChange) handleThrottledChange(val);
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={classNames(
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "transition duration-150 ease-in-out",
        className
      )}
      {...props}
    />
  );
};

export default Input;
