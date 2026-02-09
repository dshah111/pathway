import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

export const scanTranscriptRouter = express.Router();

// Helper function to parse classes from transcript text
function parseClasses(text: string) {
  const classes: Array<{
    code: string;
    name: string;
    credits?: number;
    grade?: string;
    semester?: string;
  }> = [];

  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const termHeaderRegex = /^(Fall|Spring|Summer|Winter)(?:\s+[IVX]+)?\s+\d{4}$/i;
  const inlineTermRegex = /(Fall|Spring|Summer|Winter)(?:\s+[IVX]+)?\s+\d{4}/i;
  const currentCoursesHeaderRegex = /^Current Course Information$/i;
  const courseLineRegex =
    /^([A-Z]{2,4})\s*-?\s*(\d{3}[A-Z]?)\s+(.+?)\s+([A-F][+-]?|P|W|I|IP|S|U)\s+(\d+(?:\.\d+)?)/;
  const currentCourseLineRegex =
    /^([A-Z]{2,4})\s*-?\s*(\d{3}[A-Z]?)\s+\d{3,4}\s+(\d+(?:\.\d+)?)\s+REG\b/i;
  const currentCourseInlineRegex =
    /([A-Z]{2,4})\s*-?\s*(\d{3}[A-Z]?)\s+\d{3,4}\s+(\d+(?:\.\d+)?)\s+REG\b/i;
  const fallbackLineRegex =
    /^([A-Z]{2,4})\s*-?\s*(\d{3}[A-Z]?)\s+(.+?)\s+(\d+(?:\.\d+)?)\s+([A-F][+-]?|P|W|I|IP|S|U)\b/i;

  let currentTerm: string | undefined;
  let inCurrentCourses = false;

  const extractValidCredits = (line: string) => {
    const matches = [...line.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]));
    const candidates = matches.filter((value) => value >= 0.5 && value <= 6);
    return candidates.length > 0 ? candidates[candidates.length - 1] : undefined;
  };

  const normalizeCredits = (line: string, credits?: number) => {
    if (credits !== undefined && credits >= 0.5 && credits <= 6) {
      return credits;
    }
    return extractValidCredits(line);
  };

  const addClass = (course: {
    code: string;
    name: string;
    credits?: number;
    grade?: string;
    semester?: string;
  }) => {
    const key = [
      course.code,
      course.semester || "",
      course.grade || "",
      course.credits?.toString() || "",
      course.name,
    ].join("|");
    if (!seen.has(key)) {
      seen.add(key);
      classes.push(course);
    }
  };

  const seen = new Set<string>();

  for (const line of lines) {
    if (currentCoursesHeaderRegex.test(line)) {
      inCurrentCourses = true;
      continue;
    }

    const termMatch = line.match(termHeaderRegex);
    if (termMatch) {
      currentTerm = termMatch[0];
      inCurrentCourses = false;
      continue;
    }

    const inlineTermMatch = line.match(inlineTermRegex);
    if (inlineTermMatch) {
      currentTerm = inlineTermMatch[0];
    }

    const match = line.match(courseLineRegex);
    if (match) {
      const subject = match[1];
      const number = match[2];
      const name = match[3].trim();
      const grade = match[4];
      const credits = normalizeCredits(line, parseFloat(match[5]));
      addClass({
        code: `${subject}${number}`,
        name,
        credits,
        grade,
        semester: currentTerm,
      });
      continue;
    }

    const fallbackMatch = line.match(fallbackLineRegex);
    if (fallbackMatch) {
      const subject = fallbackMatch[1];
      const number = fallbackMatch[2];
      const name = fallbackMatch[3].trim();
      const credits = normalizeCredits(line, parseFloat(fallbackMatch[4]));
      const grade = fallbackMatch[5];
      addClass({
        code: `${subject}${number}`,
        name,
        credits,
        grade,
        semester: currentTerm,
      });
      continue;
    }

    const currentMatch = line.match(currentCourseLineRegex);
    if ((inCurrentCourses || currentMatch) && line.includes("REG")) {
      const matchToUse = currentMatch || line.match(currentCourseInlineRegex);
      if (matchToUse) {
        const subject = matchToUse[1];
        const number = matchToUse[2];
        const credits = normalizeCredits(line, parseFloat(matchToUse[3]));
        addClass({
          code: `${subject}${number}`,
          name: "In Progress",
          credits,
          semester: currentTerm,
        });
      }
    }
  }

  return classes;
}

scanTranscriptRouter.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const providedText = typeof req.body?.text === "string" ? req.body.text : "";
    let text = providedText.trim();

    if (!text && file) {
      if (file.mimetype === "application/pdf") {
        const parsed = await pdfParse(file.buffer);
        text = parsed.text?.trim() || "";
      } else if (file.mimetype.startsWith("image/")) {
        const worker = await createWorker("eng");
        const result = await worker.recognize(file.buffer);
        await worker.terminate();
        text = result.data.text?.trim() || "";
      } else {
        return res.status(400).json({
          success: false,
          error: "Unsupported file type. Please upload a PDF, PNG, or JPG transcript.",
        });
      }
    }

    if (!text) {
      return res.status(422).json({
        success: false,
        error: "No text detected in the transcript.",
      });
    }

    // Parse the classes from the extracted text
    const classes = parseClasses(text);

    if (classes.length === 0) {
      return res.status(422).json({
        success: false,
        error: "No classes detected in the transcript. Please ensure the transcript contains course information.",
        rawText: text, // Include raw text for debugging
      });
    }

    return res.json({ 
      success: true, 
      classes,
      totalClasses: classes.length,
      rawText: text // Optional: include for debugging
    });
  } catch (error: any) {
    console.error("Transcript scan error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to scan transcript.",
    });
  }
});