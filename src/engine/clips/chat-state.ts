import { cardPadding, codeFontSize } from "../code-style";
import type { ChatClipDef, ChatStep, Rect, TimelineClip } from "../types";
import { resolveRectValue } from "../types";
import { wrapChatText } from "./ChatClip";

/**
 * Wrap width in display columns for a chat clip at `rect` — shared by the
 * resolver (carryFrames math) and the component (rendering), so chained
 * clips can never disagree with their predecessor about where lines break.
 *
 * Fira Code's advance measures ~0.62em in rendered frames (0.6em on paper);
 * the -2 safety margin absorbs font-fallback drift: wrapping slightly early
 * is harmless, wrapping late overflows the pane.
 */
export const chatWidthCh = (rect: Rect, compWidth: number): number => {
  const paneW = resolveRectValue(rect.w, compWidth);
  const charWidthPx = codeFontSize * 0.62;
  return Math.floor((paneW - cardPadding * 2) / charWidthPx) - 2;
};

/** Total playback frames of `steps` under `config` — mirrors chatStateAt. */
export const chatStepsFrames = (
  steps: ChatStep[],
  config: ChatClipDef,
  widthCh: number,
): number => {
  const typeSpeed = config.typeSpeed ?? 1;
  const streamLineDelay = config.streamLineDelay ?? 6;
  const sendPause = config.sendPause ?? 18;
  const thinkingFrames = config.thinkingFrames ?? 45;

  let frames = 0;
  for (const step of steps) {
    if (step.role === "thinking") {
      frames += thinkingFrames;
    } else if (step.role === "ai") {
      frames += wrapChatText(step.text, widthCh).length * streamLineDelay;
    } else {
      frames += Math.max(1, Math.ceil(step.text.length / typeSpeed)) + sendPause;
    }
  }
  return frames;
};

type ChatStore = {
  /** Accumulated steps of the whole chain so far */
  steps: ChatStep[];
  /** endFrame + transitionOut of the last clip in the chain */
  tailFrame: number;
  clipId: string;
  rect: Rect;
};

/**
 * Threads conversation state through same-key chat clips in timeline order:
 * a chained clip's scrollback continues the conversation instead of
 * restarting empty. Mechanically: the previous steps are prepended and the
 * clip gets `carryFrames` (their total playback length) so its own steps
 * start animating at its frame 0. Plain data in, plain data out.
 */
export const resolveChatState = (
  clips: TimelineClip[],
  compWidth: number,
): TimelineClip[] => {
  const stores = new Map<string, ChatStore>();
  const resolved = [...clips];

  const byStartFrame = clips
    .map((_, i) => i)
    .sort((a, b) => clips[a].startFrame - clips[b].startFrame);

  for (const i of byStartFrame) {
    const clip = clips[i];
    if (clip.type !== "chat") {
      continue;
    }
    const chatClip = clip as TimelineClip<ChatClipDef>;

    if (!chatClip.key) {
      resolved[i] = { ...chatClip, carryFrames: 0 };
      continue;
    }

    const store = stores.get(chatClip.key);
    if (store && chatClip.startFrame < store.tailFrame) {
      throw new Error(
        `clips '${store.clipId}' and '${clip.id}' (key '${chatClip.key}') overlap, including the transitionOut tail - chained clips must not cross-fade`,
      );
    }
    if (store && chatClip.rect) {
      const { x, y } = chatClip.rect;
      if (x !== store.rect.x || y !== store.rect.y) {
        console.warn(
          `clip '${clip.id}' (key '${chatClip.key}'): top-left corner moved between chained clips - the conversation will appear to jump`,
        );
      }
    }

    const rect = chatClip.rect ?? store?.rect;
    if (!rect) {
      throw new Error(
        `clip '${clip.id}' has no rect and there is no earlier clip in key '${chatClip.key}' to inherit one from`,
      );
    }

    const carried = store?.steps ?? [];
    const carryFrames =
      carried.length === 0
        ? 0
        : chatStepsFrames(carried, chatClip, chatWidthCh(rect, compWidth));

    stores.set(chatClip.key, {
      steps: [...carried, ...chatClip.steps],
      tailFrame: chatClip.endFrame + (chatClip.transitionOut ?? 0),
      clipId: clip.id,
      rect,
    });

    resolved[i] = {
      ...chatClip,
      steps: [...carried, ...chatClip.steps],
      carryFrames,
      rect,
    };
  }

  return resolved;
};
