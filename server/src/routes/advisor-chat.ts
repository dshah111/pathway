import express from 'express';
import { callGemini } from '../services/gemini.js';

export const advisorChatRouter = express.Router();

advisorChatRouter.post('/', async (req, res) => {
  try {
    const { plan, message, conversationHistory } = req.body;

    if (!plan || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: plan, message'
      });
    }

    // Build conversation context
    const historyContext = conversationHistory && conversationHistory.length > 0
      ? conversationHistory.slice(-5).map((msg: any) => 
          `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.content}`
        ).join('\n')
      : '';

    const prompt = `You are an academic advisor helping a student with their academic plan.

Student's Plan:
Name: ${plan.name}
Track: ${plan.track}
Total Credits: ${plan.totalCredits}
Total Courses: ${plan.totalCourses}
Semesters: ${JSON.stringify(plan.semesters, null, 2)}

${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}
Student's Question: "${message}"

Provide helpful, specific advice about their academic plan. Consider:
- Course sequencing and prerequisites
- Credit load balance
- Workload management
- Academic goals alignment
- Potential improvements

Respond in a friendly, professional tone. Be specific and actionable.

Return ONLY the response text, no JSON formatting, no markdown code blocks.`;

    const geminiResponse = await callGemini(prompt);

    if (!geminiResponse.success || !geminiResponse.data) {
      return res.status(500).json({
        success: false,
        error: geminiResponse.error || 'Failed to generate response'
      });
    }

    // Extract text response (handle both JSON and plain text)
    let responseText = '';
    if (typeof geminiResponse.data === 'string') {
      responseText = geminiResponse.data;
    } else if (geminiResponse.data.response) {
      responseText = geminiResponse.data.response;
    } else if (geminiResponse.data.text) {
      responseText = geminiResponse.data.text;
    } else {
      responseText = JSON.stringify(geminiResponse.data);
    }

    res.json({
      success: true,
      response: responseText
    });
  } catch (error: any) {
    console.error('Advisor chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

