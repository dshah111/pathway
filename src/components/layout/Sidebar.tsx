import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  GraduationCap,
  Building2,
  BookOpen,
  FolderOpen,
  Sparkles,
} from "lucide-react";

const navigationItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/planner/high-school", label: "High School Plan", icon: GraduationCap },
  { path: "/planner/university", label: "University Plan", icon: Building2 },
  { path: "/planner/masters", label: "Master's / PhD Plan", icon: BookOpen },
  { path: "/saved-plans", label: "Saved Plans", icon: FolderOpen },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-semibold text-foreground">Pathway</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
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
