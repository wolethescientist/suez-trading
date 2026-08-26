/**
 * Generates the product and category artwork as flat vector SVGs.
 * Keeping the illustrations local means the storefront has no external image
 * dependency and every tile shares one visual language. Re-run with:
 *   node scripts/generate-art.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";

const INK = "#12151a";
const INK_SOFT = "#2b3138";
const BONE_LINE = "#ccc2b0";
const CARGO = "#d97b24";

mkdirSync("public/products", { recursive: true });
mkdirSync("public/categories", { recursive: true });

const frame = (body, tint = "#efeae0") => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <defs>
    <pattern id="g" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M25 0H0V25" stroke="${INK}" stroke-opacity=".05" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="400" height="400" fill="${tint}"/>
  <rect width="400" height="400" fill="url(#g)"/>
  <rect x="24" y="24" width="14" height="2" fill="${CARGO}"/>
  <rect x="24" y="24" width="2" height="14" fill="${CARGO}"/>
  <rect x="362" y="374" width="14" height="2" fill="${INK}" fill-opacity=".25"/>
  <rect x="374" y="362" width="2" height="14" fill="${INK}" fill-opacity=".25"/>
  ${body}
</svg>`;

/* --- object vocabulary: each returns centred artwork for a 400x400 frame --- */

const drum = (c) => `
  <ellipse cx="200" cy="316" rx="86" ry="14" fill="${INK}" fill-opacity=".08"/>
  <path d="M136 118c0-8 29-14 64-14s64 6 64 14v182c0 8-29 14-64 14s-64-6-64-14V118Z" fill="${c}"/>
  <ellipse cx="200" cy="118" rx="64" ry="14" fill="#fff" fill-opacity=".28"/>
  <ellipse cx="200" cy="118" rx="64" ry="14" stroke="${INK}" stroke-width="5"/>
  <path d="M136 118v182c0 8 29 14 64 14s64-6 64-14V118" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M136 170c14 7 39 11 64 11s50-4 64-11M136 250c14 7 39 11 64 11s50-4 64-11" stroke="${INK}" stroke-width="5"/>
  <circle cx="176" cy="118" r="10" fill="${INK}"/>
  <rect x="152" y="196" width="96" height="30" rx="3" fill="#fff" fill-opacity=".82"/>
  <rect x="164" y="206" width="52" height="4" fill="${INK}" fill-opacity=".45"/>
  <rect x="164" y="214" width="32" height="4" fill="${INK}" fill-opacity=".28"/>`;

const cylinder = (c) => `
  <ellipse cx="200" cy="326" rx="76" ry="13" fill="${INK}" fill-opacity=".08"/>
  <path d="M132 168c0-30 30-52 68-52s68 22 68 52v130c0 12-8 20-20 20H152c-12 0-20-8-20-20V168Z" fill="${c}"/>
  <path d="M132 168c0-30 30-52 68-52s68 22 68 52v130c0 12-8 20-20 20H152c-12 0-20-8-20-20V168Z" stroke="${INK}" stroke-width="5"/>
  <rect x="184" y="76" width="32" height="44" rx="6" fill="${INK}"/>
  <rect x="164" y="60" width="72" height="20" rx="10" fill="${INK_SOFT}"/>
  <rect x="236" y="62" width="26" height="10" rx="5" fill="${CARGO}"/>
  <rect x="150" y="212" width="100" height="46" rx="4" fill="#fff" fill-opacity=".85"/>
  <path d="M200 222l14 24h-28l14-24Z" fill="${CARGO}"/>
  <rect x="168" y="250" width="64" height="4" fill="${INK}" fill-opacity=".35"/>`;

const bag = (c) => `
  <ellipse cx="200" cy="322" rx="106" ry="14" fill="${INK}" fill-opacity=".08"/>
  <path d="M96 132c0-8 6-14 14-14h180c8 0 14 6 14 14l-12 168c-1 10-9 18-19 18H127c-10 0-18-8-19-18L96 132Z" fill="${c}"/>
  <path d="M96 132c0-8 6-14 14-14h180c8 0 14 6 14 14l-12 168c-1 10-9 18-19 18H127c-10 0-18-8-19-18L96 132Z" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M118 118c22-10 46-14 82-14s60 4 82 14" stroke="${INK}" stroke-width="5"/>
  <rect x="132" y="180" width="136" height="58" rx="4" fill="#fff" fill-opacity=".85"/>
  <rect x="150" y="196" width="100" height="8" fill="${INK}" fill-opacity=".5"/>
  <rect x="150" y="212" width="66" height="8" fill="${CARGO}"/>
  <path d="M124 268h152" stroke="${INK}" stroke-width="5" stroke-opacity=".35" stroke-dasharray="10 10"/>`;

