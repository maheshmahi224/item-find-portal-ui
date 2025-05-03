
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddItemForm from "./AddItemForm";
import ItemsList from "./ItemsList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart } from "lucide-react";

export function Layout() {
  const [activeTab, setActiveTab] = useState<string>("found-items");

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-blue/20 to-background">
      {/* Header */}
      <header className="px-4 py-6 md:px-6 md:py-8 bg-white shadow-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/601e0f8b-982d-4c2c-a5f1-86e52adccf6e.png" 
                alt="Scient Institute of Technology" 
                className="h-10 md:h-12" 
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold relative">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-purple-600 to-blue-600">
                    findit@scient
                  </span>
                  <span className="absolute -top-3 -right-5 text-xs text-gray-500 font-normal">v1.0</span>
                </h1>
                <p className="text-xs text-muted-foreground hidden md:block">Lost & Found Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                Helping reunite people with their belongings
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 pt-8 pb-16 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-lg grid-cols-2">
              <TabsTrigger value="found-items" className="text-sm md:text-base">
                Found Items
              </TabsTrigger>
              <TabsTrigger value="add-item" className="text-sm md:text-base">
                Report Found Item
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="found-items" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Recently Found Items</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Browse through items that have been found and reported by others. 
                  If you recognize something as yours, you can claim it.
                </p>
              </div>
              <ScrollArea className="h-full">
                <ItemsList />
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="add-item" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Found Something?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Report items that you've found on campus. Upload a photo and provide details to help 
                  others identify their lost belongings.
                </p>
              </div>
              <AddItemForm />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} findit@scient. All rights reserved. 
              <span className="ml-2 uppercase">CRAFTED WITH <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> BY MAHESH (AIML)</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
