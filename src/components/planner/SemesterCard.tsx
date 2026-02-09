import { useState } from "react";
import { Plus } from "lucide-react";
import { CourseChip, Course } from "./CourseChip";
import { getDominantCourseCategory } from "@/lib/course-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface SemesterCardProps {
  semesterId: string;
  title: string;
  subtitle: string;
  courses: Course[];
  onAddCourse: (course: Omit<Course, "id">) => void;
  onRemoveCourse: (id: string) => void;
  onMoveCourse?: (fromSemesterId: string, toSemesterId: string, courseId: string) => void;
  readonly?: boolean;
}

export function SemesterCard({
  semesterId,
  title,
  subtitle,
  courses,
  onAddCourse,
  onRemoveCourse,
  onMoveCourse,
  readonly,
}: SemesterCardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseCredits, setNewCourseCredits] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const dominantCategory = getDominantCourseCategory(courses);

  const handleAddCourse = () => {
    if (newCourseName.trim()) {
      onAddCourse({
        name: newCourseName.trim(),
        code: newCourseCode.trim() || undefined,
        credits: newCourseCredits ? parseInt(newCourseCredits) : 3,
        type: "user",
      });
      setNewCourseName("");
      setNewCourseCode("");
      setNewCourseCredits("");
      setIsAddDialogOpen(false);
    }
  };

  const handleDragStart = (courseId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    if (readonly) {
      return;
    }
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ courseId, fromSemesterId: semesterId })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (readonly || !onMoveCourse) {
      return;
    }
    const payload = event.dataTransfer.getData("application/json");
    if (!payload) {
      return;
    }
    try {
      const data = JSON.parse(payload) as { courseId: string; fromSemesterId: string };
      if (!data.courseId || !data.fromSemesterId || data.fromSemesterId === semesterId) {
        return;
      }
      onMoveCourse(data.fromSemesterId, semesterId, data.courseId);
    } catch {
      // Ignore malformed drag payloads.
    }
  };

  return (
    <div
      className={`semester-card animate-fade-in-up ${
        isDragOver ? "border-primary/60 bg-primary/5" : ""
      }`}
      onDragOver={(event) => {
        if (readonly || !onMoveCourse) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {courses.length > 0 && (
            <span className="semester-category-dot" data-category={dominantCategory} />
          )}
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">{totalCredits} credits</span>
      </div>

      {/* Courses */}
      <div className="space-y-2 mb-4 min-h-[80px]">
        {courses.map((course) => (
          <CourseChip
            key={course.id}
            course={course}
            onRemove={onRemoveCourse}
            readonly={readonly}
            draggable={!readonly && Boolean(onMoveCourse)}
            onDragStart={onMoveCourse ? handleDragStart(course.id) : undefined}
          />
        ))}
      </div>

      {/* Add Course Button */}
      {!readonly && (
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add course
        </button>
      )}

      {/* Add Course Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setNewCourseName("");
            setNewCourseCode("");
            setNewCourseCredits("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">
                Course Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="course-name"
                placeholder="e.g., Introduction to Computer Science"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-code">Course Code (optional)</Label>
              <Input
                id="course-code"
                placeholder="e.g., CMSC131"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-credits">Credits (optional)</Label>
              <Input
                id="course-credits"
                type="number"
                min="1"
                max="6"
                placeholder="3"
                value={newCourseCredits}
                onChange={(e) => setNewCourseCredits(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCourse} 
              className="btn-gradient"
              disabled={!newCourseName.trim()}
            >
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
