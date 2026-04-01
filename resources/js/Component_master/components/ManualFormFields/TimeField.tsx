
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TimeField = ({ label, value, onChange }: TimeFieldProps) => {
  const setCurrentTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    onChange(timeString);
  };

  return (
    <div>
      <Label htmlFor="time">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="time"
          id="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          type="button"
          onClick={setCurrentTime}
          className="shrink-0"
          aria-label="Set current time"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TimeField;
