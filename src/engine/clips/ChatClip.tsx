import { mix } from "polished";
import { useVideoConfig } from "remotion";
import {
  useAccentColor,
  useCardColor,
  useThemeColors,
} from "../../calculate-metadata/theme";
import { CardHeader } from "./CardHeader";
import {
  cardPadding,
  cardRadius,
  codeFontFamily,
  codeFontSize,
  codeLineHeight,
  lineHeightPx,
} from "../code-style";
import type { ChatClipDef, ChatStep, ClipComponent } from "../types";
import { resolveRectValue } from "../types";
import { useClipFrame } from "../useClipFrame";

export type ChatConfig = {
  typeSpeed?: number;
  streamLineDelay?: number;
  sendPause?: number;
  thinkingFrames?: number;
};

/** A single display line in the scrollback or the editor */
export type ChatLine = {
  role: "user" | "ai";
  text: string;
  /** First wrapped line of its message (user messages show ❯ only here) */
  first: boolean;
};

export type ChatState = {
  /** Wrapped scrollback lines, oldest first */
  scrollback: ChatLine[];
  /** Show a dim "Thinking..." beat after the scrollback */
  thinking: boolean;
  /** Editor box content (partially typed user message, wrapped) */
  editorLines: string[];
};

/**
 * Display width in terminal columns: CJK/full-width codepoints take 2
 * columns, everything else 1. Matches how monospace terminals render mixed
 * text - deterministic, no DOM measuring.
 */
export const displayColumns = (text: string) => {
  let cols = 0;
  for (const ch of text) {
    cols += ch.charCodeAt(0) > 0x2e7f ? 2 : 1;
  }
  return cols;
};

/**
 * Wrap text to `widthCh` display columns. Author's manual line breaks (\n)
 * are honored first; each paragraph then wraps greedily at any character
 * boundary (CJK text has no spaces to break on).
 */
export const wrapChatText = (text: string, widthCh: number): string[] => {
  if (widthCh < 8) {
    throw new Error(`wrapChatText: width ${widthCh}ch is too narrow`);
  }
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph === "") {
      out.push("");
      continue;
    }
    let line = "";
    let cols = 0;
    for (const ch of paragraph) {
      const w = ch.charCodeAt(0) > 0x2e7f ? 2 : 1;
      if (cols + w > widthCh && line !== "") {
        out.push(line);
        line = "";
        cols = 0;
      }
      // don't start a wrapped line with a space
      if (line === "" && ch === " ") continue;
      line += ch;
      cols += w;
    }
    if (line !== "") {
      out.push(line);
    }
  }
  return out;
};

/**
 * Pure frame math: the conversation state at `frame`. Steps run in order:
 * user messages type into the editor (typeSpeed chars/frame), rest
 * (sendPause), then jump to the scrollback; AI messages stream one wrapped
 * line per streamLineDelay; "thinking" shows a dim beat. Deterministic.
 */
export const chatStateAt = (
  steps: ChatStep[],
  config: ChatConfig,
  frame: number,
  widthCh: number,
): ChatState => {
  const typeSpeed = config.typeSpeed ?? 1;
  const streamLineDelay = config.streamLineDelay ?? 6;
  const sendPause = config.sendPause ?? 18;
  const thinkingFrames = config.thinkingFrames ?? 45;

  const state: ChatState = { scrollback: [], thinking: false, editorLines: [] };
  let remaining = Math.max(0, Math.floor(frame));

  for (const step of steps) {
    if (step.role === "thinking") {
      if (remaining < thinkingFrames) {
        state.thinking = true;
        return state;
      }
      remaining -= thinkingFrames;
      continue;
    }

    const wrapped = wrapChatText(step.text, widthCh);

    if (step.role === "ai") {
      const stepFrames = wrapped.length * streamLineDelay;
      if (remaining >= stepFrames) {
        wrapped.forEach((text, i) =>
          state.scrollback.push({ role: "ai", text, first: i === 0 }),
        );
        remaining -= stepFrames;
        continue;
      }
      const shown = Math.floor(remaining / streamLineDelay);
      for (let i = 0; i < shown; i++) {
        state.scrollback.push({ role: "ai", text: wrapped[i], first: i === 0 });
      }
      return state;
    }

    // user step: type -> pause -> send
    const typeFrames = Math.max(1, Math.ceil(step.text.length / typeSpeed));
    const stepFrames = typeFrames + sendPause;
    if (remaining >= stepFrames) {
      wrapped.forEach((text, i) =>
        state.scrollback.push({ role: "user", text, first: i === 0 }),
      );
      remaining -= stepFrames;
      continue;
    }
    const typedChars = Math.min(
      step.text.length,
      Math.floor(remaining * typeSpeed),
    );
    // Wrap the *partial* text for the editor
    state.editorLines = wrapChatText(step.text.slice(0, typedChars), widthCh);
    return state;
  }

  return state;
};

