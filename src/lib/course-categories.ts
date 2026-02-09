export type CourseCategory =
  | "cs"
  | "math"
  | "science"
  | "engineering"
  | "humanities"
  | "business"
  | "arts"
  | "health"
  | "language"
  | "education"
  | "law"
  | "public-policy"
  | "communication"
  | "social"
  | "general";

const CATEGORY_PREFIXES: Record<CourseCategory, string[]> = {
  cs: ["CMSC", "CSCI", "CPSC", "COMP", "CS"],
  math: ["MATH", "STAT", "MATHB", "MATHC"],
  science: ["PHYS", "CHEM", "BIOL", "BSCI", "GEOL", "ASTR"],
  engineering: ["ENEE", "ENME", "ENAE", "ENES", "ENSE", "ENCP", "ENBE", "ENMA"],
  business: ["BMGT", "ECON", "ACCT", "FINA", "MKTG", "MGMT", "BFIN", "BLAW"],
  arts: ["ART", "ARTH", "MUSC", "DANC", "THEA", "ARHU", "FILM", "CPBE"],
  health: ["HLTH", "NURS", "KNES", "PHSC", "NSC", "PHSI"],
  language: ["HISP", "FREN", "GERM", "ARAB", "CHIN", "JAPN", "KORE", "ITAL", "RUSS", "PORT"],
  education: ["EDUC", "EDMS", "EDHD", "EDSP"],
  law: ["LAWS", "LASC"],
  "public-policy": ["GVPT", "PUAF", "PLCY", "PPOL", "URSP"],
  communication: ["COMM", "JOUR", "TLPL", "SLLC"],
  humanities: ["ENGL", "HIST", "PHIL", "CLAS", "RLST"],
  social: ["PSYC", "SOCY", "AMST", "ANTH", "LGBT", "GEOG"],
  general: [],
};

const CATEGORY_KEYWORDS: Record<CourseCategory, string[]> = {
  cs: ["computer", "program", "software", "algorithm", "data structures"],
  math: ["calculus", "algebra", "statistics", "probability", "geometry"],
  science: ["physics", "chemistry", "biology", "science", "laboratory"],
  engineering: ["engineering", "systems", "circuits", "mechanics", "design"],
  business: ["business", "economics", "accounting", "finance", "marketing", "management"],
  arts: ["art", "design", "music", "theatre", "film", "dance"],
  health: ["health", "nursing", "kinesiology", "nutrition"],
  language: ["spanish", "french", "german", "arabic", "chinese", "japanese", "korean", "italian", "russian"],
  education: ["education", "teaching", "curriculum", "pedagogy"],
  law: ["law", "legal", "justice"],
  "public-policy": ["public policy", "policy", "government", "civics", "politics"],
  communication: ["communication", "media", "journalism", "speech"],
  humanities: ["writing", "literature", "history", "philosophy"],
  social: ["psychology", "sociology", "anthropology"],
  general: [],
};

export const getCourseCategory = (course: {
  code?: string;
  name?: string;
}): CourseCategory => {
  const code = (course.code || "").toUpperCase().replace(/\s+/g, "");
  const subject = code.match(/^[A-Z]+/)?.[0] || "";

  if (subject) {
    const match = (Object.keys(CATEGORY_PREFIXES) as CourseCategory[]).find((category) =>
      CATEGORY_PREFIXES[category].some((prefix) => subject.startsWith(prefix))
    );
    if (match && match !== "general") {
      return match;
    }
  }

  const name = (course.name || "").toLowerCase();
  if (name) {
    const keywordMatch = (Object.keys(CATEGORY_KEYWORDS) as CourseCategory[]).find((category) =>
      CATEGORY_KEYWORDS[category].some((keyword) => name.includes(keyword))
    );
    if (keywordMatch && keywordMatch !== "general") {
      return keywordMatch;
    }
  }

  return "general";
};

export const getDominantCourseCategory = (
  courses: Array<{ code?: string; name?: string }>
): CourseCategory => {
  if (!courses.length) {
    return "general";
  }
  const counts = new Map<CourseCategory, number>();
  courses.forEach((course) => {
    const category = getCourseCategory(course);
    counts.set(category, (counts.get(category) || 0) + 1);
  });
  let top: CourseCategory = "general";
  let max = 0;
  counts.forEach((count, category) => {
    if (count > max && category !== "general") {
      max = count;
      top = category;
    }
  });
  return top;
};
