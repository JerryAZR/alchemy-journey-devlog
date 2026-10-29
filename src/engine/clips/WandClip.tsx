import { Img, interpolate, spring, staticFile, useVideoConfig } from "remotion";
import { mix } from "polished";
import { useAccentColor, useThemeColors } from "../../calculate-metadata/theme";
import { cardRadius, codeFontFamily } from "../code-style";
import type { ClipComponent, WandClipDef } from "../types";
import { useClipFrame } from "../useClipFrame";

const CELL = 148;
const GAP = 14;
const ARC_H = 30;
const BRACKET_H = 34;
const NOTE_H = 44;
/** Frames between consecutive consumed-cell highlights inside a step */
const CONSUME_STAGGER = 6;
const CELL_POP = 12;

export type WandRenderState = {
  stepIndex: number;
  /** Clip-local frame at which the current step started */
  stepFrame: number;
};

/**
 * Pure frame math: which step is active at a clip-local frame. Steps start
 * every `stepInterval` frames (default 60), compressed (never stretched)
 * when the window is too short, so the last step always starts inside the
 * clip. Same convention as code chains and animated lists.
 */
export const wandStepAt = (
  frame: number,
  stepCount: number,
  stepInterval: number | undefined,
  durationFrames: number,
): WandRenderState => {
  if (stepCount <= 0) {
    return { stepIndex: -1, stepFrame: 0 };
  }
  const requested = Math.max(1, stepInterval ?? 60);
  const fitsInWindow = Math.max(
    1,
    Math.floor((Math.max(1, durationFrames) - 1) / Math.max(1, stepCount - 1)),
  );
  const interval = Math.min(requested, fitsInWindow);
  const stepIndex = Math.min(Math.floor(frame / interval), stepCount - 1);
  return { stepIndex, stepFrame: frame - stepIndex * interval };
};

/**
 * A wand: one row of vector slots (Noita icons and/or text labels), a
 * cursor bracket resting on a cell, and per-step cast highlights. The
 * recurring visual for stepping mechanics - Noita's wand example, our
 * stepping cards, the Eval bug, sparse wands, grouping.
 */
export const WandClip: ClipComponent<WandClipDef> = ({ clip }) => {
  const frame = useClipFrame(clip.transitionIn);
  const { fps } = useVideoConfig();
  const themeColors = useThemeColors();
  const accent = useAccentColor();

  const durationFrames = clip.endFrame - clip.startFrame;
  const { stepIndex, stepFrame } = wandStepAt(
    frame,
    clip.steps.length,
    clip.stepInterval,
    durationFrames,
  );
  const step = clip.steps[stepIndex];
  const cursor = (step?.cursor ?? clip.initialCursor ?? 1) - 1;
  const prevCursor =
    (stepIndex > 0
      ? clip.steps[stepIndex - 1].cursor
      : (clip.initialCursor ?? 1)) - 1;

  const textColor = themeColors.editor.foreground;
  const cardBg = themeColors.editor.background;
  const dimColor = mix(0.45, cardBg, textColor);
  const borderColor = mix(0.75, cardBg, textColor);

  const totalW = clip.slots.length * CELL + (clip.slots.length - 1) * GAP;
  const totalH = ARC_H + CELL + BRACKET_H + NOTE_H;

  // The cursor bracket slides between resting positions
  const cursorSlide = spring({
    frame: stepFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const cursorX =
    prevCursor + (cursor - prevCursor) * cursorSlide;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: totalW, height: totalH }}>
        {/* cells (slot numbers sit in the top-left corner, clear of the wrap arc) */}
        {clip.slots.map((slot, i) => {
          const consumeIndex = step?.consume?.indexOf(i + 1) ?? -1;
          // Scanned cells light first (the walk), then consumed cells
          const scanIndex = step?.scan?.indexOf(i + 1) ?? -1;
          const scanCount = step?.scan?.length ?? 0;
          const lit =
            consumeIndex >= 0
              ? interpolate(
                  stepFrame,
                  [
                    (scanCount + consumeIndex) * CONSUME_STAGGER,
                    (scanCount + consumeIndex) * CONSUME_STAGGER + CELL_POP,
                  ],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                )
              : 0;
          const scanned =
            scanIndex >= 0
              ? interpolate(
                  stepFrame,
                  [scanIndex * CONSUME_STAGGER, scanIndex * CONSUME_STAGGER + CELL_POP],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                )
              : 0;
          return (
            <div
              key={`c${i}`}
              style={{
                position: "absolute",
                top: ARC_H,
                left: i * (CELL + GAP),
                width: CELL,
                height: CELL,
                borderRadius: cardRadius,
                background: slot.empty
                  ? "transparent"
                  : `color-mix(in srgb, ${cardBg} 88%, ${accent} ${Math.round(lit * 12)}%)`,
                border: slot.empty
                  ? `2px dashed ${scanned > 0 ? accent : dimColor}`
                  : `2px solid ${lit > 0 ? accent : scanned > 0.5 ? mix(0.5, cardBg, accent) : borderColor}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {slot.icon ? (
                <Img
                  src={staticFile(`shared/noita-spells/${slot.icon}`)}
                  style={{ width: 84, height: 84 }}
                />
              ) : null}
              {slot.label ? (
                <div
                  style={{
                    fontFamily: codeFontFamily,
                    fontSize: 21,
                    color: lit > 0.5 ? accent : textColor,
                  }}
                >
                  {slot.label}
                </div>
              ) : null}
              {/* slot number (1-based, matching the narration) */}
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: 10,
                  fontFamily: codeFontFamily,
                  fontSize: 15,
                  color: dimColor,
                }}
              >
                {i + 1}
              </div>
              {/* per-node energy cost (universal ⚡ energy convention) */}
              {slot.cost !== undefined ? (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 10,
                    fontFamily: codeFontFamily,
                    fontSize: 16,
                    color: "#f5c542",
                  }}
                >
                  ⚡{slot.cost}
                </div>
              ) : null}
            </div>
          );
        })}

        {/* wrap arc: the scan crossed the vector end */}
        {step?.wrap ? (
          <svg
            width={totalW}
            height={ARC_H}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <path
              d={`M ${(clip.slots.length - 0.5) * (CELL + GAP) - GAP} ${ARC_H - 2} C ${totalW * 0.7} -10, ${totalW * 0.3} -10, ${CELL / 2} ${ARC_H - 2}`}
              fill="none"
              stroke={accent}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              opacity={interpolate(stepFrame, [8, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            />
          </svg>
        ) : null}

        {/* cursor bracket under the resting cell */}
        <div
          style={{
            position: "absolute",
            top: ARC_H + CELL + 8,
            left: cursorX * (CELL + GAP),
            width: CELL,
            height: 10,
            borderLeft: `4px solid ${accent}`,
            borderRight: `4px solid ${accent}`,
            borderBottom: `4px solid ${accent}`,
            borderRadius: "0 0 6px 6px",
          }}
        />

        {/* step note */}
        {step?.note ? (
          <div
            key={stepIndex}
            style={{
              position: "absolute",
              top: ARC_H + CELL + BRACKET_H,
              width: totalW,
              textAlign: "center",
              fontFamily: codeFontFamily,
              fontSize: 24,
              color: textColor,
              opacity: interpolate(stepFrame, [0, 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {step.note}
          </div>
        ) : null}
      </div>
    </div>
  );
};
