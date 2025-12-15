"use client";

import { useState, useEffect } from "react";
import { RiAddCircleFill } from "react-icons/ri";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { WorkspaceAvatar } from "@/features/workspace/components/workspace-avatar";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspace/hook/use-workspace-id";
import { fetchWorkspaces } from "@/services/workspaceService";
import { set } from "date-fns";
import { useCreateWorkspaceModal } from "@/features/workspace/hook/use-create-workspace-modal";

interface Workspace {
  id: string;
  name: string;
  imageUrl: string | null;
}

export const WorkspaceSwitcher = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { open } = useCreateWorkspaceModal();

  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await fetchWorkspaces(); // Sử dụng hàm fetchWorkspaces đã tách ra
        setWorkspaces(data); // Lưu danh sách workspaces vào state
        setSelectedWorkspace(data[0] || null); // Chọn workspace đầu tiên nếu có
      } catch (err: unknown) {
        let error_msg = "Unable to load workspace. Please try again.";
        if (err instanceof Error) {
          error_msg = err.message;
        } else if (typeof err === "string") {
          error_msg = err;
        }
        setError(error_msg);
      }
    };

    loadWorkspaces(); // Gọi hàm khi component được render lần đầu
  }, []);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <RiAddCircleFill
          onClick={open}
          className="size-4 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
          <SelectValue placeholder="Chưa chọn workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar
                  name={workspace.name}
                  image={workspace.imageUrl}
                />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
