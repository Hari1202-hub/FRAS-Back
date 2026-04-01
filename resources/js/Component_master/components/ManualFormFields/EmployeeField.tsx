import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const EmployeeField = ({ label, placeholder, value, onChange }: EmployeeFieldProps) => {
  return (
    <div>
      <Label htmlFor="employee">{label}</Label>
      <Input 
        type="text"
        id="employee"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};

export default EmployeeField;
