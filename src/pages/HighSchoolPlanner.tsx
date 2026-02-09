import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, Save, Trash2 } from "lucide-react";
import {
  SemesterCard,
  AICommandBar,
  TranscriptImportSection,
  WhatIfSimulator,
  ExplainPlanPanel,
  Course,
} from "@/components/planner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";
import { parseTranscriptText } from "@/lib/transcript";

type SemesterData = {
  id: string;
  title: string;
  subtitle: string;
  courses: Course[];
};

const interestAreas = ["STEM", "Humanities", "Arts", "Business", "Social Sciences", "Health Sciences"];

const generateHighSchoolSemesters = (): SemesterData[] => {
  const semesters: SemesterData[] = [];
  const grades = [9, 10, 11, 12];
  const terms = ["Fall", "Spring"];

  grades.forEach((grade) => {
    terms.forEach((term) => {
      semesters.push({
        id: `grade-${grade}-${term.toLowerCase()}`,
        title: `Grade ${grade}`,
        subtitle: term,
        courses: [],
      });
    });
  });

  return semesters;
};

const HIGH_SCHOOL_DRAFT_KEY = "planner:high-school:draft";

export default function HighSchoolPlanner() {
  const [planName, setPlanName] = useState("My Academic Plan");
  const [schoolName, setSchoolName] = useState("");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [academicRigor, setAcademicRigor] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>(generateHighSchoolSemesters);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const stored = localStorage.getItem(HIGH_SCHOOL_DRAFT_KEY);
      if (!stored) {
        return;
      }
      const draft = JSON.parse(stored) as Partial<{
        planName: string;
        schoolName: string;
        targetUniversity: string;
        academicRigor: string;
        selectedInterests: string[];
        semesters: SemesterData[];
      }>;
      setPlanName(draft.planName ?? "My Academic Plan");
      setSchoolName(draft.schoolName ?? "");
      setTargetUniversity(draft.targetUniversity ?? "");
      setAcademicRigor(draft.academicRigor ?? "");
      setSelectedInterests(draft.selectedInterests ?? []);
      if (draft.semesters && draft.semesters.length > 0) {
        setSemesters(draft.semesters);
      } else {
        setSemesters(generateHighSchoolSemesters());
      }
    } catch {
      // Ignore corrupted drafts.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const draft = {
      planName,
      schoolName,
      targetUniversity,
      academicRigor,
      selectedInterests,
      semesters,
    };
    localStorage.setItem(HIGH_SCHOOL_DRAFT_KEY, JSON.stringify(draft));
  }, [planName, schoolName, targetUniversity, academicRigor, selectedInterests, semesters]);

  const totalCourses = semesters.reduce((sum, s) => sum + s.courses.length, 0);
  const totalCredits = semesters.reduce((sum, s) => 
    sum + s.courses.reduce((courseSum, c) => courseSum + c.credits, 0), 0
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddCourse = (semesterId: string, course: Omit<Course, "id">) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId
          ? { ...s, courses: [...s.courses, { ...course, id: crypto.randomUUID() }] }
          : s
      )
    );
  };

  const handleRemoveCourse = (semesterId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
          : s
      )
    );
  };

  const handleMoveCourse = (fromSemesterId: string, toSemesterId: string, courseId: string) => {
    if (fromSemesterId === toSemesterId) {
      return;
    }
    setSemesters((prev) => {
      let movedCourse: Course | null = null;
      const withoutCourse = prev.map((semester) => {
        if (semester.id !== fromSemesterId) {
          return semester;
        }
        const remaining = semester.courses.filter((course) => {
          if (course.id === courseId) {
            movedCourse = course;
            return false;
          }
          return true;
        });
        return { ...semester, courses: remaining };
      });

      if (!movedCourse) {
        return prev;
      }

      return withoutCourse.map((semester) =>
        semester.id === toSemesterId
          ? { ...semester, courses: [...semester.courses, movedCourse as Course] }
          : semester
      );
    });
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: 'high-school',
          planName,
          inputs: {
            schoolName,
            targetUniversity,
            academicRigor,
            areasOfInterest: selectedInterests,
          },
          existingPlan: { semesters },
        }),
      });

      const data = await response.json();
      if (data.success && data.plan && data.plan.semesters) {
        // Map backend semesters to frontend semesters by ID
        const semesterMap = new Map(data.plan.semesters.map((s: SemesterData) => [s.id, s]));
        
        setSemesters((prev) =>
          prev.map((sem) => {
            const aiSem = semesterMap.get(sem.id);
            if (aiSem && aiSem.courses) {
              return {
                ...sem,
                courses: aiSem.courses || [],
              };
            }
            return sem;
          })
        );
        toast({
          title: "Plan Generated!",
          description: "Your AI-powered academic plan is ready.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate plan');
      }
    } catch (error: any) {
      console.error('Generate plan error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to save plans.",
          variant: "destructive",
        });
        return;
      }

      const planData = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        name: planName || "My Academic Plan",
        track: "high-school" as const,
        planName,
        inputs: {
          schoolName,
          targetUniversity,
          academicRigor,
          areasOfInterest: selectedInterests,
        },
        semesters,
        totalCredits,
        totalCourses,
        savedDate: new Date().toISOString(),
      };

      const savedPlans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
      savedPlans.push(planData);
      localStorage.setItem('savedPlans', JSON.stringify(savedPlans));

      toast({
        title: "Plan Saved",
        description: "Your plan has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearPlan = () => {
    setPlanName("My Academic Plan");
    setSchoolName("");
    setTargetUniversity("");
    setAcademicRigor("");
    setSelectedInterests([]);
    setSemesters(generateHighSchoolSemesters());
    if (typeof window !== "undefined") {
      localStorage.removeItem(HIGH_SCHOOL_DRAFT_KEY);
    }
    toast({
      title: "Plan Cleared",
      description: "Your current plan has been cleared.",
    });
  };

  const handleAICommand = async (command: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/edit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: 'high-school',
          command,
          currentPlan: { semesters },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSemesters(data.updatedPlan.semesters);
        toast({
          title: "Plan Updated",
          description: data.summary,
        });
      } else {
        throw new Error(data.error || 'Failed to process command');
      }
    } catch (error: any) {
      console.error('AI command error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process command.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulate = async (scenario: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/simulate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: 'high-school',
          scenario,
          currentPlan: { semesters },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSemesters(data.updatedPlan.semesters);
        toast({
          title: "Scenario Applied",
          description: data.changes.summary,
        });
      } else {
        throw new Error(data.error || 'Failed to simulate scenario');
      }
    } catch (error: any) {
      console.error('Simulate scenario error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to simulate scenario.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranscriptScan = ({
    text,
    fileName,
    classes,
  }: {
    text?: string;
    fileName?: string;
    classes?: { code: string; name: string; credits?: number; semester?: string }[];
  }) => {
    const trimmedText = (text || "").trim();
    if (!trimmedText && (!classes || classes.length === 0)) {
      toast({
        title: "No transcript text found",
        description: fileName
          ? "We couldn't read your transcript. Try pasting the text instead."
          : "Upload a file or paste transcript text before scanning.",
        variant: "destructive",
      });
      return;
    }

    const parsedCourses = classes && classes.length > 0
      ? classes.map((course) => ({
          name: course.name,
          code: course.code,
          credits: course.credits,
          semester: course.semester,
        }))
      : parseTranscriptText(trimmedText);
    if (parsedCourses.length === 0) {
      toast({
        title: "No courses detected",
        description: "We couldn't detect courses in that transcript. Try pasting a cleaner copy.",
        variant: "destructive",
      });
      return;
    }

    const transcriptCourses = parsedCourses.map((course) => ({
      id: crypto.randomUUID(),
      name: course.name,
      code: course.code,
      credits: course.credits ?? 3,
      type: "user" as const,
      semester: "semester" in course ? course.semester : undefined,
    }));

    setSemesters((prev) => {
      const existingKeys = new Set(
        prev
          .flatMap((semester) => semester.courses)
          .map((course) => `${(course.code || "").toLowerCase()}|${course.name.toLowerCase()}`)
      );

      const uniqueCourses = transcriptCourses.filter((course) => {
        const key = `${(course.code || "").toLowerCase()}|${course.name.toLowerCase()}`;
        if (existingKeys.has(key)) {
          return false;
        }
        existingKeys.add(key);
        return true;
      });

      if (uniqueCourses.length === 0) {
        return prev;
      }

      const semesterSlots = prev.map((semester, index) => ({
        index,
        term: semester.subtitle.toLowerCase(),
      }));
      let slotCursor = 0;
      const termKeyToIndex = new Map<string, number>();

      const normalizeTerm = (term: string) => {
        const lower = term.toLowerCase();
        if (lower.startsWith("fall")) return "fall";
        if (lower.startsWith("spring")) return "spring";
        if (lower.startsWith("summer")) return "spring";
        if (lower.startsWith("winter")) return "spring";
        return "";
      };

      const reserveSlotForTerm = (term: string) => {
        for (let i = slotCursor; i < semesterSlots.length; i += 1) {
          if (semesterSlots[i].term === term) {
            slotCursor = i + 1;
            return semesterSlots[i].index;
          }
        }
        if (slotCursor < semesterSlots.length) {
          return semesterSlots[slotCursor++].index;
        }
        return semesterSlots.length > 0 ? semesterSlots[semesterSlots.length - 1].index : -1;
      };

      const additionsByIndex = new Map<number, Course[]>();

      uniqueCourses.forEach((course) => {
        const semesterMatch = course.semester?.match(/(Fall|Spring|Summer|Winter)\s+\d{4}/i);
        let targetIndex = 0;
        if (semesterMatch) {
          const termKey = semesterMatch[0];
          const normalizedTerm = normalizeTerm(semesterMatch[1]);
          if (!termKeyToIndex.has(termKey)) {
            const reserved = normalizedTerm ? reserveSlotForTerm(normalizedTerm) : reserveSlotForTerm("fall");
            termKeyToIndex.set(termKey, reserved);
          }
          targetIndex = termKeyToIndex.get(termKey) ?? 0;
        }
        if (targetIndex < 0) {
          return;
        }
        const existing = additionsByIndex.get(targetIndex) || [];
        existing.push(course);
        additionsByIndex.set(targetIndex, existing);
      });

      return prev.map((semester, index) => {
        const additions = additionsByIndex.get(index);
        if (!additions || additions.length === 0) {
          return semester;
        }
        return { ...semester, courses: [...semester.courses, ...additions] };
      });
    });

    toast({
      title: "Transcript imported",
      description: "Courses added from your transcript.",
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Left Column - Controls */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold text-foreground mb-1">High School Plan</h1>
              <p className="text-muted-foreground">Build your personalized academic plan</p>
            </div>

            {/* Academic Inputs Card */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-fade-in-up">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-name">High School Name</Label>
                <Input
                  id="school-name"
                  placeholder="Enter your high school"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-uni">Target University (Optional)</Label>
                <Input
                  id="target-uni"
                  placeholder="e.g., MIT, Stanford"
                  value={targetUniversity}
                  onChange={(e) => setTargetUniversity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Academic Rigor</Label>
                <Select value={academicRigor} onValueChange={setAcademicRigor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rigor level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Areas of Interest</Label>
                <div className="flex flex-wrap gap-2">
                  {interestAreas.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 animate-fade-in-up">
              <Button
                onClick={handleGeneratePlan}
                className="w-full btn-gradient h-11 text-center justify-center"
                disabled={isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Plan with AI"}
              </Button>

              <Button
                onClick={handleSavePlan}
                className="w-full h-11 bg-emerald-600 text-white hover:bg-emerald-700 text-center justify-center"
                disabled={totalCourses === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Plan
              </Button>

              <Button
                onClick={() => setIsExplainOpen(true)}
                className="w-full h-11 bg-amber-400 text-white hover:bg-amber-500 text-center justify-center"
                disabled={totalCourses === 0}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Explain This Plan
              </Button>

              <Button
                variant="outline"
                onClick={handleClearPlan}
                className="w-full h-11 text-destructive border-destructive/40 hover:bg-destructive/10 text-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Plan
              </Button>
            </div>

            {/* Total Credits Display */}
            {totalCredits > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Credits</span>
                  <span className="text-2xl font-bold text-primary">{totalCredits}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalCourses} {totalCourses === 1 ? 'course' : 'courses'} across all semesters
                </p>
              </div>
            )}

            {/* What If Simulator */}
            <div className="flex-1">
              <WhatIfSimulator onSimulate={handleSimulate} />
            </div>
          </div>

          {/* Right Column - Semester Grid */}
          <div className="space-y-6">
            <TranscriptImportSection onScanTranscript={handleTranscriptScan} />

            {/* Semesters Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {semesters.map((semester, index) => (
                <div
                  key={semester.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <SemesterCard
                    semesterId={semester.id}
                    title={semester.title}
                    subtitle={semester.subtitle}
                    courses={semester.courses}
                    onAddCourse={(course) => handleAddCourse(semester.id, course)}
                    onRemoveCourse={(courseId) => handleRemoveCourse(semester.id, courseId)}
                    onMoveCourse={handleMoveCourse}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border/60 pt-6">
          <div className="rounded-xl bg-muted/30 p-2">
            <AICommandBar onCommand={handleAICommand} isLoading={isGenerating} />
          </div>
        </div>

        {/* Explain Plan Panel */}
        <ExplainPlanPanel
          open={isExplainOpen}
          onOpenChange={setIsExplainOpen}
          planType="High School"
          plan={{ semesters }}
          track="high-school"
        />
      </div>
    </AppLayout>
  );
}
