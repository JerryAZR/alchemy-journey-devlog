import { describe, expect, it } from "vitest";
import { wandStepAt } from "./WandClip";

describe("wandStepAt", () => {
  it("advances one step per interval, clamped to the last step", () => {
    expect(wandStepAt(0, 4, 60, 600)).toEqual({ stepIndex: 0, stepFrame: 0 });
    expect(wandStepAt(59, 4, 60, 600).stepIndex).toBe(0);
    expect(wandStepAt(60, 4, 60, 600)).toEqual({ stepIndex: 1, stepFrame: 0 });
    expect(wandStepAt(9999, 4, 60, 600).stepIndex).toBe(3);
  });

  it("compresses the interval so the last step starts inside the window", () => {
    // 4 steps in 100 frames: requested 60 -> compressed to 33
    const at99 = wandStepAt(99, 4, 60, 100);
    expect(at99.stepIndex).toBe(3);
    const at66 = wandStepAt(66, 4, 60, 100);
    expect(at66.stepIndex).toBe(2);
  });

  it("handles empty and single steps", () => {
    expect(wandStepAt(0, 0, 60, 100).stepIndex).toBe(-1);
    expect(wandStepAt(50, 1, 60, 100)).toEqual({ stepIndex: 0, stepFrame: 50 });
  });
});
