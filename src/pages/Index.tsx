import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Task } from "@/types/task";
import { FamilyData } from "@/types/family";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);

  return (
    <Dashboard
      familyData={familyData}
      tasks={tasks}
      setTasks={setTasks}
    />
  );
};

export default Index;