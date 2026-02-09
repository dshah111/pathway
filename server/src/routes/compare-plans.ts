import express from 'express';
import { callGemini } from '../services/gemini.js';

export const comparePlansRouter = express.Router();

comparePlansRouter.post('/', async (req, res) => {
  try {
    const { planA, planB } = req.body;

    if (!planA || !planB) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: planA, planB'
      });
    }

    const prompt = `Compare these two academic plans and provide a detailed analysis.

Plan A: ${planA.name}
Track: ${planA.track}
Total Credits: ${planA.totalCredits}
Total Courses: ${planA.totalCourses}
Semesters: ${JSON.stringify(planA.semesters, null, 2)}

Plan B: ${planB.name}
Track: ${planB.track}
Total Credits: ${planB.totalCredits}
Total Courses: ${planB.totalCourses}
Semesters: ${JSON.stringify(planB.semesters, null, 2)}

Provide a comprehensive comparison covering:
1. Summary of both plans
2. Strengths of Plan A
3. Strengths of Plan B
4. Key differences (timeline, credits, workload, depth, etc.)
5. Recommendations for different goals (speed, depth, balance)

Return ONLY valid JSON with this exact structure:
{
  "summary": "Brief comparison summary...",
  "planAStrengths": ["Strength 1", "Strength 2", ...],
  "planBStrengths": ["Strength 1", "Strength 2", ...],
  "keyDifferences": [
    {
      "category": "Timeline",
      "planA": "Description for Plan A",
      "planB": "Description for Plan B",
      "winner": "A" or "B" or "tie"
    }
  ],
  "recommendation": {
    "forSpeed": "Recommendation for speed-focused goals",
    "forDepth": "Recommendation for depth-focused goals",
    "forBalance": "Recommendation for balanced approach"
  }
}

Generate the comparison now:`;

    const geminiResponse = await callGemini(prompt);

    if (!geminiResponse.success || !geminiResponse.data) {
      return res.status(500).json({
        success: false,
        error: geminiResponse.error || 'Failed to generate comparison'
      });
    }

    res.json({
      success: true,
      comparison: geminiResponse.data
    });
  } catch (error: any) {
    console.error('Compare plans error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

