
import React, { useState, useEffect } from "react";
import { ImageDropzone } from "./ImageDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FoundItem, ItemCategory } from "@/types";
import { useLostFound } from "@/context/LostFoundContext";
import { detectItemCategory, getItemNameSuggestions, getDescriptionSuggestions } from "@/utils/ai-utils";

// Mock department data
const departments = [
  { id: "cs", name: "Computer Science" },
  { id: "eng", name: "Engineering" },
  { id: "arts", name: "Arts & Humanities" },
  { id: "sci", name: "Science" },
  { id: "bus", name: "Business" },
  { id: "med", name: "Medical" },
  { id: "lib", name: "Library" },
  { id: "cafe", name: "Cafeteria" },
  { id: "admin", name: "Administration" },
  { id: "other", name: "Other" },
];

// Mock location data
const locations = [
  { id: "lib", name: "Library" },
  { id: "cafe", name: "Cafeteria" },
  { id: "lobby", name: "Main Lobby" },
  { id: "gym", name: "Gymnasium" },
  { id: "lab", name: "Laboratories" },
  { id: "cls", name: "Classrooms" },
  { id: "park", name: "Parking Lot" },
  { id: "dorm", name: "Dormitories" },
  { id: "field", name: "Sports Field" },
  { id: "other", name: "Other" },
];

export function AddItemForm() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("/placeholder.svg");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [founderName, setFounderName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.Other);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);

  const { addItem } = useLostFound();

  // Process image with AI when it changes
  useEffect(() => {
    const processImage = async () => {
      if (!image) return;

      setIsProcessing(true);
      try {
        // Detect category from image
        const detectedCategory = await detectItemCategory(image);
        setCategory(detectedCategory);

        // Get name suggestions based on category
        const suggestions = await getItemNameSuggestions(image, detectedCategory);
        setNameSuggestions(suggestions);

        // Get description suggestions if we have a name
        if (itemName) {
          const descSuggestions = await getDescriptionSuggestions(image, detectedCategory, itemName);
          setDescriptionSuggestions(descSuggestions);
        }

        // Create a temporary URL for the image
        const imageObjectUrl = URL.createObjectURL(image);
        setImageUrl(imageObjectUrl);

        // Clean up on unmount
        return () => URL.revokeObjectURL(imageObjectUrl);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("Failed to process image with AI");
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [image]);

  // Update description suggestions when item name changes
  useEffect(() => {
    const updateDescriptionSuggestions = async () => {
      if (!image || !itemName) return;
      
      try {
        const suggestions = await getDescriptionSuggestions(image, category, itemName);
        setDescriptionSuggestions(suggestions);
      } catch (error) {
        console.error("Error getting description suggestions:", error);
      }
    };

    updateDescriptionSuggestions();
  }, [itemName, category, image]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      toast.error("Please upload an image of the found item");
      return;
    }
    
    if (!itemName || !location || !department || !founderName) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newItem: Omit<FoundItem, "id" | "createdAt" | "claimed"> = {
      name: itemName,
      description: itemDescription,
      location,
      department,
      founderName,
      contactInfo,
      imageUrl,
      category,
    };

    addItem(newItem);
    resetForm();
  };

  const resetForm = () => {
    setImage(null);
    setImageUrl("/placeholder.svg");
    setItemName("");
    setItemDescription("");
    setLocation("");
    setDepartment("");
    setContactInfo("");
    setCategory(ItemCategory.Other);
    setNameSuggestions([]);
    setDescriptionSuggestions([]);
  };

  const applySuggestion = (suggestion: string, type: "name" | "description") => {
    if (type === "name") {
      setItemName(suggestion);
    } else {
      setItemDescription(suggestion);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Add a Found Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="itemName">Item Name*</Label>
              <Input
                id="itemName"
                placeholder="What did you find?"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
              {nameSuggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <p className="text-sm text-muted-foreground w-full">Suggestions:</p>
                  {nameSuggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => applySuggestion(suggestion, "name")}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
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
              {descriptionSuggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <p className="text-sm text-muted-foreground w-full">Suggestions:</p>
                  {descriptionSuggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => applySuggestion(suggestion, "description")}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="location">Location*</Label>
                <Select 
                  value={location} 
                  onValueChange={setLocation}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where was it found?" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.name}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="department">Department*</Label>
                <Select 
                  value={department} 
                  onValueChange={setDepartment}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="founderName">Your Name*</Label>
              <Input
                id="founderName"
                placeholder="Who found this item?"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                placeholder="Email or phone number (optional)"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
          </div>

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
              {image ? "Category automatically detected from image" : "Category will be detected when you upload an image"}
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={resetForm}>
          Reset
        </Button>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          className="btn-hover"
          disabled={isProcessing || !image || !itemName || !location || !department || !founderName}
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddItemForm;
