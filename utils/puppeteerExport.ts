import puppeteer from 'puppeteer';

export interface ExportOptions {
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
}

const DEFAULT_SIZE = 1200;
const DEFAULT_SCALE = 2;

export async function exportHTMLToPNG(
  html: string,
  options: ExportOptions = {}
): Promise<Buffer> {
  const { 
    width = DEFAULT_SIZE, 
    height = DEFAULT_SIZE,
    deviceScaleFactor = DEFAULT_SCALE 
  } = options;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    await page.setViewport({
      width,
      height,
      deviceScaleFactor
    });

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    await page.waitForTimeout(500);

    const screenshot = await page.screenshot({
      type: 'png',
      omitBackground: false
    });

    await page.close();

    return screenshot as Buffer;
  } catch (error) {
    console.error('Puppeteer export error:', error);
    throw new Error(`Failed to export PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function validateHTMLRendering(html: string): Promise<boolean> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: DEFAULT_SIZE, height: DEFAULT_SIZE });

    let hasErrors = false;
    page.on('error', () => {
      hasErrors = true;
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.close();

    return !hasErrors;
  } catch (error) {
    console.error('HTML validation error:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
