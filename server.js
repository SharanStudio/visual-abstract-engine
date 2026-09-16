import express from 'express';
import dotenv from 'dotenv';
import chatHandler from './api/chat';
import generateAbstractHandler from './api/generate-abstract';
import exportPngHandler from './api/export-png';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Visual Abstract Engine API Running' });
});

// Mount API handlers
app.post('/api/chat', chatHandler);
app.post('/api/generate-abstract', generateAbstractHandler);
app.post('/api/export-png', exportPngHandler);

// Handle OPTIONS requests for CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
