
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ContactFieldsProps {
  founderName: string;
  setFounderName: (name: string) => void;
  contactInfo: string;
  setContactInfo: (info: string) => void;
}

export function ContactFields({
  founderName,
  setFounderName,
  contactInfo,
  setContactInfo
}: ContactFieldsProps) {
  return (
    <>
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
        <Label htmlFor="contactInfo">Contact Information*</Label>
        <Input
          id="contactInfo"
          placeholder="Email or phone number"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Required so item owner can reach you
        </p>
      </div>
    </>
  );
}
