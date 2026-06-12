// Visual check: drives the real game in headless Chromium and
// captures screenshots of each major scene into test/shots/.
// Run: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=<global modules> node test/screenshot.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const outDir = path.join(__dirname, 'shots');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => { console.error('PAGE ERROR:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  const shot = n => page.screenshot({ path: path.join(outDir, n + '.png') });
  const wait = ms => page.waitForTimeout(ms);
  const key = async (k, times = 1) => { for (let i = 0; i < times; i++) { await page.keyboard.press(k); await wait(80); } };

  await wait(800);
  await key('KeyX');               // boot past attract
  await wait(1200); await shot('1-menu');

  await key('KeyS', 2);            // VERSUS (2 PLAYERS)
  await key('KeyJ'); await wait(400);
  await key('KeyD', 2);            // P1 browses to Prisia
  await key('ArrowRight', 3);      // P2 browses to Tecton
  await shot('2-select');
  await key('KeyJ');               // P1 locks
  await wait(300); await shot('3-select-locked');
  await key('Numpad1');            // P2 locks
  await wait(1400);                // confirm anims
  await key('KeyD', 3);            // browse stages to cathedral
  await shot('4-stageselect');
  await key('KeyJ'); await wait(900); await shot('5-entrance');
  await wait(1200); await shot('6-dialogue');
  await key('KeyJ', 4); await wait(800); await shot('7-fight-banner');
  await wait(900);
  // throw some hits
  await page.keyboard.down('KeyD'); await wait(600); await page.keyboard.up('KeyD');
  await key('KeyJ'); await wait(60); await shot('8-fight-hit');
  await key('KeyU'); await wait(120); await shot('9-fight-heavy');
  await key('KeyL'); await wait(250); await shot('10-special');
  await browser.close();
  console.log('screenshots written to', outDir);
})();
