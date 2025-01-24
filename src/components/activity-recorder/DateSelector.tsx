import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DateSelectorProps {
  selectedDate: Date;
  isCalendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
  onDateSelect: (date: Date | undefined) => void;
}

export const DateSelector = ({
  selectedDate,
  isCalendarOpen,
  onCalendarOpenChange,
  onDateSelect,
}: DateSelectorProps) => {
  return (
    <Popover open={isCalendarOpen} onOpenChange={onCalendarOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};