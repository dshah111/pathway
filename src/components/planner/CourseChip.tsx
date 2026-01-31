import { X, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Course {
  id: string;
  name: string;
  credits: number;
  type: "ai" | "user";
}

interface CourseChipProps {
  course: Course;
  onRemove?: (id: string) => void;
  readonly?: boolean;
}

export function CourseChip({ course, onRemove, readonly }: CourseChipProps) {
  return (
    <div
      className={cn(
        "course-chip flex items-center gap-2 group",
        course.type === "ai" ? "course-chip-ai" : "course-chip-user"
      )}
    >
      {course.type === "ai" ? (
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      ) : (
        <User className="w-3.5 h-3.5 text-accent" />
      )}
      <span className="flex-1">{course.name}</span>
      <span className="text-xs text-muted-foreground">{course.credits}cr</span>
      {!readonly && onRemove && (
        <button
          onClick={() => onRemove(course.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      )}
    </div>
  );
}
