"use client";

import LayoutContainer from "./LayoutContainer";

const getReelVideoUrl = (url: string | null | undefined) => {
  if (!url || typeof url !== "string" || url.trim() === "" || url === "null") {
    return "/video1.mp4";
  }

  const shortsMatch = url.match(/shorts\/([^?]+)/);
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  const videoId = shortsMatch?.[1] || watchMatch?.[1];

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&playlist=${videoId}`;
  }

  return url;
};

export default function ServiceReels({ data }: { data?: any[] }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const reelList = data;

  return (
    <section className="mx-auto sm:px-0 py-8 sm:py-12 mb-6 sm:mb-10">
      <LayoutContainer className="relative">
        <h2 className="text-2xl font-bold text-gray-900">Service Reels</h2>
        <p className="text-gray-500 mb-5">Watch our experts in action</p>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-2">
          {reelList.map((reel, index) => {
            const videoSrc = getReelVideoUrl(reel.videoUrl);
            const isMp4 =
              videoSrc.toLowerCase().includes(".mp4") ||
              videoSrc.includes("/storage/reels/") ||
              videoSrc.startsWith("/");

            return (
              <div
                key={reel.id || index}
                className="w-[225px] sm:w-[235px] h-[400px] shrink-0 rounded-[32px] overflow-hidden bg-black relative shadow-xl border-4 border-neutral-900 transition-transform duration-300 hover:scale-[1.02]"
              >
                {isMp4 ? (
                  <video
                    src={videoSrc}
                    preload="metadata"
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={videoSrc}
                    title={reel.title || "Service Reel"}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}

                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white font-semibold text-sm pointer-events-none drop-shadow-md z-10">
                  {reel.title}
                </div>
              </div>
            );
          })}
        </div>

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </LayoutContainer>
    </section>
  );
}
