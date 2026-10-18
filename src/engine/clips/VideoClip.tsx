import { mix, readableColor } from "polished";
import { Loop, OffthreadVideo, staticFile } from "remotion";
import { useCardColor, useThemeColors } from "../../calculate-metadata/theme";
import { cardRadius } from "../code-style";
import { useEpisodeName } from "../EpisodeNameContext";
import type { ClipComponent, VideoClipDef } from "../types";

export const VideoClip: ClipComponent<VideoClipDef> = ({ clip }) => {
  const themeColors = useThemeColors();
  const episode = useEpisodeName();
  const cardBackground = useCardColor();

  if (!clip.src) {
    throw new Error(`clip '${clip.id}': video clip has no src`);
  }

  const cardBorder = mix(
    0.12,
    readableColor(themeColors.background),
    themeColors.background,
  );

  // The clip's Sequence window already aligns playback to startFrame/endFrame;
  // trimBefore only skips into the recording itself.
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: cardBackground,
        border: `1px solid ${cardBorder}`,
        borderRadius: cardRadius,
        overflow: "hidden",
      }}
    >
      {/* OffthreadVideo (Rust compositor extracts frames server-side) instead
          of @remotion/media Video: in-browser decoding saturated the render
          tab's event loop, which starved the module-scope font load and
          killed renders mid-run with a delayRender timeout.
          OffthreadVideo has no loop prop; Loop wraps the clip window. */}
      {(() => {
        const video = (
          <OffthreadVideo
            src={staticFile(`${episode}/video/${clip.src}`)}
            trimBefore={clip.startFrom ?? 0}
            playbackRate={clip.playbackRate ?? 1}
            muted={clip.muted ?? true}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        );
        return (clip.loop ?? false) ? (
          <Loop durationInFrames={clip.endFrame - clip.startFrame}>
            {video}
          </Loop>
        ) : (
          video
        );
      })()}
    </div>
  );
};
