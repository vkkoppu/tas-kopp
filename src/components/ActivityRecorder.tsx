import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, ListCheck, X } from "lucide-react";
import { ActivityRecorderProps } from "./activity-recorder/types";
import { HistoryView } from "./activity-recorder/HistoryView";
import { ActivityForm } from "./activity-recorder/ActivityForm";
import { ActivityRecord } from "./activity-recorder/shared-types";

export const ActivityRecorder = ({ 
  familyMembers, 
  tasks, 
  onClose,
  records,
  onRecordAdded 
}: ActivityRecorderProps) => {
  const [activeTab, setActiveTab] = useState("record");

  const handleSave = async (newRecords: ActivityRecord[]) => {
    onRecordAdded(newRecords);
  };

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-background md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold">Activity Manager</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="record" className="flex items-center gap-2">
              <ListCheck className="h-4 w-4" />
              Record Activities
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              View History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="flex-1 flex flex-col space-y-4">
            <ActivityForm
              tasks={tasks}
              familyMembers={familyMembers}
              onSave={handleSave}
              records={records}
            />
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex flex-col">
            <HistoryView records={records} tasks={tasks} />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};