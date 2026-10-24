import { describe, expect, it } from "vitest";
import type { ChatClipDef, Rect, TimelineClip } from "../types";
import { chatStepsFrames, chatWidthCh, resolveChatState } from "./chat-state";

const rect: Rect = { x: "10%", y: "10%", w: "80%", h: "80%" };
const COMP_WIDTH = 1920;

const chatClip = (
  overrides: Partial<TimelineClip<ChatClipDef>> & { id: string },
): TimelineClip<ChatClipDef> => ({
  type: "chat",
  steps: [{ role: "user", text: "hello?" }],
  rect,
  startAt: { line: "l1" },
  endAt: [{ line: "l1", end: true }],
  startFrame: 0,
  endFrame: 100,
  ...overrides,
});

const asChatClips = (clips: TimelineClip[]) =>
  clips as TimelineClip<ChatClipDef>[];

describe("chatStepsFrames", () => {
  it("sums step durations (typing + send pause, stream delay, thinking)", () => {
    const widthCh = 100;
    const frames = chatStepsFrames(
      [
        { role: "user", text: "a".repeat(30) }, // 30 typing + 18 pause
        { role: "ai", text: "b".repeat(150) }, // wraps to 2 lines * 6
        { role: "thinking" }, // 45
      ],
      {} as ChatClipDef,
      widthCh,
    );
    expect(frames).toBe(30 + 18 + 2 * 6 + 45);
  });
});

describe("resolveChatState", () => {
  it("defaults unkeyed clips (carryFrames 0)", () => {
    const [clip] = asChatClips(resolveChatState([chatClip({ id: "c" })], COMP_WIDTH));
    expect(clip.carryFrames).toBe(0);
  });

  it("chained clip inherits the conversation: steps prepended, carryFrames skips their playback", () => {
    const [first, second] = asChatClips(
      resolveChatState(
        [
          chatClip({ id: "c1", key: "k", steps: [{ role: "user", text: "q1" }] }),
          chatClip({
            id: "c2",
            key: "k",
            steps: [{ role: "ai", text: "a1" }],
            startFrame: 200,
          }),
        ],
        COMP_WIDTH,
      ),
    );
    expect(first.steps).toHaveLength(1);
    expect(first.carryFrames).toBe(0);
    expect(second.steps.map((s) => s.role)).toEqual(["user", "ai"]);
    // carryFrames = c1's playback: 2 chars typing + 18 send pause
    expect(second.carryFrames).toBe(2 + 18);
  });

  it("carried AI steps account for wrapping (widthCh from rect)", () => {
    const longAi = "x".repeat(300);
    const widthCh = chatWidthCh(rect, COMP_WIDTH);
    const expectedLines = Math.ceil(300 / widthCh);
    const [, second] = asChatClips(
      resolveChatState(
        [
          chatClip({ id: "c1", key: "k", steps: [{ role: "ai", text: longAi }] }),
          chatClip({
            id: "c2",
            key: "k",
            steps: [{ role: "user", text: "next" }],
            startFrame: 200,
          }),
        ],
        COMP_WIDTH,
      ),
    );
    expect(second.carryFrames).toBe(expectedLines * 6);
  });

  it("inherits rect from the chain when omitted", () => {
    const [, second] = asChatClips(
      resolveChatState(
        [
          chatClip({ id: "c1", key: "k" }),
          chatClip({ id: "c2", key: "k", rect: undefined, startFrame: 200 }),
        ],
        COMP_WIDTH,
      ),
    );
    expect(second.rect).toEqual(rect);
  });

  it("throws on overlapping chained clips", () => {
    expect(() =>
      resolveChatState(
        [
          chatClip({ id: "c1", key: "k", endFrame: 100 }),
          chatClip({ id: "c2", key: "k", startFrame: 90 }),
        ],
        COMP_WIDTH,
      ),
    ).toThrow(/overlap/);
  });

  it("does not mix different keys", () => {
    const [, other] = asChatClips(
      resolveChatState(
        [
          chatClip({ id: "c1", key: "k1" }),
          chatClip({ id: "c2", key: "k2", startFrame: 200 }),
        ],
        COMP_WIDTH,
      ),
    );
    expect(other.steps).toHaveLength(1);
    expect(other.carryFrames).toBe(0);
  });
});
