
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemCategory } from "@/types";

interface CategorySelectProps {
  category: ItemCategory;
  setCategory: (category: ItemCategory) => void;
  hasImage: boolean;
}

export function CategorySelect({ category, setCategory, hasImage }: CategorySelectProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="category">Category</Label>
      <Select 
        value={category} 
        onValueChange={(val) => setCategory(val as ItemCategory)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ItemCategory).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        {hasImage ? "Category automatically detected from image" : "Category will be detected when you upload an image"}
      </p>
    </div>
  );
}
