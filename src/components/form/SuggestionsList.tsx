
import React from "react";
import { Button } from "@/components/ui/button";

interface SuggestionsListProps {
  suggestions: string[];
  onApply: (suggestion: string) => void;
  label: string;
}

export function SuggestionsList({ suggestions, onApply, label }: SuggestionsListProps) {
  if (suggestions.length === 0) return null;
  
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <p className="text-sm text-muted-foreground w-full">Suggestions:</p>
      {suggestions.map((suggestion, idx) => (
        <Button
          key={idx}
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onApply(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
