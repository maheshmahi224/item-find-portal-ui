
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FoundItem } from "@/types";
import { useLostFound } from "@/context/LostFoundContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";

export function AdminPanel() {
  const { items, deleteItem, refreshItems } = useLostFound();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleLogin = () => {
    // In a real app, you'd authenticate against a server
    // For this demo, we'll use a mock password
    if (password === "admin123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      setItemToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const calculateStats = () => {
    const totalItems = items.length;
    const claimedItems = items.filter(item => item.claimed).length;
    const unclaimedItems = totalItems - claimedItems;
    
    // Get items about to expire (less than 12 hours left)
    const now = new Date();
    const expiringSoon = items.filter(item => {
      if (item.claimed) return false;
      const createdDate = new Date(item.createdAt);
      const expiryDate = new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      const diffHours = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= 12 && diffHours > 0;
    }).length;

    return { totalItems, claimedItems, unclaimedItems, expiringSoon };
  };

  const stats = calculateStats();

  const columns: ColumnDef<FoundItem>[] = [
    {
      accessorKey: "name",
      header: "Item Name",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "founderName",
      header: "Found By",
    },
    {
      accessorKey: "createdAt",
      header: "Date Found",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "claimed",
      header: "Status",
      cell: ({ row }) => {
        const claimed = row.getValue("claimed");
        return claimed ? "Claimed" : "Unclaimed";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => confirmDelete(item.id)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your password to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Admin Panel</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setIsAuthenticated(false)}
              size="sm"
            >
              Logout
            </Button>
          </div>
          <CardDescription>Manage lost and found items</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">All Items</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Total Items</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-bold">{stats.totalItems}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Claimed</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-bold">{stats.claimedItems}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Unclaimed</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-bold">{stats.unclaimedItems}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Expiring Soon</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-bold">{stats.expiringSoon}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={refreshItems}>
                  Refresh Data
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="items">
              <DataTable 
                columns={columns} 
                data={items} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminPanel;
