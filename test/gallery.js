// Renders every roster character in their signature stance to one
// gallery image (test/shots/gallery.png) for art review.
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1700, height: 560 } });
  page.on('pageerror', e => { console.error('PAGE ERROR:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 1700; c.height = 560;
    c.style.cssText = 'position:fixed;inset:0;z-index:99;background:#10141f';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const ids = ROSTER.concat(SECRET_ROSTER);
    ids.forEach((id, i) => {
      const ch = CHARACTERS[id];
      const x = 70 + (i % 9) * 185, y = i < 9 ? 240 : 520;
      const pose = Humanoid.pose(ch.stance || 'idle');
      Humanoid.draw(ctx, ch, pose, { x, y, facing: 1, scale: 1.55, t: 1.2, shadow: true });
      ctx.font = '700 13px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillStyle = ch.theme;
      ctx.fillText(ch.name, x, y + 18);
      ctx.fillStyle = '#7d8aa0';
      ctx.fillText(ch.style + ' / ' + (ch.stance || 'idle'), x, y + 34);
    });
  });
  await page.screenshot({ path: path.join(__dirname, 'shots', 'gallery.png') });
  await browser.close();
  console.log('gallery written');
})();
