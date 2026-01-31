import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { GraduationCap, Building2, BookOpen, ArrowRight } from "lucide-react";

interface SavedPlan {
  id: string;
  name: string;
  track: "high-school" | "university" | "masters";
  courseCount: number;
  savedDate: string;
}

const mockSavedPlans: SavedPlan[] = [
  {
    id: "1",
    name: "CS Major - 4 Year Plan",
    track: "university",
    courseCount: 48,
    savedDate: "Jan 14, 2024",
  },
  {
    id: "2",
    name: "Pre-Med Track",
    track: "university",
    courseCount: 52,
    savedDate: "Jan 9, 2024",
  },
  {
    id: "3",
    name: "High School Honors Path",
    track: "high-school",
    courseCount: 32,
    savedDate: "Jan 4, 2024",
  },
];

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
  "high-school": "badge-track-highschool",
  university: "badge-track-university",
  masters: "badge-track-masters",
};

export default function SavedPlans() {
  const navigate = useNavigate();

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
        {mockSavedPlans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No saved plans yet. Create your first plan!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {mockSavedPlans.map((plan, index) => {
              const Icon = trackIcons[plan.track];
              return (
                <div
                  key={plan.id}
                  className="card-interactive p-6 animate-fade-in-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className={`badge-track ${trackBadgeClasses[plan.track]}`}>
                      {trackLabels[plan.track]}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.courseCount} courses • {plan.savedDate}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/saved-plans/${plan.id}`)}
                    className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-300"
                  >
                    View plan
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
