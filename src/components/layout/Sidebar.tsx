import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  GraduationCap,
  Building2,
  BookOpen,
  FolderOpen,
  Sparkles,
  GitCompare,
  MessageSquare,
} from "lucide-react";
import pathwayLogo from "@/assets/pathway-logo.png";

const mainNavItems = [
  { path: "/dashboard", label: "Home", icon: Home },
];

const academicPlanningItems = [
  {
    path: "/planner/high-school",
    label: "High School Plan",
    icon: GraduationCap,
    hoverClass: "hover:bg-emerald-500/10",
    activeClass: "bg-emerald-500/15 text-sidebar-foreground border-emerald-400/60",
    iconActive: "text-emerald-300",
  },
  {
    path: "/planner/university",
    label: "University Plan",
    icon: Building2,
    hoverClass: "hover:bg-sky-500/10",
    activeClass: "bg-sky-500/15 text-sidebar-foreground border-sky-400/60",
    iconActive: "text-sky-300",
  },
  {
    path: "/planner/masters",
    label: "Master's Plan",
    icon: BookOpen,
    hoverClass: "hover:bg-red-500/10",
    activeClass: "bg-red-500/15 text-sidebar-foreground border-red-400/60",
    iconActive: "text-red-300",
  },
];

const savedPlansItems = [
  { path: "/saved-plans", label: "Saved Plans", icon: FolderOpen },
  { path: "/compare-plans", label: "Compare Plans", icon: GitCompare },
  { path: "/advisor-chat", label: "Advisor Chat", icon: MessageSquare },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img src={pathwayLogo} alt="Pathway logo" className="w-9 h-9 object-contain" />
        <span className="text-xl font-semibold text-foreground">Pathway</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {/* Main Nav */}
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-primary -ml-[2px]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Academic Planning Section */}
        <div className="mt-6">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Academic Planning
          </p>
          <ul className="space-y-1">
            {academicPlanningItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? `border-l-2 -ml-[2px] ${item.activeClass}`
                        : `text-sidebar-foreground ${item.hoverClass}`
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && item.iconActive)} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Saved Plans & AI Tools */}
        <div className="mt-6">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Saved Plans & AI Tools
          </p>
          <ul className="space-y-1">
            {savedPlansItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-primary -ml-[2px]"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* AI Badge */}
      <div className="p-4 m-3 rounded-xl bg-secondary/50">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-powered planning</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Generate your future</p>
      </div>
    </aside>
  );
}
