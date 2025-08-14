"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Briefcase, Pencil, X } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { sortProjectsByYear } from "../utils";
import { BUTTON_STYLES, CONFIRMATION_TEXTS } from "../constants";
import type { ProjectsSectionProps } from "../types";

/**
 * 项目章节组件
 */
export function ProjectsSection({
  projectsList,
  isOpen,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: ProjectsSectionProps) {
  const sortedProjects = sortProjectsByYear(projectsList);

  return (
    <CollapsibleCard
      title="Projects"
      icon={<Briefcase className="h-5 w-5" />}
      isOpen={isOpen}
      onToggle={onToggle}
      className="mb-6"
    >
      <div className="pt-4">
        {/* 添加按钮 */}
        <Button
          size="sm"
          className={`mb-4 ${BUTTON_STYLES.primary}`}
          onClick={onAdd}
        >
          Add Project
        </Button>

        {sortedProjects.length > 0 ? (
          <ul className="space-y-3">
            {sortedProjects.map((pm) => (
              <li
                key={`${pm.project_id}-${pm.member_id}`}
                className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group"
              >
                <div className="flex-grow mr-4">
                  <p className="font-semibold dark:text-gray-200">
                    {pm.project.title}
                  </p>
                  {pm.project.start_year && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {pm.project.start_year} -{" "}
                      {pm.project.end_year || "Present"}
                    </p>
                  )}
                  {pm.role && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                      Role: {pm.role}
                    </p>
                  )}
                  {pm.project.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {pm.project.description}
                    </p>
                  )}
                  {pm.project.url && (
                    <a
                      href={pm.project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline dark:text-blue-400 block mt-1"
                    >
                      Project Link
                    </a>
                  )}
                </div>

                <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {/* 编辑按钮 */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                    aria-label="Edit project record"
                    onClick={() => onEdit(pm)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  {/* 删除按钮 */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 dark:bg-red-700 dark:hover:bg-red-600 dark:text-white"
                        aria-label="Delete project record"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-gray-850 dark:border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-red-400">
                          Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                          {CONFIRMATION_TEXTS.deleteProjectDescription}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                          {CONFIRMATION_TEXTS.cancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(pm.project_id, pm.member_id)}
                          className="dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                        >
                          {CONFIRMATION_TEXTS.confirmRemoveLink}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic dark:text-gray-400">
            No projects added yet.
          </p>
        )}
      </div>
    </CollapsibleCard>
  );
}
