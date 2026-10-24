import type { FC } from "react";

export type RectValue = number | `${number}%`;

export type Rect = {
  x: RectValue;
  y: RectValue;
  w: RectValue;
  h: RectValue;
};

/** Resolves a rect value against an absolute dimension (px or "NN%") */
export const resolveRectValue = (value: RectValue, dimension: number): number => {
  if (typeof value === "number") {
    return value;
  }
  if (value.endsWith("%")) {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return (parsed / 100) * dimension;
    }
  }
  // The storyboard only allows numbers or "%"-strings - anything else is a bug
  throw new Error(
    `Invalid rect value ${JSON.stringify(value)}; expected a number or a percentage string.`,
  );
};

export type ClipEndCondition =
  | { line: string; offsetFrames?: number; sync?: string; end?: false }
  | { line: string; end: true };

/**
 * Internal mixin holding the fields every clip shares, so each member of the
 * StoryboardClip union is a short intersection. Only needed when defining new
 * clip types in the engine - episode storyboards use StoryboardClip / *ClipDef.
 */
export type ClipCommon = {
  id: string;
  /**
   * Optional at authoring time so chained clips can inherit it from their
   * key-chain store. The renderer throws if a resolved clip has no rect.
   */
  rect?: Rect;
  /** Stacking order (default 0); use ~10 for overlays above other panes */
  zIndex?: number;
  startAt: { line: string; offsetFrames?: number };
  endAt: ClipEndCondition[];
  /** Frames of slide-in transition at clip start */
  transitionIn?: number;
  /** Frames of slide-out transition after clip end */
  transitionOut?: number;
  /**
   * Optional pane title bar rendered by the pane (ClipPane) above the clip
   * content. Distinct from content-level title fields on title/overlay/
   * progress clips: this is pane chrome, identical for every clip type.
   */
  paneTitle?: string;
};

export type CodeClipDef = ClipCommon & {
  type: "code";
  /** Persistence chain id - clips with the same key share code/scroll state */
  key?: string;
  /** Code files in public/<episode>/code/. After resolution: effective list with the chain carry-in prepended */
  steps: string[];
  /** Tab label. Default: basename of the last step */
  filename?: string;
  /** Frames between step morphs (default 60) */
  stepInterval?: number;
  /** Morph length in frames (default 30) */
  transitionDuration?: number;
  /** Morph granularity (default "token"; "line" survives big rewrites) */
  transition?: "token" | "line";
  /** Injected by the state resolver, not authored: rendered line to start scrolled at */
  scrollFrom?: number;
  /** Rendered line to scroll to, 1-based (default: stay at scrollFrom) */
  scrollTo?: number;
  /** Scroll animation length in frames (default 30; 0 = snap) */
  scrollDuration?: number;
};

export type TerminalClipDef = ClipCommon & {
  type: "terminal";
  /**
   * Commands to type out, each followed by its output lines. The window
   * title comes from the first step's cwd (default: "terminal").
   */
  steps: { cwd?: string; command: string; output?: string[] }[];
  /** Characters per frame (default 1) */
  typeSpeed?: number;
  /** Frames to pause after a command is fully typed (default 15) */
  pauseAfterCommand?: number;
  /** Frames between output lines appearing (default 10) */
  outputLineDelay?: number;
  /** Blinking block cursor (default true) */
  showCursor?: boolean;
};

export type ChatStep =
  /** Types into the editor box char by char, then "sends" into the scrollback */
  | { role: "user"; text: string }
  /** Streams into the scrollback, one wrapped line per streamLineDelay */
  | { role: "ai"; text: string }
  /** A dim "Thinking..." beat between messages */
  | { role: "thinking" };

/**
 * pi-style conversation with the AI: scrollback on top (user messages sent
 * from the editor ride an accent `❯` prefix), editor box under a divider,
 * decorative status bar at the bottom. Text wraps deterministically by
 * display columns (monospace font, CJK = 2 columns) - no DOM measuring.
 */
export type ChatClipDef = ClipCommon & {
  type: "chat";
  /** Conversation beats, played in order */
  steps: ChatStep[];
  /**
   * Persistence chain id: chained chat clips continue the conversation -
   * the previous clip's steps are prepended (already completed) so the
   * scrollback carries over instead of restarting empty
   */
  key?: string;
  /** Injected by the state resolver, not authored: frame offset skipping the carried steps' playback */
  carryFrames?: number;
  /** Status bar: model name (default "kimi-k3") */
  model?: string;
  /** Status bar: working directory */
  cwd?: string;
  /** User typing speed, chars per frame (default 1) */
  typeSpeed?: number;
  /** Frames between streamed AI lines (default 6) */
  streamLineDelay?: number;
  /** Frames the finished message sits in the editor before sending (default 18) */
  sendPause?: number;
  /** Length of a "Thinking..." beat in frames (default 45) */
  thinkingFrames?: number;
};

