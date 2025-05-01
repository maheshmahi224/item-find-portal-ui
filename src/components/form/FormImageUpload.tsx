
import React from "react";
import { ImageDropzone } from "../ImageDropzone";
import { Label } from "@/components/ui/label";
import { ItemCategory } from "@/types";

interface FormImageUploadProps {
  image: File | null;
  setImage: (file: File | null) => void;
  isProcessing: boolean;
  category: ItemCategory;
}

export function FormImageUpload({ image, setImage, isProcessing, category }: FormImageUploadProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="image">Item Image</Label>
      <ImageDropzone 
        onImageChange={setImage} 
        value={image}
        className="mt-1"
      />
      {isProcessing && (
        <p className="text-sm text-muted-foreground animate-pulse-light">
          Processing image with AI...
        </p>
      )}
      {image && !isProcessing && (
        <p className="text-xs text-muted-foreground mt-1">
          Category automatically detected: {category}
        </p>
      )}
    </div>
  );
}
