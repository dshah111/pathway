import { useState, useEffect, useMemo, useRef } from "react";
import { Lightbulb, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type SemesterData = {
  id: string;
  title: string;
  subtitle: string;
  courses: any[];
};

interface ExplainPlanPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: string;
  plan: { semesters: SemesterData[] };
  track: string;
}

export function ExplainPlanPanel({ open, onOpenChange, planType, plan, track }: ExplainPlanPanelProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([0]);
  const [explanations, setExplanations] = useState<Array<{ title: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastPlanKeyRef = useRef<string>("");

  const planKey = useMemo(() => {
    const serialized = plan.semesters.map((semester) => ({
      id: semester.id,
      title: semester.title,
      subtitle: semester.subtitle,
      courses: (semester.courses || []).map((course: any) => ({
        code: course?.code,
        name: course?.name,
        credits: course?.credits,
      })),
    }));
    return JSON.stringify(serialized);
  }, [plan.semesters]);

  const hasCourses = useMemo(() => {
    return plan.semesters.some((semester) => (semester.courses || []).length > 0);
  }, [plan.semesters]);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!hasCourses) {
      setExplanations([]);
      setExpandedItems([0]);
      lastPlanKeyRef.current = planKey;
      return;
    }

    if (planKey === lastPlanKeyRef.current && explanations.length > 0) {
      return;
    }

      setIsLoading(true);
      fetch(apiUrl('/api/explain-plan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, plan }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setExplanations(data.explanations);
            setExpandedItems([0]); // Expand first item by default
            lastPlanKeyRef.current = planKey;
          }
        })
        .catch(error => {
          console.error('Failed to fetch explanation:', error);
          setExplanations([]);
        })
        .finally(() => setIsLoading(false));
  }, [open, plan, track, planKey, hasCourses, explanations.length]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] max-h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Plan Explanation
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 pb-6">
          <p className="text-sm text-muted-foreground mb-6">
            Here's why your {planType} plan is structured this way. Our AI considers prerequisites, credit balance, and your goals.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Analyzing plan...</span>
            </div>
          ) : explanations.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No explanation available. Generate a plan first.
            </div>
          ) : (
            <div className="space-y-3">
              {explanations.map((item, index) => {
              const isExpanded = expandedItems.includes(index);
              return (
                <div
                  key={index}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-foreground">{item.title}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
