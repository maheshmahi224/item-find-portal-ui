
import React, { useState } from "react";
import { FoundItem } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLostFound } from "@/context/LostFoundContext";
import { Clock, Trash, Share } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { resolveImageUrl } from "@/services/api";

interface ItemCardProps {
  item: FoundItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const [claimantName, setClaimantName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { claimItem, deleteItem } = useLostFound();

  const daysSinceCreation = () => {
    const now = new Date();
    const createdDate = new Date(item.createdAt);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const timeUntilExpiry = () => {
    const now = new Date();
    const createdDate = new Date(item.createdAt);
    const expiryDate = new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffTime = expiryDate.getTime() - now.getTime();
    
    // If time is up, return empty string
    if (diffTime <= 0) return "";
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const handleClaimSubmit = () => {
    if (claimantName.trim()) {
      claimItem(item.id, claimantName);
      setIsDialogOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const expiryAlert = () => {
    const now = new Date();
    const createdDate = new Date(item.createdAt);
    const expiryDate = new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffHours <= 12) {
      return (
        <Alert variant="destructive" className="mt-3 py-2">
          <AlertDescription className="text-xs">
            This item will expire soon! Only {timeUntilExpiry()} left before automatic deletion.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };
  
  // Share functionality
  const shareItem = (platform: 'whatsapp' | 'telegram' | 'email') => {
    const itemDetails = `
      Found Item: ${item.name}
      Description: ${item.description || 'No description provided'}
      Category: ${item.category}
      Location: ${item.location}
      Department: ${item.department}
      Found by: ${item.founderName}
      Contact: ${item.contactInfo || 'No contact provided'}
      Date Found: ${formatDate(item.createdAt)}
    `;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(itemDetails)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(itemDetails)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Found Item: ${encodeURIComponent(item.name)}&body=${encodeURIComponent(itemDetails)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    
    toast.success(`Sharing item via ${platform}`);
  };

  const cardOpacityClass = item.claimed ? "opacity-70" : "opacity-100";

  return (
    <Card className={`overflow-hidden card-hover h-full flex flex-col ${cardOpacityClass} transition-opacity`}>
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={resolveImageUrl(item.imageUrl)} 
          alt={item.name} 
          className="w-full h-full object-cover"
          loading="lazy"
          crossOrigin="anonymous"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const current = img.getAttribute('src') || '';
            // Try switching to .webp for legacy records that still point to .jpg/.jpeg/.png
            if (/\.(jpg|jpeg|png)(\?.*)?$/i.test(current)) {
              const webpSrc = current.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
              img.onerror = () => {
                img.src = '/placeholder.svg';
              };
              img.src = webpSrc;
              return;
            }
            img.src = '/placeholder.svg';
          }}
        />
        {item.claimed && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg uppercase tracking-wider">Claimed</span>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg line-clamp-1">{item.name}</h3>
          <span className="bg-pastel-blue text-xs rounded-full px-2 py-1">
            {item.category}
          </span>
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
        )}
        
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Location:</span> {item.location}
          </p>
          <p>
            <span className="font-medium">Department:</span> {item.department}
          </p>
          <p>
            <span className="font-medium">Found by:</span> {item.founderName}
          </p>
          {item.contactInfo && (
            <p>
              <span className="font-medium">Contact:</span> {item.contactInfo}
            </p>
          )}
        </div>
        
        {!item.claimed && expiryAlert()}
        
        {item.claimed && (
          <Alert className="mt-3 py-2 bg-pastel-green border-green-200">
            <AlertDescription className="text-xs">
              Claimed by {item.claimedBy} on {item.claimedAt && formatDate(item.claimedAt)}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formatDate(item.createdAt)}</span>
        </div>
        
        {!item.claimed ? (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => shareItem('whatsapp')}
                  >
                    WhatsApp
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => shareItem('telegram')}
                  >
                    Telegram
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => shareItem('email')}
                  >
                    Email
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => deleteItem(item.id)}
              className="h-8"
            >
              <Trash className="h-4 w-4" />
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 btn-hover">Claim</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Claim this item</DialogTitle>
                  <DialogDescription>
                    If this is your item, please enter your name to claim it.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimant-name">Your Name</Label>
                    <Input
                      id="claimant-name"
                      placeholder="Enter your name"
                      value={claimantName}
                      onChange={(e) => setClaimantName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleClaimSubmit} disabled={!claimantName.trim()}>
                    Confirm Claim
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => shareItem('whatsapp')}
                  >
                    WhatsApp
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => shareItem('telegram')}
                  >
                    Telegram
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => shareItem('email')}
                  >
                    Email
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground font-medium">CLAIMED</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ItemCard;