const sheet = (c) => `
  <path d="M60 264l84-152h218l-84 152H60Z" fill="${c}"/>
  <path d="M60 264l84-152h218l-84 152H60Z" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M104 264l84-152M148 264l84-152M192 264l84-152M236 264l84-152" stroke="${INK}" stroke-width="4" stroke-opacity=".55"/>
  <path d="M60 264v34l278 0v-34" stroke="${INK}" stroke-width="5" stroke-linejoin="round" fill="${INK}" fill-opacity=".12"/>
  <rect x="60" y="322" width="278" height="4" fill="${INK}" fill-opacity=".1"/>`;

const rods = (c) => `
  <ellipse cx="200" cy="320" rx="112" ry="14" fill="${INK}" fill-opacity=".08"/>
  ${[0, 1, 2, 3, 4]
    .map(
      (i) =>
        `<rect x="${92 + i * 44}" y="${96 + (i % 2) * 10}" width="26" height="${206 - (i % 2) * 10}" rx="13" fill="${c}" stroke="${INK}" stroke-width="5"/>
         <path d="M${99 + i * 44} ${120 + (i % 2) * 10}h12M${99 + i * 44} ${150 + (i % 2) * 10}h12M${99 + i * 44} ${180 + (i % 2) * 10}h12M${99 + i * 44} ${210 + (i % 2) * 10}h12M${99 + i * 44} ${240 + (i % 2) * 10}h12M${99 + i * 44} ${270 + (i % 2) * 10}h12" stroke="${INK}" stroke-width="4" stroke-opacity=".5"/>`,
    )
    .join("")}
  <rect x="80" y="176" width="240" height="14" rx="7" fill="${CARGO}" stroke="${INK}" stroke-width="4"/>`;

const crate = (c) => `
  <ellipse cx="200" cy="322" rx="110" ry="14" fill="${INK}" fill-opacity=".08"/>
  <rect x="88" y="150" width="224" height="164" rx="8" fill="${c}" stroke="${INK}" stroke-width="5"/>
  ${[0, 1, 2, 3]
    .map(
      (i) =>
        `<rect x="${106 + i * 52}" y="106" width="34" height="86" rx="6" fill="#fff" fill-opacity=".9" stroke="${INK}" stroke-width="5"/>
         <rect x="${117 + i * 52}" y="88" width="12" height="22" fill="${INK}"/>
         <rect x="${106 + i * 52}" y="140" width="34" height="22" fill="${CARGO}"/>`,
    )
    .join("")}
  <rect x="88" y="238" width="224" height="6" fill="${INK}" fill-opacity=".28"/>
  <rect x="120" y="266" width="160" height="26" rx="4" fill="#fff" fill-opacity=".82"/>`;

const bottle = (c) => `
  <ellipse cx="200" cy="326" rx="62" ry="12" fill="${INK}" fill-opacity=".08"/>
  <path d="M178 74h44v34l24 34c5 7 8 15 8 24v128c0 12-9 22-21 22h-66c-12 0-21-10-21-22V166c0-9 3-17 8-24l24-34V74Z" fill="${c}"/>
  <path d="M178 74h44v34l24 34c5 7 8 15 8 24v128c0 12-9 22-21 22h-66c-12 0-21-10-21-22V166c0-9 3-17 8-24l24-34V74Z" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="172" y="58" width="56" height="22" rx="5" fill="${INK}"/>
  <rect x="148" y="196" width="104" height="62" rx="4" fill="#fff" fill-opacity=".88"/>
  <rect x="166" y="214" width="68" height="8" fill="${INK}" fill-opacity=".5"/>
  <rect x="166" y="230" width="44" height="8" fill="${CARGO}"/>`;

const machine = (c) => `
  <ellipse cx="200" cy="320" rx="118" ry="14" fill="${INK}" fill-opacity=".08"/>
  <rect x="76" y="146" width="248" height="146" rx="10" fill="${c}" stroke="${INK}" stroke-width="5"/>
  <rect x="100" y="172" width="122" height="76" rx="6" fill="#fff" fill-opacity=".9" stroke="${INK}" stroke-width="5"/>
  <path d="M112 226l22-26 18 20 16-24 22 30" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="272" cy="196" r="24" fill="${CARGO}" stroke="${INK}" stroke-width="5"/>
  <path d="M272 182v14l10 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <rect x="248" y="238" width="48" height="12" rx="6" fill="${INK}"/>
  <rect x="106" y="120" width="60" height="28" rx="6" fill="${INK_SOFT}" stroke="${INK}" stroke-width="5"/>
  <rect x="96" y="292" width="30" height="26" rx="4" fill="${INK}"/>
  <rect x="274" y="292" width="30" height="26" rx="4" fill="${INK}"/>`;

