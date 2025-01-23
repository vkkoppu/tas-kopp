import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskFiltersProps {
  groupBy: "individual" | "shared";
  setGroupBy: (value: "individual" | "shared") => void;
  showTrends: boolean;
  trendsTimeframe: "week" | "month";
  setTrendsTimeframe: (value: "week" | "month") => void;
}

export const TaskFilters = ({
  groupBy,
  setGroupBy,
  showTrends,
  trendsTimeframe,
  setTrendsTimeframe,
}: TaskFiltersProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Select value={groupBy} onValueChange={(value: "individual" | "shared") => setGroupBy(value)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Group by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="individual">By Individual</SelectItem>
          <SelectItem value="shared">By Shared/Individual</SelectItem>
        </SelectContent>
      </Select>

      {showTrends && (
        <Select value={trendsTimeframe} onValueChange={(value: "week" | "month") => setTrendsTimeframe(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Timeframe..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};