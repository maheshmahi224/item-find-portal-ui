
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data moved to a separate file
interface LocationOption {
  id: string;
  name: string;
}

interface LocationFieldsProps {
  location: string;
  setLocation: (location: string) => void;
  department: string;
  setDepartment: (department: string) => void;
  locations: LocationOption[];
  departments: LocationOption[];
}

export function LocationFields({
  location,
  setLocation,
  department,
  setDepartment,
  locations,
  departments
}: LocationFieldsProps) {
  return (
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
  );
}