const helmet = (c) => `
  <ellipse cx="200" cy="308" rx="104" ry="14" fill="${INK}" fill-opacity=".08"/>
  <path d="M108 254c0-58 41-104 92-104s92 46 92 104H108Z" fill="${c}"/>
  <path d="M108 254c0-58 41-104 92-104s92 46 92 104H108Z" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M200 150v104M164 162c-8 26-10 60-8 92M236 162c8 26 10 60 8 92" stroke="${INK}" stroke-width="5"/>
  <path d="M76 254h248c6 0 10 5 10 11v10c0 6-4 11-10 11H76c-6 0-10-5-10-11v-10c0-6 4-11 10-11Z" fill="${CARGO}" stroke="${INK}" stroke-width="5"/>
  <rect x="182" y="172" width="36" height="34" rx="4" fill="#fff" fill-opacity=".85"/>`;

const jerrycan = (c) => `
  <ellipse cx="200" cy="322" rx="80" ry="13" fill="${INK}" fill-opacity=".08"/>
  <path d="M124 130c0-9 7-16 16-16h120c9 0 16 7 16 16v168c0 9-7 16-16 16H140c-9 0-16-7-16-16V130Z" fill="${c}" stroke="${INK}" stroke-width="5"/>
  <path d="M152 114V96c0-7 6-12 13-12h70c7 0 13 5 13 12v18" stroke="${INK}" stroke-width="5" fill="none"/>
  <rect x="228" y="76" width="34" height="22" rx="6" fill="${INK}"/>
  <path d="M150 158h100M150 190h100" stroke="${INK}" stroke-width="5" stroke-opacity=".45"/>
  <rect x="152" y="216" width="96" height="58" rx="4" fill="#fff" fill-opacity=".85"/>
  <path d="M200 226l16 28h-32l16-28Z" fill="${CARGO}"/>
  <rect x="170" y="258" width="60" height="6" fill="${INK}" fill-opacity=".35"/>`;

const bucket = (c) => `
  <ellipse cx="200" cy="322" rx="84" ry="13" fill="${INK}" fill-opacity=".08"/>
  <path d="M130 140h140l-16 162c-1 8-8 14-16 14h-76c-8 0-15-6-16-14L130 140Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="118" y="118" width="164" height="26" rx="6" fill="${INK_SOFT}" stroke="${INK}" stroke-width="5"/>
  <path d="M142 118c0-30 26-52 58-52s58 22 58 52" stroke="${INK}" stroke-width="5" fill="none"/>
  <path d="M144 208c22-14 44 14 66 0s44 14 56 2" stroke="#fff" stroke-opacity=".65" stroke-width="8" stroke-linecap="round" fill="none"/>
  <rect x="152" y="240" width="96" height="40" rx="4" fill="#fff" fill-opacity=".82"/>
  <rect x="168" y="254" width="64" height="6" fill="${CARGO}"/>`;

const tile = (c) => `
  <rect x="86" y="110" width="228" height="180" rx="6" fill="${c}" stroke="${INK}" stroke-width="5"/>
  <path d="M86 170h228M86 230h228M162 110v180M238 110v180" stroke="${INK}" stroke-width="4" stroke-opacity=".45"/>
  <rect x="98" y="122" width="52" height="36" rx="3" fill="#fff" fill-opacity=".5"/>
  <rect x="250" y="242" width="52" height="36" rx="3" fill="${CARGO}" fill-opacity=".8"/>
  <ellipse cx="200" cy="308" rx="120" ry="12" fill="${INK}" fill-opacity=".08"/>`;

const pipe = (c) => `
  <ellipse cx="200" cy="320" rx="120" ry="13" fill="${INK}" fill-opacity=".08"/>
  <rect x="70" y="150" width="260" height="76" rx="8" fill="${c}" stroke="${INK}" stroke-width="5"/>
  <ellipse cx="70" cy="188" rx="16" ry="38" fill="${INK_SOFT}" stroke="${INK}" stroke-width="5"/>
  <ellipse cx="330" cy="188" rx="16" ry="38" fill="${BONE_LINE}" stroke="${INK}" stroke-width="5"/>
  <rect x="128" y="140" width="20" height="96" rx="4" fill="${INK}" fill-opacity=".3"/>
  <rect x="252" y="140" width="20" height="96" rx="4" fill="${INK}" fill-opacity=".3"/>
  <rect x="176" y="128" width="48" height="24" rx="6" fill="${CARGO}" stroke="${INK}" stroke-width="5"/>
  <rect x="94" y="264" width="212" height="34" rx="6" fill="#fff" fill-opacity=".8" stroke="${INK}" stroke-width="4"/>`;

