import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Placeholder route
app.get('/', (req, res) => {
  res.json({ message: 'Visual Abstract Engine API Running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
