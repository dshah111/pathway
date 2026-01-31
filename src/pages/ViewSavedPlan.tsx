import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, GraduationCap, Building2, BookOpen } from "lucide-react";
import { CourseChip, Course } from "@/components/planner";

// Mock data for saved plan view
const mockPlanData = {
  id: "1",
  name: "CS Major - 4 Year Plan",
  track: "university" as const,
  courseCount: 48,
  savedDate: "Jan 14, 2024",
  semesters: [
    {
      id: "1",
      title: "Freshman",
      subtitle: "Fall 2024",
      courses: [
        { id: "1", name: "Introduction to Computer Science", credits: 4, type: "ai" as const },
        { id: "2", name: "Calculus I", credits: 4, type: "ai" as const },
        { id: "3", name: "English Composition", credits: 3, type: "user" as const },
        { id: "4", name: "General Chemistry", credits: 4, type: "ai" as const },
      ],
    },
    {
      id: "2",
      title: "Freshman",
      subtitle: "Spring 2025",
      courses: [
        { id: "5", name: "Data Structures", credits: 4, type: "ai" as const },
        { id: "6", name: "Calculus II", credits: 4, type: "ai" as const },
        { id: "7", name: "Physics I", credits: 4, type: "ai" as const },
        { id: "8", name: "Public Speaking", credits: 3, type: "user" as const },
      ],
    },
    {
      id: "3",
      title: "Sophomore",
      subtitle: "Fall 2025",
      courses: [
        { id: "9", name: "Algorithms", credits: 4, type: "ai" as const },
        { id: "10", name: "Linear Algebra", credits: 3, type: "ai" as const },
        { id: "11", name: "Discrete Mathematics", credits: 3, type: "ai" as const },
      ],
    },
    {
      id: "4",
      title: "Sophomore",
      subtitle: "Spring 2026",
      courses: [
        { id: "12", name: "Computer Architecture", credits: 4, type: "ai" as const },
        { id: "13", name: "Probability & Statistics", credits: 3, type: "ai" as const },
        { id: "14", name: "Database Systems", credits: 3, type: "ai" as const },
      ],
    },
  ],
};

const trackIcons = {
  "high-school": GraduationCap,
  university: Building2,
  masters: BookOpen,
};

export default function ViewSavedPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In real app, fetch plan by ID
  const plan = mockPlanData;
  const Icon = trackIcons[plan.track];

  const handleDownload = () => {
    // Simulate download
    const planData = JSON.stringify(plan, null, 2);
    const blob = new Blob([planData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.name.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in-up">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/saved-plans")}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Saved Plans
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
                <p className="text-muted-foreground">
                  {plan.courseCount} courses • Saved {plan.savedDate}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Plan
          </Button>
        </div>

        {/* Semesters Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {plan.semesters.map((semester, index) => (
            <div
              key={semester.id}
              className="bg-card border border-border rounded-xl p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-foreground">{semester.title}</h4>
                  <p className="text-sm text-muted-foreground">{semester.subtitle}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {semester.courses.reduce((sum, c) => sum + c.credits, 0)} credits
                </span>
              </div>

              {/* Courses */}
              <div className="space-y-2">
                {semester.courses.map((course) => (
                  <CourseChip key={course.id} course={course} readonly />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
