import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generatePlanRouter } from './routes/generate-plan.js';
import { explainPlanRouter } from './routes/explain-plan.js';
import { simulateScenarioRouter } from './routes/simulate-scenario.js';
import { editPlanRouter } from './routes/edit-plan.js';
import { comparePlansRouter } from './routes/compare-plans.js';
import { advisorChatRouter } from './routes/advisor-chat.js';
import { scanTranscriptRouter } from './routes/scan-transcript.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Vite dev server
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pathway API is running' });
});

// API Routes
app.use('/api/generate-plan', generatePlanRouter);
app.use('/api/explain-plan', explainPlanRouter);
app.use('/api/simulate-scenario', simulateScenarioRouter);
app.use('/api/edit-plan', editPlanRouter);
app.use('/api/compare-plans', comparePlansRouter);
app.use('/api/advisor-chat', advisorChatRouter);
app.use('/api/scan-transcript', scanTranscriptRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Pathway API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

