import { VercelRequest, VercelResponse } from '@vercel/node';
import { exportHTMLToPNG } from '../utils/puppeteerExport';

interface ExportRequest {
  html: string;
  filename?: string;
  width?: number;
  height?: number;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: ExportRequest = req.body;

    if (!body.html) {
      return res.status(400).json({ error: 'Missing required field: html' });
    }

    const filename = body.filename || `abstract_${Date.now()}`;
    const width = body.width || 1200;
    const height = body.height || 1200;

    if (!body.html.includes('<html') && !body.html.includes('<div')) {
      return res.status(400).json({ error: 'Invalid HTML content' });
    }

    const pngBuffer = await exportHTMLToPNG(body.html, {
      width,
      height,
      deviceScaleFactor: 2
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.png"`
    );
    res.setHeader('Content-Length', pngBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.status(200).send(pngBuffer);

  } catch (error) {
    console.error('Export PNG error:', error);
    return res.status(500).json({
      error: 'Failed to export PNG',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
