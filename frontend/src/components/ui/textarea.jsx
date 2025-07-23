import React, { useRef, useCallback } from "react";
import classNames from "classnames";
import debounce from "lodash.debounce"; // Optional: can replace with a custom one

export const Textarea = ({
  className = "",
  onChange,
  onThrottleChange,
  throttleDelay = 300,
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
    onChange?.(e);
    if (onThrottleChange) throttledCallback.current(e.target.value);
  };

  return (
    <textarea
      onChange={handleChange}
      className={classNames(
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "text-sm resize-y transition duration-150 ease-in-out",
        className
      )}
      rows={4}
      {...props}
    />
  );
};
