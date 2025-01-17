import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ActivityRecorderProps {
  familyMembers: { name: string; role: string }[];
  onClose: () => void;
}

export const ActivityRecorder = ({ familyMembers, onClose }: ActivityRecorderProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Record Activities</h2>
          <p className="text-muted-foreground">Select a date and record activities for family members</p>
        </div>
        
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            // TODO: Implement save functionality
            onClose();
          }}>Save Records</Button>
        </div>
      </div>
    </Card>
  );
};