const shapes = { drum, cylinder, bag, sheet, rods, crate, bottle, machine, helmet, jerrycan, bucket, tile, pipe };

/* --------------------------------------------------------------- catalogue */

const art = [
  ["ago-diesel", "drum", "#2c4a63", "#e8e3d8"],
  ["pms-petrol", "drum", "#c9762a", "#f3ece0"],
  ["dpk-kerosene", "drum", "#4a7fa8", "#e9f0f5"],
  ["lpg-cylinder-12-5kg", "cylinder", "#c93b3b", "#f2e6dc"],
  ["lpg-cylinder-50kg", "cylinder", "#8f2f2f", "#efe3d8"],
  ["engine-oil-sae-40", "jerrycan", "#f0a22e", "#f4ecdd"],
  ["hydraulic-oil-iso-68", "jerrycan", "#4c6b85", "#eae5da"],
  ["multipurpose-grease", "bucket", "#2f4d3a", "#e9e6da"],
  ["gear-oil-ep-90", "jerrycan", "#a8650f", "#f2ebdf"],
  ["dangote-cement", "bag", "#5a7b98", "#ece7dc"],
  ["bua-cement", "bag", "#c14a3a", "#f1e8dc"],
  ["iron-rods-12mm", "rods", "#7a8894", "#ebe6dc"],
  ["iron-rods-16mm", "rods", "#5f6b76", "#eae5db"],
  ["aluminium-roofing-sheet", "sheet", "#9db3c4", "#ece7dd"],
  ["stepped-roofing-tile", "sheet", "#8a4a3c", "#f0e9dd"],
  ["floor-tiles-60x60", "tile", "#d9d2c6", "#f1ece1"],
  ["emulsion-paint-20l", "bucket", "#3f7fa8", "#e9f0f5"],
  ["gloss-paint-4l", "bucket", "#1f5c46", "#e9e6da"],
  ["pvc-pipe-4-inch", "pipe", "#e0e4e8", "#eee9df"],
  ["galvanised-pipe-2-inch", "pipe", "#8b96a0", "#ebe6dc"],
  ["bottled-water-carton", "crate", "#3f93c4", "#eae6db"],
  ["soft-drinks-crate", "crate", "#c93b3b", "#f2e7db"],
  ["malt-drink-carton", "crate", "#7a4a1e", "#f0e9dd"],
  ["table-water-sachet-bag", "bottle", "#4aa6c4", "#e9e5da"],
  ["petrol-generator-6-5kva", "machine", "#c94f2a", "#f2e8dc"],
  ["diesel-generator-15kva", "machine", "#2c4a63", "#e8e3d8"],
  ["gas-cooker-4-burner", "machine", "#3b4a55", "#eae5db"],
  ["surface-water-pump", "machine", "#1f6f8f", "#e9e5db"],
  ["safety-helmet", "helmet", "#f0a22e", "#f4ecdd"],
  ["safety-boots", "helmet", "#3b2f27", "#eee8dd"],
  ["fire-extinguisher-9kg", "cylinder", "#b02a2a", "#f1e6da"],
  ["jerry-can-25l", "jerrycan", "#e0e4e8", "#eee9df"],
];

for (const [slug, shape, colour, tint] of art) {
  writeFileSync(`public/products/${slug}.svg`, frame(shapes[shape](colour), tint));
}

// Category tiles sit behind a dark overlay, so their artwork is drawn light on
// a light ground — it reads as a watermark rather than disappearing.
const categoryArt = [
  ["petroleum-products", "drum", "#d97b24", "#efeae0"],
  ["lubricants-and-oils", "jerrycan", "#c98a3a", "#efeae0"],
  ["building-materials", "bag", "#b7ab93", "#efeae0"],
  ["beverages-and-consumables", "crate", "#c06a3c", "#efeae0"],
  ["appliances-and-power", "machine", "#a8763f", "#efeae0"],
  ["safety-and-industrial", "helmet", "#d97b24", "#efeae0"],
];

for (const [slug, shape, colour, tint] of categoryArt) {
  writeFileSync(`public/categories/${slug}.svg`, frame(shapes[shape](colour), tint));
}

console.log(`Generated ${art.length} product tiles and ${categoryArt.length} category tiles.`);
