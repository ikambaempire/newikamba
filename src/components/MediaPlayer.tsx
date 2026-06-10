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
