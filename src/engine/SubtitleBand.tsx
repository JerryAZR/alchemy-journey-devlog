import { rgba, readableColor } from "polished";
import { useCurrentFrame } from "remotion";
import { useThemeColors } from "../calculate-metadata/theme";
import { textStyles } from "./clip-style";
import type { TimelineLine } from "./types";

/**
 * The subtitle band: the active line's text, bottom-center, on top of all
 * clips. Not a clip - engine chrome driven directly by the timeline. Lines
 * with `subtitle = false` in subtitles.toml are skipped. Authors keep the
 * bottom ~10% clear when an episode enables subtitles.
 */
export const SubtitleBand: React.FC<{ lines: TimelineLine[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const themeColors = useThemeColors();
  const line = lines.find(
    (l) => l.subtitle && frame >= l.startFrame && frame < l.endFrame,
  );
  if (!line) {
    return null;
  }

  // Shrink-to-fit: estimate display width in em (CJK-aware, no DOM
  // measuring) and scale the font down so reasonably long lines stay on one
  // line - a two-line wrap with a one-character orphan reads worse than a
  // slightly smaller font. Below the floor (24px) wrapping is accepted.
  const maxTextWidth = 1920 * 0.9 - 48; // band maxWidth minus horizontal padding
  const fit = maxTextWidth / (estimateEm(line.text) * 1.04);
  const fontSize = Math.max(24, Math.min(textStyles.body.fontSize as number, fit));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 20,
        display: "flex",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          ...textStyles.body,
          fontSize,
          maxWidth: "90%",
          textAlign: "center",
          color: readableColor(themeColors.background),
          backgroundColor: rgba(themeColors.background, 0.75),
          borderRadius: 12,
          padding: "10px 24px",
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

/** Display-width estimate in em: CJK/full-width ~1, ASCII ~0.55, space ~0.3. */
const estimateEm = (text: string) => {
  let em = 0;
  for (const ch of text) {
    em += ch.charCodeAt(0) > 0x2e7f ? 1 : ch === " " ? 0.3 : 0.55;
  }
  return em;
};
