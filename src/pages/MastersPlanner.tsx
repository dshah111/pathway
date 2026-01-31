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

const generateGradSemesters = (years: number): SemesterData[] => {
  const semesters: SemesterData[] = [];
  const terms = ["Fall", "Spring"];
  let startYear = 2026;

  for (let year = 0; year < years; year++) {
    terms.forEach((term, termIndex) => {
      semesters.push({
        id: `year-${year + 1}-${term.toLowerCase()}`,
        title: `Year ${year + 1}`,
        subtitle: `${term} ${startYear + year + (termIndex === 1 ? 1 : 0)}`,
        courses: [],
      });
    });
  }

  return semesters;
};

export default function MastersPlanner() {
  const [planName, setPlanName] = useState("My Graduate Plan");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [programLength, setProgramLength] = useState("2");
  const [semesters, setSemesters] = useState<SemesterData[]>(() => generateGradSemesters(2));
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalCourses = semesters.reduce((sum, s) => sum + s.courses.length, 0);

  const handleProgramLengthChange = (years: string) => {
    setProgramLength(years);
    setSemesters(generateGradSemesters(parseInt(years)));
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
          { id: "1", name: "Advanced Machine Learning", credits: 3, type: "ai" },
          { id: "2", name: "Research Methods", credits: 3, type: "ai" },
          { id: "3", name: "Graduate Seminar I", credits: 1, type: "ai" },
        ],
        "year-1-spring": [
          { id: "4", name: "Deep Learning", credits: 3, type: "ai" },
          { id: "5", name: "Natural Language Processing", credits: 3, type: "ai" },
          { id: "6", name: "Graduate Seminar II", credits: 1, type: "ai" },
        ],
        "year-2-fall": [
          { id: "7", name: "Thesis Research I", credits: 6, type: "ai" },
          { id: "8", name: "Advanced Topics in AI", credits: 3, type: "ai" },
        ],
        "year-2-spring": [
          { id: "9", name: "Thesis Research II", credits: 6, type: "ai" },
          { id: "10", name: "Thesis Defense", credits: 3, type: "ai" },
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
        description: "Your AI-powered graduate plan is ready.",
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
              <h1 className="text-2xl font-bold text-foreground mb-1">Master's / PhD Plan</h1>
              <p className="text-muted-foreground">Build your graduate academic plan</p>
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
                <Label htmlFor="degree">Degree / Concentration *</Label>
                <Input
                  id="degree"
                  placeholder="e.g., MS Computer Science, PhD Biology"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Program Length</Label>
                <Select value={programLength} onValueChange={handleProgramLengthChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="4">4 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="6">6 Years</SelectItem>
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
          planType="Graduate"
        />
      </div>
    </AppLayout>
  );
}
