import React, { useRef } from "react";
import { Button } from "../ui/button";

const QuantitySelector = ({ value = 1, onChange, max = 99 }) => {
  const throttled = useRef(false);

  const throttle = (callback) => {
    if (throttled.current) return;
    throttled.current = true;
    callback();
    setTimeout(() => {
      throttled.current = false;
    }, 250); // throttle duration
  };

  const increment = () => {
    throttle(() => {
      if (value < max) onChange(value + 1);
    });
  };

  const decrement = () => {
    throttle(() => {
      if (value > 1) onChange(value - 1);
    });
  };

  return (
    <div
      className="flex items-center gap-2 rtl:flex-row-reverse"
      role="group"
      aria-label="تحديد الكمية"
    >
      <Button
        size="sm"
        variant="outline"
        onClick={decrement}
        aria-label="إنقاص الكمية"
      >
        -
      </Button>
      <span className="px-3 text-sm min-w-[2rem] text-center">{value}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={increment}
        aria-label="زيادة الكمية"
      >
        +
      </Button>
    </div>
  );
};

export default QuantitySelector;
