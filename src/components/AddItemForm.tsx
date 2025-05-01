
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FoundItem, ItemCategory } from "@/types";
import { useLostFound } from "@/context/LostFoundContext";
import { detectItemCategory, getItemNameSuggestions, getDescriptionSuggestions } from "@/utils/ai-utils";

// Import form components
import { FormImageUpload } from "./form/FormImageUpload";
import { ItemInfoFields } from "./form/ItemInfoFields";
import { LocationFields } from "./form/LocationFields";
import { ContactFields } from "./form/ContactFields";
import { CategorySelect } from "./form/CategorySelect";

// Import mock data
import { departments, locations } from "@/data/formOptions";

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
          <FormImageUpload 
            image={image}
            setImage={setImage}
            isProcessing={isProcessing}
            category={category}
          />

          <div className="space-y-4">
            <ItemInfoFields
              itemName={itemName}
              setItemName={setItemName}
              itemDescription={itemDescription}
              setItemDescription={setItemDescription}
              nameSuggestions={nameSuggestions}
              descriptionSuggestions={descriptionSuggestions}
              applySuggestion={applySuggestion}
            />

            <LocationFields
              location={location}
              setLocation={setLocation}
              department={department}
              setDepartment={setDepartment}
              locations={locations}
              departments={departments}
            />

            <ContactFields
              founderName={founderName}
              setFounderName={setFounderName}
              contactInfo={contactInfo}
              setContactInfo={setContactInfo}
            />
          </div>

          <CategorySelect
            category={category}
            setCategory={setCategory}
            hasImage={!!image}
          />
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
