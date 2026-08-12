import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

/**
 * Componente animado para números (ideal para dashboards, contadores de ingresos, citas o stock).
 */
export function SlidingNumber({ value, className = "", duration = 0.8, prefix = "", suffix = "" }) {
  const animatedValue = useSpring(0, {
    stiffness: 100,
    damping: 20,
    duration: duration,
  });

  const displayValue = useTransform(animatedValue, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    animatedValue.set(value);
  }, [value, animatedValue]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      {prefix && <span>{prefix}</span>}
      <motion.span>{displayValue}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
