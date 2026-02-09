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

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : undefined;

app.use(cors({
  origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pathway API is running' });
});

app.use('/api/generate-plan', generatePlanRouter);
app.use('/api/explain-plan', explainPlanRouter);
app.use('/api/simulate-scenario', simulateScenarioRouter);
app.use('/api/edit-plan', editPlanRouter);
app.use('/api/compare-plans', comparePlansRouter);
app.use('/api/advisor-chat', advisorChatRouter);
app.use('/api/scan-transcript', scanTranscriptRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

export default app;
