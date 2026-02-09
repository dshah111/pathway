import { X, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseCategory } from "@/lib/course-categories";

export interface Course {
  id: string;
  name: string;
  code?: string;
  credits: number;
  type: "ai" | "user";
}

interface CourseChipProps {
  course: Course;
  onRemove?: (id: string) => void;
  readonly?: boolean;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function CourseChip({
  course,
  onRemove,
  readonly,
  draggable,
  onDragStart,
}: CourseChipProps) {
  const category = getCourseCategory(course);

  return (
    <div
      className={cn(
        "course-chip course-chip-category flex items-center gap-2 group",
        course.type === "ai" ? "course-chip-ai" : "course-chip-user"
      )}
      data-category={category}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {course.type === "ai" ? (
        <Sparkles className="w-3.5 h-3.5 course-chip-icon" />
      ) : (
        <User className="w-3.5 h-3.5 course-chip-icon" />
      )}
      <span className="flex-1">
        {course.code ? `${course.code}: ${course.name}` : course.name}
      </span>
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
