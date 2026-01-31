import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, Save } from "lucide-react";
import {
  SemesterCard,
  AICommandBar,
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
import { toast } from "@/hooks/use-toast";

type SemesterData = {
  id: string;
  title: string;
  subtitle: string;
  courses: Course[];
};

const generateUniversitySemesters = (years: number): SemesterData[] => {
  const semesters: SemesterData[] = [];
  const yearLabels = ["Freshman", "Sophomore", "Junior", "Senior", "5th Year"];
  const terms = ["Fall", "Spring"];
  let startYear = 2026;

  for (let year = 0; year < years; year++) {
    terms.forEach((term, termIndex) => {
      semesters.push({
        id: `year-${year + 1}-${term.toLowerCase()}`,
        title: yearLabels[year] || `Year ${year + 1}`,
        subtitle: `${term} ${startYear + year + (termIndex === 1 ? 1 : 0)}`,
        courses: [],
      });
    });
  }

  return semesters;
};

export default function UniversityPlanner() {
  const [planName, setPlanName] = useState("My Academic Plan");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [programs, setPrograms] = useState("");
  const [yearsToFinish, setYearsToFinish] = useState("4");
  const [semesters, setSemesters] = useState<SemesterData[]>(() => generateUniversitySemesters(4));
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalCourses = semesters.reduce((sum, s) => sum + s.courses.length, 0);

  const handleYearsChange = (years: string) => {
    setYearsToFinish(years);
    setSemesters(generateUniversitySemesters(parseInt(years)));
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

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const aiCourses: Record<string, Course[]> = {
        "year-1-fall": [
          { id: "1", name: "Introduction to Computer Science", credits: 4, type: "ai" },
          { id: "2", name: "Calculus I", credits: 4, type: "ai" },
          { id: "3", name: "English Composition", credits: 3, type: "ai" },
          { id: "4", name: "General Chemistry", credits: 4, type: "ai" },
        ],
        "year-1-spring": [
          { id: "5", name: "Data Structures", credits: 4, type: "ai" },
          { id: "6", name: "Calculus II", credits: 4, type: "ai" },
          { id: "7", name: "Physics I", credits: 4, type: "ai" },
          { id: "8", name: "Public Speaking", credits: 3, type: "ai" },
        ],
        "year-2-fall": [
          { id: "9", name: "Algorithms", credits: 4, type: "ai" },
          { id: "10", name: "Linear Algebra", credits: 3, type: "ai" },
          { id: "11", name: "Discrete Mathematics", credits: 3, type: "ai" },
          { id: "12", name: "Technical Writing", credits: 3, type: "ai" },
        ],
        "year-2-spring": [
          { id: "13", name: "Computer Architecture", credits: 4, type: "ai" },
          { id: "14", name: "Probability & Statistics", credits: 3, type: "ai" },
          { id: "15", name: "Database Systems", credits: 3, type: "ai" },
          { id: "16", name: "Ethics in Technology", credits: 3, type: "ai" },
        ],
      };

      setSemesters((prev) =>
        prev.map((s) => ({
          ...s,
          courses: [...s.courses.filter((c) => c.type === "user"), ...(aiCourses[s.id] || [])],
        }))
      );
      setIsGenerating(false);
      toast({
        title: "Plan Generated!",
        description: "Your AI-powered academic plan is ready.",
      });
    }, 2000);
  };

  const handleSavePlan = () => {
    toast({
      title: "Plan Saved",
      description: "Your plan has been saved successfully.",
    });
  };

  const handleAICommand = (command: string) => {
    toast({
      title: "AI Command Received",
      description: `Processing: "${command}"`,
    });
  };

  const handleSimulate = (scenario: string) => {
    toast({
      title: "Simulating Scenario",
      description: `Analyzing: "${scenario}"`,
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Header */}
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold text-foreground mb-1">University Plan</h1>
              <p className="text-muted-foreground">Build your undergraduate academic plan</p>
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
                <Label htmlFor="university">University *</Label>
                <Input
                  id="university"
                  placeholder="Search for your university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Major *</Label>
                <Input
                  id="major"
                  placeholder="e.g., Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minor">Minor (Optional)</Label>
                <Input
                  id="minor"
                  placeholder="e.g., Mathematics"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="programs">Programs (Optional)</Label>
                <Input
                  id="programs"
                  placeholder="e.g., Honors, Pre-Med"
                  value={programs}
                  onChange={(e) => setPrograms(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Years to Finish</Label>
                <Select value={yearsToFinish} onValueChange={handleYearsChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="4">4 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 animate-fade-in-up">
              <Button
                onClick={handleGeneratePlan}
                className="w-full btn-gradient h-11"
                disabled={isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Plan with AI"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsExplainOpen(true)}
                className="w-full h-11"
                disabled={totalCourses === 0}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Explain This Plan
              </Button>

              <Button
                variant="outline"
                onClick={handleSavePlan}
                className="w-full h-11"
                disabled={totalCourses === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Plan
              </Button>
            </div>

            {/* What If Simulator */}
            <WhatIfSimulator onSimulate={handleSimulate} />
          </div>

          {/* Right Column - Semester Grid */}
          <div className="space-y-6">
            {/* AI Command Bar */}
            <AICommandBar onCommand={handleAICommand} isLoading={isGenerating} />

            {/* Semesters Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {semesters.map((semester, index) => (
                <div
                  key={semester.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <SemesterCard
                    title={semester.title}
                    subtitle={semester.subtitle}
                    courses={semester.courses}
                    onAddCourse={(course) => handleAddCourse(semester.id, course)}
                    onRemoveCourse={(courseId) => handleRemoveCourse(semester.id, courseId)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explain Plan Panel */}
        <ExplainPlanPanel
          open={isExplainOpen}
          onOpenChange={setIsExplainOpen}
          planType="University"
        />
      </div>
    </AppLayout>
  );
}
