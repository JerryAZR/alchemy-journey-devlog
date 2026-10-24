import { describe, expect, test } from "vitest";
import { chatStateAt, displayColumns, wrapChatText } from "./ChatClip";
import type { ChatStep } from "../types";

describe("displayColumns", () => {
  test("ASCII is 1 column, CJK is 2", () => {
    expect(displayColumns("hello")).toBe(5);
    expect(displayColumns("你好")).toBe(4);
    expect(displayColumns("攻击attack者")).toBe(12);
  });
});

describe("wrapChatText", () => {
  test("short text stays on one line", () => {
    expect(wrapChatText("hello world", 80)).toEqual(["hello world"]);
  });

  test("wraps at column width, breaking at spaces (no mid-word breaks)", () => {
    expect(wrapChatText("aaaa bbbb cccc", 9)).toEqual(["aaaa", "bbbb cccc"]);
  });

  test("long tokens hard-break when no space is available", () => {
    expect(wrapChatText("x".repeat(14), 8)).toEqual(["x".repeat(8), "x".repeat(6)]);
  });

  test("CJK counts double when wrapping", () => {
    // 5 CJK chars = 10 columns > 8 -> wraps after 4 chars
    expect(wrapChatText("你好啊朋友", 8)).toEqual(["你好啊朋", "友"]);
  });

  test("manual line breaks are honored", () => {
    expect(wrapChatText("one\n\ntwo", 80)).toEqual(["one", "", "two"]);
  });

  test("rejects absurd widths", () => {
    expect(() => wrapChatText("x", 4)).toThrow(/too narrow/);
  });
});

describe("chatStateAt", () => {
  const steps: ChatStep[] = [
    { role: "ai", text: "first answer" },
    { role: "user", text: "a question?" },
    { role: "thinking" },
    { role: "ai", text: "second answer" },
  ];

  test("ai message streams line by line", () => {
    const early = chatStateAt(steps, { streamLineDelay: 10 }, 5, 80);
    expect(early.scrollback).toEqual([]);
    const later = chatStateAt(steps, { streamLineDelay: 10 }, 10, 80);
    expect(later.scrollback).toEqual([{ role: "ai", text: "first answer", first: true }]);
  });

  test("user message types in the editor, then lands in the scrollback", () => {
    // ai step: 1 line * 6 = 6 frames; then user types 11 chars
    const typing = chatStateAt(steps, {}, 6 + 5, 80);
    expect(typing.scrollback).toHaveLength(1);
    expect(typing.editorLines).toEqual(["a que"]);

    const sent = chatStateAt(steps, {}, 6 + 11 + 18, 80);
    expect(sent.editorLines).toEqual([]);
    expect(sent.scrollback[1]).toEqual({ role: "user", text: "a question?", first: true });
  });

  test("thinking beat shows between messages", () => {
    const t = 6 + (11 + 18) + 10;
    const state = chatStateAt(steps, {}, t, 80);
    expect(state.thinking).toBe(true);
    expect(state.scrollback).toHaveLength(2); // ai + user, no ai-2 yet
  });

  test("full conversation completes in order", () => {
    const state = chatStateAt(steps, {}, 10000, 80);
    expect(state.scrollback.map((l) => l.role)).toEqual(["ai", "user", "ai"]);
    expect(state.thinking).toBe(false);
  });

  test("wrapping affects AI streaming pace (line count drives timing)", () => {
    const long: ChatStep[] = [
      { role: "ai", text: "x".repeat(100) }, // 100 cols
    ];
    const narrow = chatStateAt(long, { streamLineDelay: 10 }, 15, 20); // 5 lines
    expect(narrow.scrollback).toHaveLength(1);
    const wide = chatStateAt(long, { streamLineDelay: 10 }, 15, 200); // 1 line
    expect(wide.scrollback).toHaveLength(1);
    // narrow needs 50 frames total, wide 10
    const narrowDone = chatStateAt(long, { streamLineDelay: 10 }, 50, 20);
    expect(narrowDone.scrollback).toHaveLength(5);
  });
});
