
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListCheck, X } from "lucide-react";
import { ActivityRecorderProps } from "./activity-recorder/types";
import { ActivityForm } from "./activity-recorder/ActivityForm";
import { ScrollArea } from "./ui/scroll-area";

export const ActivityRecorder = ({ 
  familyMembers, 
  tasks, 
  onClose,
  records,
  onRecordAdded 
}: ActivityRecorderProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <Card className="bg-white w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ListCheck className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Record Activities</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-6">
            <ActivityForm
              tasks={tasks}
              familyMembers={familyMembers}
              onSave={async (newRecords) => {
                await onRecordAdded(newRecords);
              }}
              records={records}
            />
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
