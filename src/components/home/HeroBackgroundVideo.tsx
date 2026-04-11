const HeroBackgroundVideo = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute left-1/2 top-1/2 min-h-full min-w-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
        poster=""
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,72%,14%)]/95 via-[hsl(217,72%,14%)]/88 to-[hsl(217,72%,14%)]/78" />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(217,72%,14%)]/80 via-[hsl(217,72%,14%)]/30 to-[hsl(217,72%,14%)]/20" />
    </div>
  );
};

export default HeroBackgroundVideo;
