import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlicedImageCarouselProps {
  images: { src: string; alt: string }[];
  slices?: number;
  autoPlayInterval?: number;
}

const SlicedImageCarousel = ({ images, slices = 9, autoPlayInterval = 4000 }: SlicedImageCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);
  };

  useEffect(() => {
    startAutoPlay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const navigate = (dir: number) => {
    setCurrent((prev) => (prev + dir + images.length) % images.length);
    startAutoPlay();
  };

  const sliceWidth = 100 / slices;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="absolute inset-0 flex"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {Array.from({ length: slices }).map((_, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  className="relative overflow-hidden"
                  style={{
                    width: `${sliceWidth}%`,
                    height: "100%",
                  }}
                  initial={{ 
                    y: isEven ? "100%" : "-100%",
                    opacity: 0,
                  }}
                  animate={{ 
                    y: "0%",
                    opacity: 1,
                  }}
                  exit={{
                    y: isEven ? "-100%" : "100%",
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {/* Each slice shows its portion of the full image */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${images[current].src})`,
                      backgroundSize: `${slices * 100}% 100%`,
                      backgroundPosition: `${(i / (slices - 1)) * 100}% center`,
                    }}
                  />
                  {/* Subtle gap effect */}
                  <div className="absolute inset-y-0 right-0 w-[2px] bg-background/30" />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-primary/60 to-transparent pointer-events-none" />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); startAutoPlay(); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-accent" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SlicedImageCarousel;
