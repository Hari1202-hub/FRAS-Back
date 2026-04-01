import React from "react";
import { useState,useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
import { useNavigate } from "react-router-dom";
interface FilterValues {
  employeeId: string;
  name: string;
  classification: string;
  category: string;
  status: string;
  project: string;
  entity: string;
}

interface SharedFilterPanelProps {
  filters: FilterValues;
  setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
  onReset: () => void;
  onApply: () => void;
}

const SharedFilterPanel: React.FC<SharedFilterPanelProps> = ({
  filters,
  setFilters,
  onReset,
  onApply
}) => {
  const [categories, setCategories] = useState([]);;

  const [classifications, setClassifications] = useState([]);
  const [entities, setEntities] = useState([]);

  const loadEntities = ()=>{
    axios.post(BASEURL+'entities',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let entities = response.data.data;
      setEntities(entities);
    })
  }
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
  useEffect(()=>{
    loadEntities();
    loadCategories();
    loadClassifications();
  },[])
  return (
    <div className="bg-white rounded-md shadow p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
      
      {/* Employee ID and Name Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            type="text"
            id="employeeId"
            placeholder="Enter Employee ID"
            value={filters.employeeId}
            onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="name">Employee Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Enter Employee Name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>
      </div>
      
      {/* Select Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="classification">Classification</Label>
          <Select value={filters.classification} onValueChange={(value) => setFilters({ ...filters, classification: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Classifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classifications</SelectItem>
              {classifications.map((classification, index) => (
                  <SelectItem value={classification.code} key={index} >{classification.description}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category, index) => (
                  <SelectItem value={category.code} key={index} >{category.description}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {/* <div>
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>
      
      {/* Project and Entity Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* <div>
          <Label htmlFor="project">Project</Label>
          <Input
            type="text"
            id="project"
            placeholder="Enter Project"
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
          />
        </div> */}
        <div>
          <Label htmlFor="entity">Entity</Label>
           <Select value={filters.entity} onValueChange={(value) => setFilters({ ...filters, entity: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entities.map((entity, index) => (
                  <SelectItem value={entity.id} key={index} >{entity.entityname}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
       {/*  <Button onClick={onApply}>Apply Filters</Button> */}
      </div>
    </div>
  );
};

export default SharedFilterPanel;
