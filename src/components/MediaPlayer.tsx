import { resolveMedia } from "@/lib/mediaEmbed";

type Props = {
  url?: string | null;
  poster?: string | null;
  title?: string;
  className?: string;
  controls?: boolean;
};

const MediaPlayer = ({ url, poster, title, className = "", controls = false }: Props) => {
  const m = resolveMedia(url);

  if (m.kind === "video") {
    return (
      <video
        src={m.src}
        autoPlay
        muted
        loop
        playsInline
        controls={controls}
        preload="metadata"
        poster={poster || undefined}
        className={className}
      />
    );
  }

  if (m.kind === "embed") {
    // Instagram embed always renders profile header + bottom action bar.
    // We hide them by oversizing the iframe and clipping the chrome away.
    if (m.provider === "instagram") {
      return (
        <div className={`${className} relative overflow-hidden bg-black`}>
          <iframe
            src={m.src}
            title={title || "Instagram video"}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            scrolling="no"
            // header ≈ 54px, footer ≈ 120px on IG embeds — push iframe up & extend height to crop both
            className="absolute left-0 w-full border-0 pointer-events-none"
            style={{ top: "-54px", height: "calc(100% + 180px)" }}
          />
        </div>
      );
    }

    return (
      <iframe
        src={m.src}
        title={title || "Embedded video"}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={`${className} border-0`}
        scrolling="no"
      />
    );
  }

  if (poster) return <img src={poster} alt={title || ""} className={className} loading="lazy" />;
  return null;
};

export default MediaPlayer;
