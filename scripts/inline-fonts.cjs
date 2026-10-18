// Regenerates src/fonts-data.ts from public/fonts/*.ttf. Run after adding
// or replacing font files.
const fs = require("node:fs");
const path = require("node:path");

const fonts = [
  ["firaCodeRegularUrl", "FiraCode-Regular.ttf"],
  ["firaCodeBoldUrl", "FiraCode-Bold.ttf"],
];

const lines = [
  "// Generated from public/fonts/*.ttf by scripts/inline-fonts.cjs.",
  "// Fonts are inlined as base64 data URIs so render-time font loading",
  "// never depends on the bundle server.",
  "",
];
for (const [name, file] of fonts) {
  const b64 = fs.readFileSync(path.join("public", "fonts", file)).toString("base64");
  lines.push(`export const ${name} =`, `  "data:font/ttf;base64,${b64}";`, "");
}
fs.writeFileSync("src/fonts-data.ts", lines.join("
"));
console.log("src/fonts-data.ts regenerated");