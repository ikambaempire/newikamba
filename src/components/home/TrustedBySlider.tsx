import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import tangnestLogo from "@/assets/partners/tangnest.png";
import risingLogo from "@/assets/partners/rising-academies.png";
import umuravaLogo from "@/assets/partners/umurava.png";
import psfLogo from "@/assets/partners/psf.png";
import estatesrwLogo from "@/assets/partners/estatesrw.jpg";

const FALLBACK = [
  { name: "TangNest", logo: tangnestLogo },
  { name: "Rising Academies", logo: risingLogo },
  { name: "Umurava", logo: umuravaLogo },
  { name: "PSF", logo: psfLogo },
  { name: "EstatesRW", logo: estatesrwLogo },
];

const TrustedBySlider = () => {
  const [partners, setPartners] = useState<{ name: string; logo: string; website?: string | null }[]>(FALLBACK);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("partner_logos").select("name,logo_url,website_url,sort_order").eq("visible", true)
        .order("sort_order").order("created_at");
      if (data && data.length) {
        setPartners(data.map((p: any) => ({ name: p.name, logo: p.logo_url, website: p.website_url })));
      }
    })();
  }, []);

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
          {doubled.map((partner, i) => {
            const img = (
              <img src={partner.logo} alt={partner.name}
                className="max-h-full max-w-full object-contain" />
            );
            return (
              <div key={i} className="flex-shrink-0 h-16 w-44 flex items-center justify-center opacity-90 hover:opacity-100 transition-all duration-300">
                {partner.website ? <a href={partner.website} target="_blank" rel="noreferrer" className="h-full w-full flex items-center justify-center">{img}</a> : img}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBySlider;
