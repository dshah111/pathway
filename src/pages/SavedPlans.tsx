import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { GraduationCap, Building2, BookOpen, ArrowRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { generatePlanPDF } from "@/lib/pdf-export";
import { getCurrentUser } from "@/lib/auth";

interface SavedPlan {
  id: string;
  name: string;
  track: "high-school" | "university" | "masters";
  courseCount: number;
  totalCredits: number;
  savedDate: string;
  savedDateRaw?: string;
  planName?: string;
  semesters?: any[];
  inputs?: any;
}

const trackIcons = {
  "high-school": GraduationCap,
  university: Building2,
  masters: BookOpen,
};

const trackLabels = {
  "high-school": "High School",
  university: "University",
  masters: "Master's / PhD",
};

const trackBadgeClasses = {
  "high-school": "bg-lime-400/20 text-lime-700 border border-lime-400/50",
  university: "bg-sky-500/10 text-sky-700 border border-sky-500/30",
  masters: "bg-red-500/10 text-red-700 border border-red-500/30",
};

const trackIconClasses = {
  "high-school": "bg-lime-400/20 text-lime-600",
  university: "bg-sky-500/10 text-sky-600",
  masters: "bg-red-500/10 text-red-600",
};

export default function SavedPlans() {
  const navigate = useNavigate();
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const loadSavedPlans = () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setSavedPlans([]);
        return;
      }

      const plans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
      // Filter plans by current user
      const userPlans = plans.filter((plan: any) => plan.userId === currentUser.id);
      
      // Format plans for display
      const formattedPlans: SavedPlan[] = userPlans.map((plan: any) => {
        const savedDateRaw = plan.savedDate;
        const savedDate = savedDateRaw
          ? new Date(savedDateRaw).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Unknown';

        return {
          // Spread first so our computed fields override raw ones
          ...plan,
          id: plan.id,
          name: plan.name || plan.planName || 'Untitled Plan',
          track: plan.track,
          courseCount:
            plan.totalCourses ||
            plan.semesters?.reduce((sum: number, s: any) => sum + (s.courses?.length || 0), 0) ||
            0,
          totalCredits:
            plan.totalCredits ||
            plan.semesters?.reduce(
              (sum: number, s: any) =>
                sum + (s.courses?.reduce((cSum: number, c: any) => cSum + (c.credits || 0), 0) || 0),
              0,
            ) ||
            0,
          savedDateRaw,
          savedDate,
        };
      });
      setSavedPlans(formattedPlans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
      setSavedPlans([]);
    }
  };

  const handleDelete = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      const plans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
      // Only delete if plan belongs to current user
      const filtered = plans.filter((p: any) => !(p.id === planId && p.userId === currentUser.id));
      localStorage.setItem('savedPlans', JSON.stringify(filtered));
      loadSavedPlans();
      toast({
        title: "Plan Deleted",
        description: "The plan has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete plan.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (plan: SavedPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const planData = {
        name: plan.name,
        track: plan.track,
        planName: plan.planName,
        inputs: plan.inputs,
        semesters: plan.semesters,
        totalCredits: plan.totalCredits,
        totalCourses: plan.courseCount,
        // Use raw date for PDF generation (generatePlanPDF formats it)
        savedDate: plan.savedDateRaw || plan.savedDate,
      };

      generatePlanPDF(planData);
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Saved Plans</h1>
          <p className="text-muted-foreground">
            View and manage your saved academic plans
          </p>
        </div>

        {/* Plans Grid */}
        {savedPlans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No saved plans yet. Create your first plan!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {savedPlans.map((plan, index) => {
              const Icon = trackIcons[plan.track];
              return (
                <div
                  key={plan.id}
                  className="card-interactive p-6 animate-fade-in-up group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/saved-plans/${plan.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trackIconClasses[plan.track]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`badge-track ${trackBadgeClasses[plan.track]}`}>
                      {trackLabels[plan.track]}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {plan.courseCount} {plan.courseCount === 1 ? 'course' : 'courses'} • {plan.totalCredits} credits
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Saved {plan.savedDate}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/saved-plans/${plan.id}`)}
                      className="flex-1 flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-300"
                    >
                      View plan
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleDownload(plan, e)}
                      title="Download plan"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(plan.id, e)}
                      title="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
