import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedIcon envuelve cualquier icono de Lucide con micro-interacciones (hover, tap, bounce, rotate, pulse).
 */
export function AnimatedIcon({ icon: Icon, className = "", hoverEffect = "bounce", size = 20, color }) {
  const variants = {
    bounce: { hover: { y: -3, scale: 1.15 } },
    rotate: { hover: { rotate: 18, scale: 1.1 } },
    pulse: { hover: { scale: 1.25 } },
    shake: { hover: { rotate: [0, -12, 12, -6, 6, 0] } }
  };

  const selectedVariant = variants[hoverEffect] || variants.bounce;

  return (
    <motion.div
      whileHover={selectedVariant.hover}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="inline-flex items-center justify-center cursor-pointer"
    >
      {Icon && <Icon size={size} className={className} color={color} />}
    </motion.div>
  );
}
