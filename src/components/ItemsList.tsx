
import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ItemCard from "./ItemCard";
import { ItemCategory } from "@/types";
import { useLostFound } from "@/context/LostFoundContext";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Number of items to show per page
const ITEMS_PER_PAGE = 8;

export function ItemsList() {
  const { items, refreshItems, isLoading, error } = useLostFound();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [showClaimed, setShowClaimed] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Default newest first
  const [localLoading, setLocalLoading] = useState(true);

  // Get unique locations from items
  const uniqueLocations = useMemo(() => {
    const locations = items.map(item => item.location);
    return ["all", ...Array.from(new Set(locations))];
  }, [items]);

  // Set up periodic refresh
  useEffect(() => {
    // Set up refresh interval for real-time updates
    const refreshInterval = setInterval(() => {
      refreshItems();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [refreshItems]);

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
    }).sort((a, b) => {
      // Sort by date
      if (sortDirection === "desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
  }, [items, searchQuery, categoryFilter, locationFilter, showClaimed, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, locationFilter, showClaimed, sortDirection]);

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    // Scroll to top of list for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    setLocalLoading(true);
    refreshItems();
    setTimeout(() => setLocalLoading(false), 500); // Add a slight delay for better UI feedback
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
  };

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
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortDirection}
            className="h-10 flex items-center gap-1"
          >
            {sortDirection === "desc" ? (
              <>Newest First <ArrowDown className="h-4 w-4" /></>
            ) : (
              <>Oldest First <ArrowUp className="h-4 w-4" /></>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="h-10"
          >
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col h-full">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2 mt-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-semibold">Error loading items</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={refreshItems} variant="outline">
            Try Again
          </Button>
        </div>
      ) : paginatedItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show limited page numbers to prevent crowding
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-pastel-blue p-6 rounded-full mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground max-w-md">
            {items.length === 0 && !isLoading ? 
              "No items have been reported yet. Be the first to report a lost or found item!" :
              "We couldn't find any items matching your search criteria. Try adjusting your filters or search query."
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default ItemsList;
