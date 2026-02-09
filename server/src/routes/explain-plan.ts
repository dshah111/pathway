import express from 'express';
import { callGemini } from '../services/gemini.js';

export const explainPlanRouter = express.Router();

explainPlanRouter.post('/', async (req, res) => {
  try {
    const { track, plan } = req.body;

    if (!track || !plan || !plan.semesters) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: track, plan'
      });
    }

    const prompt = `Analyze this academic plan and explain the reasoning behind its structure.

Track: ${track}
Plan: ${JSON.stringify(plan, null, 2)}

Provide a structured explanation covering:
1. Course sequencing (why courses are placed early vs late)
2. Prerequisite chains and dependencies
3. Credit/workload balance across semesters
4. Tradeoffs (rigor vs flexibility, speed vs GPA, breadth vs depth)
5. How the plan aligns with track-specific requirements

Return ONLY valid JSON with this exact structure:
{
  "explanations": [
    {
      "title": "Core Requirements First",
      "content": "Detailed explanation paragraph explaining why foundational courses come first..."
    },
    {
      "title": "Credit Load Balance",
      "content": "Explanation of how credits are distributed..."
    },
    {
      "title": "Prerequisite Chains",
      "content": "Explanation of course dependencies..."
    },
    {
      "title": "Graduation Timeline",
      "content": "Explanation of timeline optimization..."
    }
  ]
}

Generate the explanation now:`;

    const geminiResponse = await callGemini(prompt);

    if (!geminiResponse.success || !geminiResponse.data) {
      return res.status(500).json({
        success: false,
        error: geminiResponse.error || 'Failed to generate explanation'
      });
    }

    // Validate response structure
    if (!geminiResponse.data.explanations || !Array.isArray(geminiResponse.data.explanations)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format from AI'
      });
    }

    res.json({
      success: true,
      explanations: geminiResponse.data.explanations
    });
  } catch (error: any) {
    console.error('Explain plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

