import dotenv from 'dotenv';
import app from './app.js';
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Pathway API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

