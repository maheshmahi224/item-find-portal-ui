
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SuggestionsList } from "./SuggestionsList";

interface ItemInfoFieldsProps {
  itemName: string;
  setItemName: (name: string) => void;
  itemDescription: string;
  setItemDescription: (desc: string) => void;
  nameSuggestions: string[];
  descriptionSuggestions: string[];
  applySuggestion: (suggestion: string, type: "name" | "description") => void;
}

export function ItemInfoFields({ 
  itemName, 
  setItemName, 
  itemDescription, 
  setItemDescription,
  nameSuggestions,
  descriptionSuggestions,
  applySuggestion
}: ItemInfoFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="itemName">Item Name*</Label>
        <Input
          id="itemName"
          placeholder="What did you find?"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <SuggestionsList 
          suggestions={nameSuggestions}
          onApply={(suggestion) => applySuggestion(suggestion, "name")}
          label="Name Suggestions"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="itemDescription">Description</Label>
        <Textarea
          id="itemDescription"
          placeholder="Describe the item (color, condition, etc.)"
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          className="min-h-[100px]"
        />
        <SuggestionsList 
          suggestions={descriptionSuggestions}
          onApply={(suggestion) => applySuggestion(suggestion, "description")}
          label="Description Suggestions"
        />
      </div>
    </>
  );
}
