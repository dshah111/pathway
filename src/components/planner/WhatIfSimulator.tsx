import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const exampleScenarios = [
  "What if I add a CS minor?",
  "What if I want to graduate early?",
  "What if I fail Calculus I?",
  "What if I want lighter semesters during internship year?",
];

interface WhatIfSimulatorProps {
  onSimulate: (scenario: string) => void;
  isLoading?: boolean;
}

export function WhatIfSimulator({ onSimulate, isLoading }: WhatIfSimulatorProps) {
  const [scenario, setScenario] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenario.trim()) {
      onSimulate(scenario);
      setScenario("");
    }
  };

  const handleExampleClick = (example: string) => {
    onSimulate(example);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">What If? Scenario Simulator</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Explore how changes would affect your plan. The AI will recalculate only affected semesters while preserving your user-added courses.
      </p>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          placeholder="e.g., What if I add a Data Science minor?"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !scenario.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Example scenarios */}
      <div className="space-y-2">
        {exampleScenarios.slice(0, 2).map((example) => (
          <button
            key={example}
            onClick={() => handleExampleClick(example)}
            className="w-full text-left px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
