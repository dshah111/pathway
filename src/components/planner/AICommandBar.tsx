import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const suggestions = [
  "Move all math-heavy classes away from fall",
  "Make junior year lighter",
  "Add more AI-focused electives",
  "Prioritize GPA over speed",
];

interface AICommandBarProps {
  onCommand: (command: string) => void;
  isLoading?: boolean;
}

export function AICommandBar({ onCommand, isLoading }: AICommandBarProps) {
  const [command, setCommand] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onCommand(command);
      setCommand("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onCommand(suggestion);
  };

  return (
    <div className="command-bar">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground">AI Command Bar</span>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Type a natural language command to edit your plan..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={isLoading}
          className="mb-3"
        />
      </form>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            className="suggestion-pill"
            disabled={isLoading}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
