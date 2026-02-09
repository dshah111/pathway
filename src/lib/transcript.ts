export type TranscriptCourse = {
  name: string;
  code?: string;
  credits?: number;
};

const IGNORED_KEYWORDS = ["gpa", "semester", "term", "credits", "total", "major", "program"];

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const parseLineToCourse = (line: string): TranscriptCourse | null => {
  const normalized = normalizeWhitespace(line);
  if (!normalized || normalized.length < 3) {
    return null;
  }

  const lower = normalized.toLowerCase();
  if (IGNORED_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return null;
  }

  const separatorMatch = normalized.match(/^(.+?)\s*[-:–—]\s*(.+)$/);
  if (separatorMatch) {
    const code = normalizeWhitespace(separatorMatch[1]);
    const name = normalizeWhitespace(separatorMatch[2]);
    if (!name) {
      return null;
    }
    return { code, name };
  }

  const codeMatch = normalized.match(/^([A-Z]{2,4}\s?\d{2,4}[A-Z]?)\s+(.*)$/);
  if (codeMatch) {
    const code = normalizeWhitespace(codeMatch[1]);
    const name = normalizeWhitespace(codeMatch[2]);
    return { code, name: name || normalized };
  }

  return { name: normalized };
};

export const parseTranscriptText = (text: string): TranscriptCourse[] => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const courses = lines
    .map((line) => parseLineToCourse(line))
    .filter((course): course is TranscriptCourse => Boolean(course));

  const seen = new Set<string>();
  const unique = courses.filter((course) => {
    const key = `${(course.code || "").toLowerCase()}|${course.name.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return unique.slice(0, 8);
};
