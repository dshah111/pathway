import express from 'express';
import { callGemini } from '../services/gemini.js';

export const editPlanRouter = express.Router();

editPlanRouter.post('/', async (req, res) => {
  try {
    const { track, command, currentPlan } = req.body;

    if (!track || !command || !currentPlan) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: track, command, currentPlan'
      });
    }

    // Extract user courses that must be preserved
    const userCourses = currentPlan.semesters?.flatMap((sem: any) =>
      sem.courses?.filter((c: any) => c.type === "user") || []
    ) || [];

    const prompt = `Apply this natural language command to the academic plan: "${command}"

Track: ${track}
Current Plan: ${JSON.stringify(currentPlan, null, 2)}

CRITICAL RULES:
1. Interpret the command and apply structured edits
2. Do NOT regenerate the entire plan - make minimal, targeted changes
3. Preserve ALL courses with type="user" - they must remain unchanged
4. Only modify what's necessary to fulfill the command
5. Maintain prerequisite chains
6. Keep credit loads balanced

Return ONLY valid JSON with this exact structure:
{
  "updatedPlan": {
    "semesters": [
      {
        "id": "grade-9-fall",
        "title": "Grade 9",
        "subtitle": "Fall 2026",
        "courses": [
          {
            "id": "course-id",
            "name": "Course Name",
            "credits": 1,
            "type": "ai"
          }
        ]
      }
    ]
  },
  "summary": "Brief description of changes applied (e.g., 'Moved all math courses from fall to spring semesters')"
}

Apply the command now:`;

    const geminiResponse = await callGemini(prompt);

    if (!geminiResponse.success || !geminiResponse.data) {
      return res.status(500).json({
        success: false,
        error: geminiResponse.error || 'Failed to process command'
      });
    }

    // Validate response structure
    if (!geminiResponse.data.updatedPlan || !geminiResponse.data.summary) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format from AI'
      });
    }

    // Ensure user courses are preserved
    const mergedSemesters = geminiResponse.data.updatedPlan.semesters.map((sem: any) => {
      const currentSem = currentPlan.semesters?.find((s: any) => s.id === sem.id);
      const userCoursesInSem = currentSem?.courses?.filter((c: any) => c.type === "user") || [];
      const aiCourses = sem.courses?.filter((c: any) => c.type === "ai") || [];
      
      return {
        ...sem,
        courses: [...userCoursesInSem, ...aiCourses]
      };
    });

    res.json({
      success: true,
      updatedPlan: {
        semesters: mergedSemesters
      },
      summary: geminiResponse.data.summary
    });
  } catch (error: any) {
    console.error('Edit plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