export type VideoClipDef = ClipCommon & {
  type: "video";
  /** Video file in public/<episode>/video/ */
  src: string;
  /** Skip this many frames of the recording (default 0) */
  startFrom?: number;
  playbackRate?: number;
  /** Default true */
  muted?: boolean;
  /** Default false */
  loop?: boolean;
};

export type OverlayClipDef = ClipCommon & {
  type: "overlay";
  title?: string;
  text: string;
};

export type CinematicTitleClipDef = ClipCommon & {
  type: "cinematic-title";
  title: string;
  subtitle?: string;
};

export type AnimatedListClipDef = ClipCommon & {
  type: "animated-list";
  items: string[];
  /** Frames between consecutive items appearing (default 15) */
  stagger?: number;
};

export type ProgressItem = {
  text: string;
  status: "done" | "current" | "todo";
  children?: { text: string; status: "done" | "current" | "todo" }[];
};

export type ProgressClipDef = ClipCommon & {
  type: "progress";
  /** Heading above the checklist (optional) */
  title?: string;
  items: ProgressItem[];
};

export type CountdownClipDef = ClipCommon & {
  type: "countdown";
  /** Seconds to count down from (default 3) */
  seconds?: number;
  /** Text shown when the countdown finishes (default "GO!") */
  goText?: string;
};

export type ChapterTitleClipDef = ClipCommon & {
  type: "chapter-title";
  /** Chapter number, displayed large */
  chapter: number;
  /** Chapter title below the number */
  title: string;
  /** Small uppercase label above the number (default "Chapter") */
  label?: string;
};

export type NotificationItem = {
  title: string;
  body?: string;
  /** Accent color for the avatar dot (default: theme accent) */
  color?: string;
  /** Red count badge on the first notification (optional) */
  badge?: number;
};

export type NotificationPopClipDef = ClipCommon & {
  type: "notification-pop";
  notifications: NotificationItem[];
  /** Frames between consecutive notifications (default 20) */
  stagger?: number;
};

export type ProgressStepsClipDef = ClipCommon & {
  type: "progress-steps";
  /** Heading above the stepper (optional) */
  title?: string;
  steps: string[];
  /** Frames per step advance (default 24) */
  stepInterval?: number;
};

export type StoryboardClip =
  | CodeClipDef
  | TerminalClipDef
  | ChatClipDef
  | VideoClipDef
  | OverlayClipDef
  | CinematicTitleClipDef
  | AnimatedListClipDef
  | ProgressClipDef
  | CountdownClipDef
  | ChapterTitleClipDef
  | NotificationPopClipDef
  | ProgressStepsClipDef;

/**
 * Episode-level backdrop, rendered under all clips. Keep it non-disturbing:
 * `dim`/`saturate`/`brightness` exist so a colorful source image still reads
 * as a background (pane cards are opaque; the backdrop shows in the gaps).
 */
export type BackgroundDef = {
  /** Image file in public/<episode>/images/ */
  src: string;
  /** Scrim over the image in the theme background color, 0-1 (default 0) */
  dim?: number;
  /** Saturation multiplier, 0 = grayscale (default 1) */
  saturate?: number;
  /** Brightness multiplier (default 1) */
  brightness?: number;
};

export type Storyboard = {
  clips: StoryboardClip[];
  background?: BackgroundDef;
  /** Render the subtitle band (bottom-center, on top of clips). Default false */
  subtitles?: boolean;
};

/**
 * Code clip pacing defaults, shared by the state resolver and the component.
 * Kept here (not code-style.ts) so pure logic can use them without pulling
 * in the font-loading module chain.
 */
export const defaultStepInterval = 60;
export const defaultTransitionDuration = 30;

// Runtime layer: what the timeline compiler emits

export type TimelineLine = {
  fullId: string;
  text: string;
  startFrame: number;
  endFrame: number;
  audio: string | null;
  /** false = hidden from the subtitle band */
  subtitle: boolean;
};

export type TimelineClip<T extends StoryboardClip = StoryboardClip> = T & {
  startFrame: number;
  endFrame: number;
};

export type Timeline = {
  lines: TimelineLine[];
  clips: TimelineClip[];
  totalFrames: number;
};

export type ClipComponent<T extends StoryboardClip = StoryboardClip> = FC<{
  clip: TimelineClip<T>;
}>;
