
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ItemCard from "./ItemCard";
import { ItemCategory } from "@/types";
import { useLostFound } from "@/context/LostFoundContext";
import { Search } from "lucide-react";

export function ItemsList() {
  const { items } = useLostFound();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [showClaimed, setShowClaimed] = useState(true);

  // Get unique locations from items
  const uniqueLocations = useMemo(() => {
    const locations = items.map(item => item.location);
    return ["all", ...Array.from(new Set(locations))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filter by search query
      const matchesSearch = 
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category
      const matchesCategory = 
        categoryFilter === "all" || 
        item.category === categoryFilter;

      // Filter by location
      const matchesLocation = 
        locationFilter === "all" || 
        item.location === locationFilter;

      // Filter by claimed status
      const matchesClaimed = showClaimed || !item.claimed;

      return matchesSearch && matchesCategory && matchesLocation && matchesClaimed;
    });
  }, [items, searchQuery, categoryFilter, locationFilter, showClaimed]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(ItemCategory).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location === "all" ? "All Locations" : location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant={showClaimed ? "default" : "secondary"}
            size="sm"
            onClick={() => setShowClaimed(!showClaimed)}
            className="h-10"
          >
            {showClaimed ? "Hide Claimed" : "Show Claimed"}
          </Button>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-pastel-blue p-6 rounded-full mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any items matching your search criteria. Try adjusting your filters or search query.
          </p>
        </div>
      )}
    </div>
  );
}

export default ItemsList;
