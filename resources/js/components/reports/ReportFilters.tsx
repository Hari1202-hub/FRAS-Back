import { useState,useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
import { useNavigate } from "react-router-dom";
interface ReportFiltersProps {
  entityFilter: string;
  setEntityFilter: (value: string) => void;
  ClassificationFilter: string;
  setClassificationFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  entryMethodFilter: string;
  setEntryMethodFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export function ReportFilters({
  entityFilter,
  setEntityFilter,
  ClassificationFilter,
  setClassificationFilter,
  categoryFilter,
  setCategoryFilter,
  projectFilter,
  setProjectFilter,
  entryMethodFilter,
  setEntryMethodFilter,
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: ReportFiltersProps) {
  const [entities, setEntities] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>("all");
  const [selectedClassification, setSelectedClassification] = useState<string | undefined>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>("all");
  const [selectedProject, setSelectedProject] = useState<string | undefined>("all");
  const loadEntities = ()=>{
    axios.post(BASEURL+'entities',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let entities = response.data.data;
      setEntities(entities);
    })
  }
  const handleEntityChange = (value: string) => {
    setSelectedEntity(value);
    setEntityFilter(value);  
  };
  const handleClassificationChange = (value: string) => {
    setSelectedClassification(value);
    setClassificationFilter(value);  
  };
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCategoryFilter(value);  
  };
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    setProjectFilter(value);  
  };
  const loadCategories = ()=>{
    axios.post(BASEURL+'categories',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let categories = response.data.data;
      setCategories(categories);
    })
  }
  const loadClassifications = ()=>{
    axios.post(BASEURL+'classifications',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let classifications = response.data.data;
      setClassifications(classifications);
    })
  }
  const loadProjects = ()=>{
    axios.post(BASEURL+'projects',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let projects = response.data.data;
      setProjects(projects);
    })
  }
  useEffect(()=>{
    loadEntities();
    loadClassifications();
    loadCategories();
    loadProjects();
  },[])
  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
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
          <Select  value={selectedEntity} onValueChange={handleEntityChange} >
            <SelectTrigger>
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {Array.isArray(entities) &&
                entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.entityname}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Classification
          </label>
          <Select value={selectedClassification} onValueChange={handleClassificationChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Classifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classifications</SelectItem>
              {classifications.map((classification, index) => (
                <SelectItem key={index} value={classification.code}>
                  {classification.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category, index) => (
                <SelectItem key={index} value={category.code}>
                  {category.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <Select value={selectedProject} onValueChange={handleProjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project, index) => (
                <SelectItem key={index} value={project.id}>
                  {project.projectname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entry Method
          </label>
          <Select value={entryMethodFilter} onValueChange={setEntryMethodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="face">Face Recognition</SelectItem>
              <SelectItem value="manual">Manual Entry</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>
    </div>
  );
}
