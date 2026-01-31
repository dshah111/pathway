import { useState } from "react";
import { Lightbulb, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ExplainPlanPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: string;
}

const mockExplanations = [
  {
    title: "Core Requirements First",
    content: "Your plan starts with foundational courses in the first year because they serve as prerequisites for more advanced coursework. This sequencing ensures you meet requirements before tackling specialized topics.",
  },
  {
    title: "Credit Load Balance",
    content: "Each semester is balanced between 15-18 credits to maintain a manageable workload. Heavier conceptual courses are paired with lighter electives to prevent burnout.",
  },
  {
    title: "Prerequisite Chains",
    content: "Math courses follow a strict sequence: Calculus I → Calculus II → Linear Algebra. Similarly, introductory courses in your major must be completed before upper-division requirements.",
  },
  {
    title: "Graduation Timeline",
    content: "This plan is optimized for a 4-year graduation. All required courses, electives, and general education requirements are distributed to meet degree completion on schedule.",
  },
];

export function ExplainPlanPanel({ open, onOpenChange, planType }: ExplainPlanPanelProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Plan Explanation
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-6">
            Here's why your {planType} plan is structured this way. Our AI considers prerequisites, credit balance, and your goals.
          </p>

          <div className="space-y-3">
            {mockExplanations.map((item, index) => {
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
