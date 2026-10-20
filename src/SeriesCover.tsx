import { useEffect, useState } from "react";
import { continueRender, delayRender, Img, staticFile } from "remotion";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Series cover generator: the AI-painted template (public/covers/
 * series-template.png - 炼金之旅 DEVLOG header + blank parchment banner)
 * with the episode title composited into the banner. One still per episode:
 *
 *   npx remotion still series-cover out/covers/ep01.png \
 *     --props='{"title":"我又开始做游戏了"}'
 *
 * Noto Serif SC is loaded over plain staticFile (not inlined - a 15MB CJK
 * font as base64 would bloat every bundle; covers are stills, the font
 * never sits in a render-hot page).
 */
export type SeriesCoverProps = {
  title: string;
  /** Smaller line under the title, e.g. "第一步：最小可玩循环" */
  subtitle?: string;
};

const coverFontFamily = "Noto Serif SC";
let coverFontReady: Promise<unknown> | null = null;
const ensureCoverFont = () => {
  if (!coverFontReady) {
    const face = new FontFace(
      coverFontFamily,
      `url('${staticFile("fonts/Noto_Serif_SC/static/NotoSerifSC-Black.ttf")}') format('truetype')`,
      { weight: "900" },
    );
    coverFontReady = face.load().then((f) => document.fonts.add(f));
  }
  return coverFontReady;
};

// Banner interior measured on series-template.png (1920x1080)
const BANNER = { x: 340, y: 815, w: 1240, h: 215 };

export const SeriesCover = ({ title, subtitle }: SeriesCoverProps) => {
  // Hold a delayRender until the font settles or a 10s bound passes -
  // Remotion must not capture before the font is in, and a wedged font
  // must not kill the render (fallback serif instead of a blank frame).
  const [handle] = useState(() => delayRender("cover font"));
  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) {
        continueRender(handle);
      }
    };
    Promise.race([ensureCoverFont(), sleep(10_000)]).then(done, done);
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Img
        src={staticFile("covers/series-template.png")}
        style={{ width: "100%", height: "100%" }}
      />
      <div
        style={{
          position: "absolute",
          left: BANNER.x,
          top: BANNER.y,
          width: BANNER.w,
          height: BANNER.h,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: coverFontFamily,
          fontWeight: 900,
          color: "#3d2b18",
        }}
      >
        <div style={{ fontSize: 76, letterSpacing: 6, lineHeight: 1.2 }}>
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontSize: 36,
              letterSpacing: 3,
              marginTop: 12,
              color: "#5a452c",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
};
