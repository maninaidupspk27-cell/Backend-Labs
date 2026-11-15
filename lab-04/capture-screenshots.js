const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });

  const htmlFiles = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith(".html"));

  for (const htmlFile of htmlFiles) {
    const pngFile = htmlFile.replace(".html", ".png");
    const filePath = path.join(SCREENSHOTS_DIR, htmlFile);
    const fileUrl = "file:///" + filePath.replace(/\\/g, "/");

    console.log(`Screenshotting: ${htmlFile} -> ${pngFile}`);
    await page.goto(fileUrl, { waitUntil: "networkidle0" });
    
    // Get full page height
    const bodyHandle = await page.$("body");
    const boundingBox = await bodyHandle.boundingBox();
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, pngFile),
      clip: { x: 0, y: 0, width: 800, height: Math.ceil(boundingBox.height + 48) },
    });
    
    console.log(`  -> Saved ${pngFile}`);
  }

  await browser.close();
  console.log("\nAll screenshots captured!");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
