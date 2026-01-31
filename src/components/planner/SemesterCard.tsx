import { useState } from "react";
import { Plus } from "lucide-react";
import { CourseChip, Course } from "./CourseChip";
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
  title: string;
  subtitle: string;
  courses: Course[];
  onAddCourse: (course: Omit<Course, "id">) => void;
  onRemoveCourse: (id: string) => void;
  readonly?: boolean;
}

export function SemesterCard({
  title,
  subtitle,
  courses,
  onAddCourse,
  onRemoveCourse,
  readonly,
}: SemesterCardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCredits, setNewCourseCredits] = useState("3");

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  const handleAddCourse = () => {
    if (newCourseName.trim()) {
      onAddCourse({
        name: newCourseName.trim(),
        credits: parseInt(newCourseCredits) || 3,
        type: "user",
      });
      setNewCourseName("");
      setNewCourseCredits("3");
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div className="semester-card animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                placeholder="e.g., Introduction to Computer Science"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-credits">Credits</Label>
              <Input
                id="course-credits"
                type="number"
                min="1"
                max="6"
                value={newCourseCredits}
                onChange={(e) => setNewCourseCredits(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCourse} className="btn-gradient">
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
