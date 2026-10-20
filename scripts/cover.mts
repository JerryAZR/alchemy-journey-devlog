/**
 * Series cover generator (fast path): template image + banner title via
 * ImageMagick, ~1s per cover. Equivalent output to the Remotion
 * SeriesCover composition - that one stays for tuning (Studio live
 * preview) and future richer covers; this is the routine path.
 *
 * Text placement matches src/SeriesCover.tsx's BANNER: 76px Noto Serif SC
 * Black, ink #3d2b18, optical center 887px from the top (= +347 from the
 * image center). If BANNER changes there, update the offsets here.
 *
 * Usage: npx tsx scripts/cover.mts "标题" out/covers/ep01.png ["副标题"]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const [title, out, subtitle] = process.argv.slice(2);
if (!title || !out) {
  throw new Error(
    'usage: npx tsx scripts/cover.mts "标题" out/covers/ep01.png ["副标题"]',
  );
}

const FONT = "public/fonts/Noto_Serif_SC/static/NotoSerifSC-Black.ttf";
const TEMPLATE = "public/covers/series-template.png";
for (const f of [FONT, TEMPLATE]) {
  if (!fs.existsSync(f)) {
    throw new Error(`missing ${f}`);
  }
}

const args = [
  TEMPLATE,
  "-font", FONT,
  "-fill", "#3d2b18",
  "-gravity", "center",
  "-pointsize", "76",
  "-kerning", "6",
  "-annotate", "+0+347", title,
  ...(subtitle
    ? ["-pointsize", "36", "-kerning", "3", "-fill", "#5a452c", "-annotate", "+0+425", subtitle]
    : []),
  out,
];

const r = spawnSync("magick", args, { stdio: "inherit" });
if (r.status !== 0) {
  throw new Error(`magick exited with ${r.status}`);
}
console.log(`+ ${out}`);
