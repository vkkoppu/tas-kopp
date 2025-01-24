import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListCheck, X } from "lucide-react";
import { ActivityRecorderProps } from "./activity-recorder/types";
import { ActivityForm } from "./activity-recorder/ActivityForm";

export const ActivityRecorder = ({ 
  familyMembers, 
  tasks, 
  onClose,
  records,
  onRecordAdded 
}: ActivityRecorderProps) => {
  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-background md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <ListCheck className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Record Activities</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col p-6">
        <ActivityForm
          tasks={tasks}
          familyMembers={familyMembers}
          onSave={async (newRecords) => {
            await onRecordAdded(newRecords);
          }}
          records={records}
        />
      </div>
    </Card>
  );
};