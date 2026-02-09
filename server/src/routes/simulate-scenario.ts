import express from 'express';
import { callGemini } from '../services/gemini.js';

export const simulateScenarioRouter = express.Router();

simulateScenarioRouter.post('/', async (req, res) => {
  try {
    const { track, scenario, currentPlan } = req.body;

    if (!track || !scenario || !currentPlan) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: track, scenario, currentPlan'
      });
    }

    // Extract user courses that must be preserved
    const userCourses = currentPlan.semesters?.flatMap((sem: any) =>
      sem.courses?.filter((c: any) => c.type === "user") || []
    ) || [];

    const prompt = `Apply this scenario to the academic plan: "${scenario}"

Track: ${track}
Current Plan: ${JSON.stringify(currentPlan, null, 2)}

CRITICAL RULES:
1. Apply the scenario change to the plan
2. Recalculate ONLY affected semesters (minimal changes)
3. Preserve ALL courses with type="user" - they must remain unchanged
4. Keep unaffected semesters identical to the current plan
5. Maintain prerequisite chains
6. Balance credit loads appropriately

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
  "changes": {
    "summary": "Brief description of what changed (e.g., 'Added CS minor courses to semesters 3-6, adjusted prerequisites')",
    "affectedSemesters": ["grade-10-fall", "grade-10-spring"]
  }
}

Apply the scenario now:`;

    const geminiResponse = await callGemini(prompt);

    if (!geminiResponse.success || !geminiResponse.data) {
      return res.status(500).json({
        success: false,
        error: geminiResponse.error || 'Failed to simulate scenario'
      });
    }

    // Validate response structure
    if (!geminiResponse.data.updatedPlan || !geminiResponse.data.changes) {
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
      changes: geminiResponse.data.changes
    });
  } catch (error: any) {
    console.error('Simulate scenario error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

