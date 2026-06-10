// Detect and convert social/video URLs into embeddable iframe sources.
// Returns { kind: "video" } for direct video files, { kind: "embed", src } for iframes.

export type MediaEmbed =
  | { kind: "video"; src: string }
  | { kind: "embed"; src: string; provider: "instagram" | "youtube" | "vimeo" | "tiktok" | "facebook" }
  | { kind: "none" };

export const resolveMedia = (url?: string | null): MediaEmbed => {
  if (!url) return { kind: "none" };
  const u = url.trim();
  if (!u) return { kind: "none" };

  // Direct video file
  if (/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(u)) return { kind: "video", src: u };

  try {
    const parsed = new URL(u);
    const host = parsed.hostname.replace(/^www\./, "");

    // Instagram reel/post/tv
    if (host.endsWith("instagram.com")) {
      const m = parsed.pathname.match(/\/(reel|p|tv|reels)\/([^/]+)/);
      if (m) {
        return { kind: "embed", provider: "instagram", src: `https://www.instagram.com/${m[1] === "reels" ? "reel" : m[1]}/${m[2]}/embed/captioned/` };
      }
    }

    // YouTube
    if (host.endsWith("youtube.com") || host === "youtu.be") {
      let id = "";
      if (host === "youtu.be") id = parsed.pathname.slice(1);
      else if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2];
      else id = parsed.searchParams.get("v") || "";
      if (id) return { kind: "embed", provider: "youtube", src: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1` };
    }

    // Vimeo
    if (host.endsWith("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id) return { kind: "embed", provider: "vimeo", src: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1` };
    }

    // TikTok
    if (host.endsWith("tiktok.com")) {
      const m = parsed.pathname.match(/\/video\/(\d+)/);
      if (m) return { kind: "embed", provider: "tiktok", src: `https://www.tiktok.com/embed/v2/${m[1]}` };
    }

    // Facebook video
    if (host.endsWith("facebook.com") || host === "fb.watch") {
      return { kind: "embed", provider: "facebook", src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&autoplay=true&muted=true` };
    }
  } catch {
    /* not a URL */
  }

  // Unknown — treat as video, will gracefully fall back to cover image
  return { kind: "video", src: u };
};
