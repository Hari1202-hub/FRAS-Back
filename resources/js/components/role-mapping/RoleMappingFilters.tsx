
import { Input } from "@/components/ui/input";
import { Search, Building, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleMappingFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  entityFilter: string;
  setEntityFilter: (value: string) => void;
  classificationFilter: string;
  setClassificationFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  roles: { name: string }[];
  entities: string[];
  classifications: string[];
  categories: string[];
  onClearFilters: () => void;
}

export function RoleMappingFilters({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  entityFilter,
  setEntityFilter,
  classificationFilter,
  setClassificationFilter,
  categoryFilter,
  setCategoryFilter,
  roles,
  entities,
  classifications,
  categories,
  onClearFilters,
}: RoleMappingFiltersProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Employee
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entity
          </label>
          <div className="relative">
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="All Entities" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Classification
          </label>
          <div className="relative">
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="All Classifications" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {classifications.map((classification) => (
                  <SelectItem key={classification} value={classification}>
                    {classification}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <div className="relative">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Role
          </label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.name} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={onClearFilters}
        >
          Clear All
        </Button>
        <Button>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
