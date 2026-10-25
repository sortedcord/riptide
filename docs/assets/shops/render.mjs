// Shop cards for the README: `npm run readme:shops [-- market food …]` with those shops running (`npm run dev:<shop>`).
// Each card is the shop's honest home page with a blurred brand panel (logo and name), next to the real apps it
// imitates. Icons in apps/ are the official App Store (India) icons, fetched once by hand.
// Set CHROMIUM_PATH if Playwright's own browser build is not installed.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const DIR = import.meta.dirname;
const FONT = path.join(DIR, "../fonts/Poppins-Medium.ttf");
const SHOPS = {
  market: { port: 3001, name: "Cartwheel", tile: "#0c5a45", apps: [["amazon", "Amazon"], ["flipkart", "Flipkart"], ["zepto", "Zepto"]] },
  food: { port: 3002, name: "Forkful", tile: "#4a1f3d", apps: [["swiggy", "Swiggy"], ["zomato", "Zomato"], ["eatsure", "EatSure"]] },
  air: { port: 3003, name: "Skyline Air", tile: "#ffffff", apps: [["indigo", "IndiGo"], ["airindia", "Air India"], ["spicejet", "SpiceJet"]] },
  saas: { port: 3004, name: "Prism Studio", tile: "#fffdf8", apps: [["photoshop", "Photoshop"], ["canva", "Canva"], ["figma", "Figma"]] },
  ott: { port: 3005, name: "Reelbox", tile: "#1c1524", apps: [["netflix", "Netflix"], ["jiohotstar", "JioHotstar"], ["primevideo", "Prime Video"]] },
};

const data = (file) => `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;

const card = (s, shot, mark) => `<!doctype html><html><head><style>
@font-face { font-family: P; src: url("${`data:font/ttf;base64,${fs.readFileSync(FONT).toString("base64")}`}"); }
* { margin: 0; box-sizing: border-box; }
html, body { background: transparent; font-family: P, sans-serif; }
.card { display: flex; align-items: center; gap: 28px; width: 1000px; height: 400px; padding: 4px; }
.shot { position: relative; width: 700px; height: 392px; border-radius: 22px; overflow: hidden; box-shadow: 0 0 0 1.5px rgb(255 255 255 / .14), 0 14px 30px -14px rgb(0 0 0 / .5); }
.shot > img { width: 100%; height: 100%; object-fit: cover; object-position: left top; display: block; }
.panel { position: absolute; top: 0; right: 0; bottom: 0; width: 220px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 14px; padding-bottom: 34px;
  backdrop-filter: blur(16px) saturate(1.1); background: linear-gradient(to bottom, rgb(0 0 0 / 0), rgb(0 0 0 / .4)); border-left: 1px solid rgb(255 255 255 / .22); }
.tile { width: 96px; height: 96px; border-radius: 24px; display: grid; place-items: center; background: ${s.tile}; box-shadow: 0 10px 24px -8px rgb(0 0 0 / .55), 0 0 0 1px rgb(255 255 255 / .2); }
.tile svg { width: 58px; height: 58px; }
.name { color: #fff; font-size: 25px; letter-spacing: -.01em; text-shadow: 0 2px 10px rgb(0 0 0 / .45); }
.apps { display: flex; flex-direction: column; gap: 22px; }
.app { display: flex; align-items: center; gap: 16px; color: #f08c2e; font-size: 21px; }
.app img { width: 62px; height: 62px; border-radius: 15px; box-shadow: 0 0 0 1px rgb(128 128 128 / .25); }
</style></head><body><div class="card">
<div class="shot"><img src="${shot}"><div class="panel"><div class="tile">${mark}</div><div class="name">${s.name}</div></div></div>
<div class="apps">${s.apps.map(([f, n]) => `<div class="app"><img src="${data(path.join(DIR, "apps", `${f}.png`))}">${n}</div>`).join("")}</div>
</div></body></html>`;

const which = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOPS);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const id of which) {
  const s = SHOPS[id];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await page.goto(`http://localhost:${s.port}/honest`, { waitUntil: "networkidle", timeout: 120000 });
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.waitForTimeout(1000);
  const shot = `data:image/png;base64,${(await page.screenshot()).toString("base64")}`;
  // The logo mark is the first svg in the header's home link. Its colours come from page CSS, so computed paint is
  // inlined on every element before it leaves the page.
  const mark = await page.locator(`header a[href="/honest"]`).first().evaluate((a) => {
    const svg = a.querySelector("svg");
    const c = svg.cloneNode(true);
    const src = [svg, ...svg.querySelectorAll("*")], dst = [c, ...c.querySelectorAll("*")];
    src.forEach((el, i) => {
      const cs = getComputedStyle(el);
      dst[i].setAttribute("style", ["fill", "stroke", "stroke-width", "opacity", "fill-opacity", "stroke-opacity", "color"].map((k) => `${k}:${cs.getPropertyValue(k)}`).join(";"));
    });
    c.removeAttribute("width"); c.removeAttribute("height"); c.removeAttribute("class");
    return c.outerHTML;
  });
  await page.setViewportSize({ width: 1000, height: 400 });
  await page.setContent(card(s, shot, mark));
  await page.screenshot({ path: path.join(DIR, `${id}.png`), omitBackground: true });
  console.log(`docs/assets/shops/${id}.png`);
  await page.close();
}
await browser.close();
