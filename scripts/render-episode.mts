/**
 * Renderer-API episode render, split into two phases:
 *   1. renderFrames() - frames to a persistent dir (out/.frames-<comp>)
 *   2. stitchFramesToVideo() - short final ffmpeg mux, retried on failure
 *
 * Why: `npx remotion render` (renderMedia) spawns the final ffmpeg from the
 * long-lived render process. On this machine that spawn fails 100% of the
 * time after a full render with STATUS_DLL_INIT_FAILED (0xC0000142) - even
 * `ffmpeg -version` fails from that process state (verified by probe), while
 * the same binary spawns fine from any fresh process. Short renders never
 * hit it. Splitting the phases keeps the expensive frame work and adds a
 * cheap, retryable stitch.
 *
 * Mirrors remotion.config.ts (the CLI reads it, the raw API does not):
 * jpeg frames, 180s delayRender timeout, the offline webpack override.
 *
 * Usage: npx tsx scripts/render-episode.mts <composition-id> <out.mp4> [--frames=a-b]
 */
import { bundle } from "@remotion/bundler";
import {
  renderFrames,
  selectComposition,
  stitchFramesToVideo,
} from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { offlineLighterOverride } from "../src/calculate-metadata/webpack-override";

const [, , compositionId, out, ...rest] = process.argv;
if (!compositionId || !out) {
  throw new Error(
    "usage: npx tsx scripts/render-episode.mts <composition-id> <out.mp4> [--frames=a-b]",
  );
}
const framesArg = rest
  .find((a) => a.startsWith("--frames="))
  ?.slice("--frames=".length);
const frameRange = framesArg
  ?.split("-")
  .map((n) => Number.parseInt(n, 10)) as [number, number] | undefined;

// Absolute paths: the stitcher spawns ffmpeg with cwd = the compositor's
// binary dir, so relative paths would break there.
const framesDir = path.resolve(`out/.frames-${compositionId}`);
const outAbs = path.resolve(out);
fs.rmSync(framesDir, { recursive: true, force: true });

const serveUrl = await bundle({
  entryPoint: "./src/index.ts",
  webpackOverride: offlineLighterOverride,
});

const composition = await selectComposition({
  serveUrl,
  id: compositionId,
  inputProps: {},
});

// Probe: can this process spawn the bundled ffmpeg at each stage? The final
// stitch fails with STATUS_DLL_INIT_FAILED after full renders - this tells
// us when the poison sets in.
const probe = (tag: string) => {
  const p = spawnSync(
    "node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe",
    ["-version"],
    { encoding: "utf8" },
  );
  console.log(`[probe:${tag}] ffmpeg status=${p.status} error=${p.error ?? "none"}`);
};
probe("pre-render");

console.log(
  `rendering ${compositionId}: ${composition.durationInFrames} frames @ ${composition.fps}fps`,
);

const { assetsInfo } = await renderFrames({
  serveUrl,
  composition,
  inputProps: {},
  outputDir: framesDir,
  imageFormat: "jpeg",
  concurrency: 4,
  timeoutInMilliseconds: 180_000,
  frameRange: frameRange ?? null,
  onStart: ({ frameCount }) => console.log(`frames: ${frameCount}`),
  onFrameUpdate: (frame) => {
    if (frame % 300 === 0) {
      console.log(`rendered ${frame}`);
    }
  },
});

console.log("frames done, stitching...");
probe("post-render");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const diagnose = (tag: string) => {
  const handles = (process as unknown as { _getActiveHandles?: () => unknown[] })
    ._getActiveHandles?.().length;
  console.log(`[diag:${tag}] memory=${JSON.stringify(process.memoryUsage())}`);
  console.log(`[diag:${tag}] activeHandles=${handles}`);
  const targets: [string, string[]][] = [
    ["node", ["-v"]],
    ["system-ffmpeg", ["-version"]],
    ["bundled-ffmpeg", ["-version"]],
  ];
  const bins: Record<string, string> = {
    node: process.execPath,
    "system-ffmpeg": "ffmpeg",
    "bundled-ffmpeg":
      "node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe",
  };
  for (const [name, args] of targets) {
    const p = spawnSync(bins[name], args, { encoding: "utf8" });
    console.log(`[diag:${tag}] spawn ${name}: status=${p.status} error=${p.error ?? "none"}`);
  }
  // Suspect: the inherited environment block got corrupted during the render.
  // Compare: default env vs a minimal clean env.
  const envStr = Object.entries(process.env)
    .map(([k, v]) => `${k}=${v}`)
    .join("|");
  console.log(
    `[diag:${tag}] env entries=${Object.keys(process.env).length} envBytes=${envStr.length}`,
  );
  const weird = Object.entries(process.env).filter(
    ([k, v]) => !k || k.startsWith("=") || k.includes("\0") || (v ?? "").includes("\0"),
  );
  console.log(`[diag:${tag}] weirdEnvEntries=${JSON.stringify(weird)}`);
  const clean = spawnSync(process.execPath, ["-v"], {
    encoding: "utf8",
    env: {
      SystemRoot: process.env.SystemRoot,
      PATH: process.env.PATH,
      SystemDrive: process.env.SystemDrive,
    },
  });
  console.log(
    `[diag:${tag}] spawn node with minimal env: status=${clean.status} error=${clean.error ?? "none"}`,
  );
};
const MAX_STITCH_ATTEMPTS = 5;
for (let attempt = 1; ; attempt++) {
  try {
    await stitchFramesToVideo({
      assetsInfo,
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
      codec: "h264",
      outputLocation: outAbs,
      force: true,
      onProgress: (progress) => {
        if (progress % 600 === 0) {
          console.log(`stitched ${progress}`);
        }
      },
    });
    break;
  } catch (err) {
    if (attempt >= MAX_STITCH_ATTEMPTS) {
      throw err;
    }
    console.warn(
      `stitch attempt ${attempt} failed (${err instanceof Error ? err.message : err}); retrying in 15s`,
    );
    diagnose(`stitch-fail-${attempt}`);
    await sleep(15_000);
  }
}

fs.rmSync(framesDir, { recursive: true, force: true });
console.log(`+ ${outAbs}`);
