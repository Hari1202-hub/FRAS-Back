import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReasonFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const ReasonField = ({ label, placeholder, value, onChange }: ReasonFieldProps) => {
  return (
    <div>
      <Label htmlFor="reason">{label}</Label>
      <Input
        type="text"
        id="reason"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ReasonField;
