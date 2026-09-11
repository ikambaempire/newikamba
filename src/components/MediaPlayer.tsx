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
    // Zoom into the video area and cover any remaining chrome with a fade.
    if (m.provider === "instagram") {
      // Player-only mode: the Instagram iframe always ships a profile header and a
      // likes/comments action bar. We render it oversized inside a clipping box and
      // shift it so only the media area is inside the visible frame.
      return (
        <div className={`${className} relative overflow-hidden bg-black`}>
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src={m.src}
              title={title || "Instagram video"}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              scrolling="no"
              className="absolute left-1/2 top-1/2 border-0 pointer-events-none select-none"
              style={{
                width: "190%",
                height: "calc(190% + 420px)",
                transform: "translate(-50%, -50%) translateY(-40px)",
              }}
            />
          </div>
          {/* Chrome masks: header (avatar/username) and action bar (likes/comments) */}
          <div className="absolute inset-x-0 top-0 h-10 bg-black pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-black pointer-events-none" />
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