// Pane furniture heights (px), subtracted from the scrollback's budget
const EDITOR_MAX_LINES = 3;
const STATUS_BAR_HEIGHT = 34;
const DIVIDER_HEIGHT = 17; // 1px line + margins
const EDITOR_PADDING_Y = 10;
// The subtitle band overlays the bottom of any pane; keep the status bar
// above it (band top sits ~50px above an xl pane's bottom edge)
const SUBTITLE_SAFE_MARGIN = 60;

export const ChatClip: ClipComponent<ChatClipDef> = ({ clip }) => {
  const frame = useClipFrame(clip.transitionIn);
  const { height: compHeight, width: compWidth } = useVideoConfig();
  const themeColors = useThemeColors();
  const cardBackground = useCardColor();
  const accent = useAccentColor();

  if (clip.steps.length === 0) {
    throw new Error(`clip '${clip.id}': chat clip has no steps`);
  }
  if (!clip.rect) {
    throw new Error(`clip '${clip.id}': chat clip has no rect after resolution`);
  }

  // Pane pixel size from the rect (percentages resolve against the
  // composition) - pure math, no DOM measuring.
  const paneH = resolveRectValue(clip.rect.h, compHeight);
  const paneW = resolveRectValue(clip.rect.w, compWidth);

  // Fira Code's advance measures ~0.62em in the rendered frames (0.6em
  // on paper); the -2 safety margin absorbs font-fallback drift - wrapping
  // slightly early is harmless, wrapping late overflows the pane.
  const charWidthPx = codeFontSize * 0.62;
  const contentWidthPx = paneW - cardPadding * 2;
  const widthCh = Math.floor(contentWidthPx / charWidthPx) - 2;

  const editorHeight =
    EDITOR_MAX_LINES * lineHeightPx + EDITOR_PADDING_Y * 2;
  const scrollbackCapacity = Math.max(
    1,
    Math.floor(
      (paneH -
        editorHeight -
        STATUS_BAR_HEIGHT -
        DIVIDER_HEIGHT -
        SUBTITLE_SAFE_MARGIN -
        20) /
        lineHeightPx,
    ),
  );

  const state = chatStateAt(clip.steps, clip, frame, widthCh);
  const visible = state.scrollback.slice(-scrollbackCapacity);

  const textColor = themeColors.editor.foreground;
  const dimColor = mix(0.45, cardBackground, textColor);
  const dividerColor = mix(0.12, textColor, cardBackground);
  const blinkOn = Math.floor(frame / 15) % 2 === 0;

  const cursor = (
    <span
      style={{
        display: "inline-block",
        width: "0.6em",
        height: "1.1em",
        marginLeft: 2,
        verticalAlign: "text-bottom",
        backgroundColor: textColor,
        opacity: blinkOn ? 1 : 0,
      }}
    />
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: cardBackground,
        borderRadius: cardRadius,
        overflow: "hidden",
        fontFamily: codeFontFamily,
        fontSize: codeFontSize,
        lineHeight: codeLineHeight,
      }}
    >
      <CardHeader title="pi" icon="terminal" />
      {/* scrollback, bottom-anchored */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: `10px ${cardPadding}px 0`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {visible.map((line, i) => (
          <div
            key={i}
            style={{
              whiteSpace: "pre",
              color: line.role === "ai" ? mix(0.25, cardBackground, textColor) : textColor,
            }}
          >
            {line.role === "user" ? (
              line.first ? (
                <span style={{ color: accent }}>❯ </span>
              ) : (
                "  "
              )
            ) : null}
            {line.text}
          </div>
        ))}
        {state.thinking ? (
          <div style={{ color: dimColor, fontStyle: "italic" }}>
            Thinking...
          </div>
        ) : null}
      </div>
      {/* divider */}
      <div
        style={{
          height: 1,
          backgroundColor: dividerColor,
          margin: "8px 0",
        }}
      />
      {/* editor box */}
      <div
        style={{
          height: editorHeight,
          padding: `${EDITOR_PADDING_Y}px ${cardPadding}px`,
          color: textColor,
          whiteSpace: "pre",
        }}
      >
        <span style={{ color: accent }}>❯ </span>
        {state.editorLines.length === 0 ? cursor : null}
        {state.editorLines.map((text, i) => (
          <span key={i}>
            {i > 0 ? "\n" : ""}
            {text}
            {i === state.editorLines.length - 1 ? cursor : null}
          </span>
        ))}
      </div>
      {/* status bar */}
      <div
        style={{
          height: STATUS_BAR_HEIGHT,
          padding: `0 ${cardPadding}px`,
          color: mix(0.55, cardBackground, textColor),
          fontSize: codeFontSize * 0.7,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: "1.5ch",
          whiteSpace: "pre",
          overflow: "hidden",
        }}
      >
        <span style={{ color: "#22c55e" }}>●</span>
        <span>model: {clip.model ?? "kimi-k3"}</span>
        <span>|</span>
        <span>dir: {clip.cwd ?? "~\\Projects\\Bevy\\alchemy-journey"}</span>
        <span>|</span>
        <span>git: main</span>
      </div>
      {/* keep the status bar above the subtitle band */}
      <div style={{ height: SUBTITLE_SAFE_MARGIN - cardPadding }} />
    </div>
  );
};
