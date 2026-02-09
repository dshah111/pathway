import express from 'express';
import { callGemini } from '../services/gemini.js';

export const generatePlanRouter = express.Router();

generatePlanRouter.post('/', async (req, res) => {
  try {
    const { track, planName, inputs, existingPlan } = req.body;

    if (!track || !inputs) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: track, inputs'
      });
    }

    // Extract user-added courses (must be preserved)
    const userCourses = existingPlan?.semesters?.flatMap((sem: any) =>
      sem.courses?.filter((c: any) => c.type === "user") || []
    ) || [];

    // Build prompt for Gemini - include existing semester structure so IDs match
    const existingSemesterStructure = existingPlan?.semesters?.map((s: any) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle
    })) || [];

    const prompt = `You are an academic planning assistant. Generate a structured academic plan.

Track: ${track}
Plan Name: ${planName || 'My Academic Plan'}
User Inputs: ${JSON.stringify(inputs, null, 2)}

Existing Semester Structure (USE THESE EXACT IDs, titles, and subtitles):
${JSON.stringify(existingSemesterStructure, null, 2)}

Existing User-Added Courses (DO NOT REMOVE THESE):
${JSON.stringify(userCourses, null, 2)}

Rules:
1. Respect track-specific requirements:
   - High School: 4 years (8 semesters), typical graduation requirements
   - University: ${inputs.yearsToFinish || 4} years, degree requirements for ${inputs.major || 'the major'}
   - Masters: ${inputs.programLength || 2} years, graduate program requirements
2. Honor all prerequisites (e.g., Algebra I before Algebra II, Calculus I before Calculus II)
3. Balance credit loads per semester (12-18 credits for university, 1 credit per course for high school)
4. NEVER remove or modify courses marked as type="user" - they must appear in the final plan
5. Fill remaining slots with appropriate courses based on track and inputs
6. Return ONLY valid JSON, no prose or explanations
7. CRITICAL: Use the EXACT semester IDs, titles, and subtitles from the existing semester structure above

Return a JSON object with this exact structure:
{
  "semesters": [
    {
      "id": "EXACT_ID_FROM_EXISTING_STRUCTURE",
      "title": "EXACT_TITLE_FROM_EXISTING_STRUCTURE",
      "subtitle": "EXACT_SUBTITLE_FROM_EXISTING_STRUCTURE",
      "courses": [
        {
          "id": "generated-uuid-here",
          "name": "Course Name",
          "credits": 1,
          "type": "ai"
        }
      ]
    }
  ]
}

Generate the complete plan now:`;

    const geminiResponse = await callGemini(prompt);

    if (!geminiResponse.success || !geminiResponse.data) {
      return res.status(500).json({
        success: false,
        error: geminiResponse.error || 'Failed to generate plan'
      });
    }

    // Validate response structure
    if (!geminiResponse.data.semesters || !Array.isArray(geminiResponse.data.semesters)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format from AI'
      });
    }

    // Create a set of user course names (normalized) for deduplication
    const userCourseNames = new Set(
      userCourses.map((c: any) => c.name?.toLowerCase().trim())
    );

    // Ensure we have all semesters from existing plan, even if AI didn't return them all
    const existingSemesterIds = existingPlan?.semesters?.map((s: any) => s.id) || [];
    const aiSemesterMap: Map<string, any> = new Map(
      (geminiResponse.data.semesters as any[]).map((sem: any) => [sem.id, sem])
    );

    // Merge user courses back into the plan, filtering out duplicates from AI response
    const mergedSemesters = existingSemesterIds.map((semId: string) => {
      const existingSem = existingPlan?.semesters?.find((s: any) => s.id === semId);
      const aiSem = aiSemesterMap.get(semId) as any;
      
      // Get user courses from existing semester
      const userCoursesInSem = existingSem?.courses?.filter((c: any) => c.type === "user") || [];
      
      // Get AI courses, filtering out duplicates
      const aiCourses = (aiSem?.courses || []).filter((c: any) => {
        const courseName = c.name?.toLowerCase().trim();
        return !userCourseNames.has(courseName);
      });
      
      // Use AI semester data if available, otherwise use existing semester structure
      return {
        id: semId,
        title: aiSem?.title || existingSem?.title || '',
        subtitle: aiSem?.subtitle || existingSem?.subtitle || '',
        courses: [...userCoursesInSem, ...aiCourses]
      };
    });

    res.json({
      success: true,
      plan: {
        semesters: mergedSemesters
      }
    });
  } catch (error: any) {
    console.error('Generate plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

