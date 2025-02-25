import { PencilIcon } from "lucide-react";

import { MemberAvatar } from "@/features/members/components/member-avatar";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";

import { OveriewProperty } from "./overview-property";

import { TaskDate } from "./task-date";

import { Task } from "../types";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";

interface TaskOverviewProps {
  task: Task;
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Overiew</p>
          <Button onClick={() => open(task.$id)} size={"sm"} variant={"secondary"}>
            <PencilIcon className="size-4 mr-2" />
            Edit
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <OveriewProperty label="Assignee">
            <MemberAvatar name={task.assignee.name} className="size-6" />
            <p className="text-sm font-medium">{task.assignee.name}</p>
          </OveriewProperty>
          <OveriewProperty label="Due Date">
            <TaskDate value={task.dueDate} className="text-sm font-medium" />
          </OveriewProperty>
          <OveriewProperty label="Status">
            <Badge variant={task.status}>
                {snakeCaseToTitleCase(task.status)}
            </Badge>
          </OveriewProperty>
        </div>
      </div>
    </div>
  );
};
