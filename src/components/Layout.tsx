
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddItemForm from "./AddItemForm";
import ItemsList from "./ItemsList";
import AdminPanel from "./AdminPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Search } from "lucide-react";

export function Layout() {
  const [activeTab, setActiveTab] = useState<string>("found-items");

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-blue/20 to-background">
      {/* Header */}
      <header className="px-4 py-6 md:px-6 md:py-8 bg-white shadow-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-pastel-blue p-2 rounded-full">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold">Campus Lost & Found</h1>
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
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="found-items" className="text-sm md:text-base">
                Found Items
              </TabsTrigger>
              <TabsTrigger value="add-item" className="text-sm md:text-base">
                Report Found Item
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-sm md:text-base">
                Admin
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

          <TabsContent value="admin" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Admin Portal</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Manage reported items, review claims, and maintain the lost and found system.
                  Requires admin authentication.
                </p>
              </div>
              <AdminPanel />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Campus Lost & Found Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-primary hover:underline">Terms of Service</a>
              <a href="#" className="text-sm text-primary hover:underline">Privacy Policy</a>
              <a href="#" className="text-sm text-primary hover:underline">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
