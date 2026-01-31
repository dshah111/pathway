import { useNavigate } from "react-router-dom";
import { Sparkles, GraduationCap, Building2, BookOpen, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout";

const tracks = [
  {
    id: "high-school",
    title: "High School",
    subtitle: "Grades 9–12",
    description: "Plan your path from freshman to senior year. Track required credits, electives, and extracurriculars.",
    icon: GraduationCap,
    path: "/planner/high-school",
  },
  {
    id: "university",
    title: "University / College",
    subtitle: "Undergraduate",
    description: "Navigate your major requirements, general education, and electives across 4+ years.",
    icon: Building2,
    path: "/planner/university",
  },
  {
    id: "masters",
    title: "Master's / PhD",
    subtitle: "Graduate Studies",
    description: "Structure your advanced coursework, research requirements, and dissertation timeline.",
    icon: BookOpen,
    path: "/planner/masters",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Planning</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Choose your academic planning track
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Select your educational stage below. Our AI will help you generate a personalized multi-year plan with courses tailored to your goals.
          </p>
        </div>

        {/* Track Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {tracks.map((track, index) => {
            const Icon = track.icon;
            return (
              <div
                key={track.id}
                onClick={() => navigate(track.path)}
                className="track-card group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="track-card-icon">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-1">
                  {track.title}
                </h3>
                <p className="text-sm font-medium text-primary mb-3">
                  {track.subtitle}
                </p>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {track.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-300">
                  Start planning
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
