import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";

interface DateSelectorProps {
  label: string;
  date?: Date;
  onDateChange: (date?: Date) => void;
  onDateSelected?: () => void;
}

export const DateSelector = ({ label, date, onDateChange, onDateSelected }: DateSelectorProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (newDate?: Date) => {
    onDateChange(newDate);
    if (newDate && onDateSelected) {
      onDateSelected();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};