import { useState, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  glareColor?: string;
}

const Card3D = ({ children, className = "", glareColor = "hsl(var(--accent))" }: Card3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRotateX((y - 0.5) * -12);
    setRotateY((x - 0.5) * 12);
    setGlareX(x * 100);
    setGlareY(y * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <motion.div
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative rounded-xl overflow-hidden"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glare layer */}
        <div
          className="absolute inset-0 z-10 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${glareColor}15 0%, transparent 60%)`,
          }}
        />
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Card3D;
