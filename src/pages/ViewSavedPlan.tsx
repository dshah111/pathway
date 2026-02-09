import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, GraduationCap, Building2, BookOpen } from "lucide-react";
import { CourseChip, Course } from "@/components/planner";
import { SemesterCard } from "@/components/planner";
import { toast } from "@/hooks/use-toast";
import { generatePlanPDF } from "@/lib/pdf-export";
import { getCurrentUser } from "@/lib/auth";

const trackIcons = {
  "high-school": GraduationCap,
  university: Building2,
  masters: BookOpen,
};

const trackIconClasses = {
  "high-school": "bg-lime-400/20 text-lime-600",
  university: "bg-sky-500/10 text-sky-600",
  masters: "bg-red-500/10 text-red-600",
};

export default function ViewSavedPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPlan(id);
    }
  }, [id]);

  const loadPlan = (planId: string) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to view plans.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const plans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
      // Only find plans that belong to current user
      const foundPlan = plans.find((p: any) => p.id === planId && p.userId === currentUser.id);
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        toast({
          title: "Plan Not Found",
          description: "The requested plan could not be found or you don't have access to it.",
          variant: "destructive",
        });
        navigate('/saved-plans');
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      toast({
        title: "Error",
        description: "Failed to load plan.",
        variant: "destructive",
      });
      navigate('/saved-plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!plan) return;
    
    try {
      generatePlanPDF(plan);
      toast({
        title: "Downloaded",
        description: "Plan downloaded as PDF file.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto py-16 text-center">
          <p className="text-muted-foreground">Loading plan...</p>
        </div>
      </AppLayout>
    );
  }

  if (!plan) {
    return null;
  }

  const Icon = trackIcons[plan.track as keyof typeof trackIcons];
  const iconClass = trackIconClasses[plan.track as keyof typeof trackIconClasses] || "bg-secondary text-primary";
  const courseCount = plan.totalCourses || plan.semesters?.reduce((sum: number, s: any) => sum + (s.courses?.length || 0), 0) || 0;
  const savedDate = plan.savedDate ? new Date(plan.savedDate).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }) : 'Unknown';

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
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconClass}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{plan.name || plan.planName || 'Untitled Plan'}</h1>
                <p className="text-muted-foreground">
                  {courseCount} {courseCount === 1 ? 'course' : 'courses'} • {plan.totalCredits || 0} credits • Saved {savedDate}
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
        {plan.semesters && plan.semesters.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {plan.semesters.map((semester: any, index: number) => (
              <SemesterCard
                key={semester.id}
                semesterId={semester.id}
                title={semester.title}
                subtitle={semester.subtitle}
                courses={semester.courses || []}
                onAddCourse={() => {}}
                onRemoveCourse={() => {}}
                readonly
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No semesters found in this plan.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
