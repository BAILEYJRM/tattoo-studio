import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedIcon envuelve cualquier icono de Lucide con micro-interacciones (bounce, rotate, pulse, shake).
 * Responde automáticamente a variantes 'hover' heredadas de componentes padres motion (botones/enlaces).
 */
export function AnimatedIcon({ icon: Icon, className = "", hoverEffect = "bounce", size = 20, color, isHovered }) {
  const iconVariants = {
    bounce: {
      rest: { y: 0, scale: 1, rotate: 0 },
      hover: { y: -3, scale: 1.2, transition: { type: "spring", stiffness: 450, damping: 14 } }
    },
    rotate: {
      rest: { rotate: 0, scale: 1 },
      hover: { rotate: 22, scale: 1.15, transition: { type: "spring", stiffness: 400, damping: 14 } }
    },
    pulse: {
      rest: { scale: 1 },
      hover: { scale: 1.25, transition: { type: "spring", stiffness: 450, damping: 14 } }
    },
    shake: {
      rest: { rotate: 0, scale: 1 },
      hover: { rotate: [0, -14, 14, -7, 7, 0], scale: 1.15, transition: { duration: 0.4 } }
    }
  };

  const selectedVariants = iconVariants[hoverEffect] || iconVariants.bounce;

  return (
    <motion.div
      variants={selectedVariants}
      animate={isHovered !== undefined ? (isHovered ? "hover" : "rest") : undefined}
      whileHover={isHovered === undefined ? selectedVariants.hover : undefined}
      className="inline-flex items-center justify-center flex-shrink-0 pointer-events-none"
    >
      {Icon && <Icon size={size} className={className} color={color} />}
    </motion.div>
  );
}
