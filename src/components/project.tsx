"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspace/hook/use-workspace-id";
import { useCreateProjectModal } from "@/features/project/hook/use-create-project-modal";
import { fetchProjects } from "@/services/projectService";
import { ProjectResponse } from "@/types/project";
import { useState } from "react";
import { useEffect } from "react";
import { ProjectAvatar } from "@/features/project/components/project-avatar";
export const Project = () => {
  const pathname = usePathname();
  const { open } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading } = fetchProjects(workspaceId);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Projects</p>
        <RiAddCircleFill
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
          onClick={open}
        />
      </div>
      {projects?.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.id}`;
        const isActive = pathname === href;

        return (
          <Link key={project.id} href={href}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary",
              )}
            >
              <ProjectAvatar image={project.imageUrl} name={project.name} />
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
