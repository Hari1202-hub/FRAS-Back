
import React from "react";
import SharedFilterPanel from "./SharedFilterPanel";

interface FilterValues {
  employeeId: string;
  name: string;
  classification: string;
  category: string;
  status: string;
  project: string;
  entity: string; // Added entity field
}

interface ManualAttendanceFiltersProps {
  filters: FilterValues;
  setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
  onReset: () => void;
  onApply: () => void;
}

const ManualAttendanceFilters: React.FC<ManualAttendanceFiltersProps> = ({
  filters,
  setFilters,
  onReset,
  onApply
}) => {
  return (
    <SharedFilterPanel 
      filters={filters} 
      setFilters={setFilters} 
      onReset={onReset} 
      onApply={onApply}
    />
  );
};

export default ManualAttendanceFilters;
