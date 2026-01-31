import { useNavigate } from "react-router-dom";
import { Sparkles, GraduationCap, Building2, BookOpen, ArrowRight, Calendar, Target, TrendingUp, Users } from "lucide-react";
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

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "AI optimizes your course load across semesters for balanced workload and prerequisite fulfillment.",
  },
  {
    icon: Target,
    title: "Goal-Oriented Planning",
    description: "Set your graduation timeline and career goals—our AI builds the path to get you there.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your academic journey with visual progress indicators and milestone tracking.",
  },
  {
    icon: Users,
    title: "Collaborative Tools",
    description: "Share plans with advisors and get feedback to refine your academic strategy.",
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

        {/* Features Section */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Powered by Intelligent Planning
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Pathway combines AI technology with academic expertise to help you make informed decisions about your education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/10 border border-primary/10 animate-fade-in-up" style={{ animationDelay: "0.9s" }}>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">10,000+</div>
              <div className="text-sm text-muted-foreground">Plans Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Graduation Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Universities Supported</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
