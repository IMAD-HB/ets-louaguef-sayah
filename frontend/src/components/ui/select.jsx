import React, { useCallback, useRef } from "react";
import classNames from "classnames";
import debounce from "lodash.debounce"; // Can be replaced with throttle or custom function

export const Select = ({
  value,
  onValueChange,
  onThrottleChange,       // Optional throttled handler
  throttleDelay = 300,    // Delay for throttling
  children,
  className = "",
  ...props
}) => {
  const throttledCallback = useRef();

  throttledCallback.current = useCallback(
    debounce((val) => {
      if (onThrottleChange) onThrottleChange(val);
    }, throttleDelay),
    [onThrottleChange, throttleDelay]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    onValueChange?.(val);
    if (onThrottleChange) throttledCallback.current(val);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={classNames(
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "transition duration-150 ease-in-out bg-white",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

export const SelectItem = ({ value, children, ...props }) => {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
};
