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
import { Database, Pencil, X } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { BUTTON_STYLES, CONFIRMATION_TEXTS } from "../constants";
import type { SoftwareDatasetsSectionProps } from "../types";

/**
 * 软件和数据集章节组件
 */
export function SoftwareDatasetSection({
  softwareAndDatasetsList,
  isOpen,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: SoftwareDatasetsSectionProps) {
  return (
    <CollapsibleCard
      title="Software & Datasets"
      icon={<Database className="h-5 w-5" />}
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
          Add Software/Dataset
        </Button>

        {softwareAndDatasetsList.length > 0 ? (
          <ul className="space-y-3">
            {softwareAndDatasetsList.map((record) => (
              <li
                key={record.id}
                className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group"
              >
                <div className="flex-grow mr-4">
                  <p className="font-semibold dark:text-gray-200">
                    {record.title}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span
                      className={`
                      inline-block px-2 py-1 rounded-full text-xs font-medium
                      ${
                        record.type === "SOFTWARE"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      }
                    `}
                    >
                      {record.type === "SOFTWARE" ? "Software" : "Dataset"}
                    </span>
                    {record.status && (
                      <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                        {record.status}
                      </span>
                    )}
                    {record.version && (
                      <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                        v{record.version}
                      </span>
                    )}
                  </div>
                  {record.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {record.description}
                    </p>
                  )}
                  {record.license && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      License: {record.license}
                    </p>
                  )}
                  <div className="flex space-x-4 mt-2">
                    {record.project_url && (
                      <a
                        href={record.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline dark:text-blue-400"
                      >
                        Project Page
                      </a>
                    )}
                    {record.repository_url && (
                      <a
                        href={record.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-500 hover:underline dark:text-green-400"
                      >
                        Repository
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {/* 编辑按钮 */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                    aria-label="Edit software/dataset record"
                    onClick={() => onEdit(record)}
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
                        aria-label="Delete software/dataset record"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-gray-850 dark:border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-red-400">
                          {CONFIRMATION_TEXTS.deleteTitle}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                          {CONFIRMATION_TEXTS.deleteDescription(
                            "software/dataset"
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                          {CONFIRMATION_TEXTS.cancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(record.id)}
                          className="dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                        >
                          {CONFIRMATION_TEXTS.confirm}
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
            No software/datasets added yet.
          </p>
        )}
      </div>
    </CollapsibleCard>
  );
}
