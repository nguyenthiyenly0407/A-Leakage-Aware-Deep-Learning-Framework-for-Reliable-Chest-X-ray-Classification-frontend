import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "./dotted-separator";
import { projectAnalyticsResponse } from "@/types/project";

export const Analytics = (projectAnalytics: projectAnalyticsResponse) => {
  return (
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <ScrollBar orientation="horizontal" />
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Total Tasks"
            value={projectAnalytics.taskCount}
            variant={projectAnalytics.taskDifference > 0 ? "up" : "down"}
            increaseValue={projectAnalytics.taskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Assigned Tasks"
            value={projectAnalytics.assignedTaskCount}
            variant={
              projectAnalytics.assignedTaskDifference > 0 ? "up" : "down"
            }
            increaseValue={projectAnalytics.assignedTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Completed Tasks"
            value={projectAnalytics.completedTaskCount}
            variant={
              projectAnalytics.completedTaskDifference > 0 ? "up" : "down"
            }
            increaseValue={projectAnalytics.completedTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Incomplete Tasks"
            value={projectAnalytics.inCompletedTaskCount}
            variant={
              projectAnalytics.inCompletedTaskDifference > 0 ? "up" : "down"
            }
            increaseValue={projectAnalytics.inCompletedTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Overdue Tasks"
            value={projectAnalytics.overdueTaskCount}
            variant={projectAnalytics.overdueTaskDifference > 0 ? "up" : "down"}
            increaseValue={projectAnalytics.overdueTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
      </div>
    </ScrollArea>
  );
};
