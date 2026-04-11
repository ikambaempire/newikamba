import { motion } from "framer-motion";
import tangnestLogo from "@/assets/partners/tangnest.png";
import risingLogo from "@/assets/partners/rising-academies.png";
import umuravaLogo from "@/assets/partners/umurava.png";
import psfLogo from "@/assets/partners/psf.png";
import estatesrwLogo from "@/assets/partners/estatesrw.jpg";

const partners = [
  { name: "TangNest", logo: tangnestLogo },
  { name: "Rising Academies", logo: risingLogo },
  { name: "Umurava", logo: umuravaLogo },
  { name: "PSF", logo: psfLogo },
  { name: "EstatesRW", logo: estatesrwLogo },
];

const TrustedBySlider = () => {
  const doubled = [...partners, ...partners, ...partners];

  return (
    <section className="py-14 bg-background border-y border-border overflow-hidden">
      <p className="text-center text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-10">
        Trusted by Organizations Across Africa
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <motion.div
          className="flex gap-16 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((partner, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-16 w-44 flex items-center justify-center opacity-90 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBySlider;
