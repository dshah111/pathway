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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

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
  let year = 2026;

  grades.forEach((grade) => {
    terms.forEach((term, termIndex) => {
      semesters.push({
        id: `grade-${grade}-${term.toLowerCase()}`,
        title: `Grade ${grade}`,
        subtitle: `${term} ${year + Math.floor((grade - 9) * 1) + (termIndex === 1 ? 1 : 0)}`,
        courses: [],
      });
    });
  });

  return semesters;
};

export default function HighSchoolPlanner() {
  const [planName, setPlanName] = useState("My Academic Plan");
  const [schoolName, setSchoolName] = useState("");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [academicRigor, setAcademicRigor] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>(generateHighSchoolSemesters);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalCourses = semesters.reduce((sum, s) => sum + s.courses.length, 0);

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

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const aiCourses: Record<string, Course[]> = {
        "grade-9-fall": [
          { id: "1", name: "English 9", credits: 1, type: "ai" },
          { id: "2", name: "Algebra I", credits: 1, type: "ai" },
          { id: "3", name: "Biology", credits: 1, type: "ai" },
          { id: "4", name: "World History", credits: 1, type: "ai" },
        ],
        "grade-9-spring": [
          { id: "5", name: "English 9", credits: 1, type: "ai" },
          { id: "6", name: "Algebra I", credits: 1, type: "ai" },
          { id: "7", name: "Biology", credits: 1, type: "ai" },
          { id: "8", name: "World History", credits: 1, type: "ai" },
        ],
        "grade-10-fall": [
          { id: "9", name: "English 10", credits: 1, type: "ai" },
          { id: "10", name: "Geometry", credits: 1, type: "ai" },
          { id: "11", name: "Chemistry", credits: 1, type: "ai" },
          { id: "12", name: "US History", credits: 1, type: "ai" },
        ],
        "grade-10-spring": [
          { id: "13", name: "English 10", credits: 1, type: "ai" },
          { id: "14", name: "Geometry", credits: 1, type: "ai" },
          { id: "15", name: "Chemistry", credits: 1, type: "ai" },
          { id: "16", name: "US History", credits: 1, type: "ai" },
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
          planType="High School"
        />
      </div>
    </AppLayout>
  );
}
