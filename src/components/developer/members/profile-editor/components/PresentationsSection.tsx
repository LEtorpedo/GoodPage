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
import { Presentation as PresentationIcon, Pencil, X } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { sortPresentationsByYear } from "../utils";
import { BUTTON_STYLES, CONFIRMATION_TEXTS } from "../constants";
import type { PresentationsSectionProps } from "../types";

/**
 * 演示报告章节组件
 */
export function PresentationsSection({
  presentationList,
  isOpen,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: PresentationsSectionProps) {
  const sortedPresentations = sortPresentationsByYear(presentationList);

  return (
    <CollapsibleCard
      title="Presentations"
      icon={<PresentationIcon className="h-5 w-5" />}
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
          Add Presentation
        </Button>

        {sortedPresentations.length > 0 ? (
          <ul className="space-y-3">
            {sortedPresentations.map((presentation) => (
              <li
                key={presentation.id}
                className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group"
              >
                <div className="flex-grow mr-4">
                  <p className="font-semibold dark:text-gray-200">
                    {presentation.title}
                  </p>
                  {presentation.event_name && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {presentation.event_name}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-1">
                    {presentation.year && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {presentation.year}
                      </span>
                    )}
                    {presentation.is_invited && (
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-medium">
                        Invited
                      </span>
                    )}
                  </div>
                  {presentation.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Location: {presentation.location}
                    </p>
                  )}
                  <div className="flex space-x-4 mt-1">
                    {presentation.conference_url && (
                      <a
                        href={presentation.conference_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline dark:text-blue-400"
                      >
                        Conference
                      </a>
                    )}
                    {presentation.url && (
                      <a
                        href={presentation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline dark:text-blue-400"
                      >
                        Slides/Video
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
                    aria-label="Edit presentation record"
                    onClick={() => onEdit(presentation)}
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
                        aria-label="Delete presentation record"
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
                          {CONFIRMATION_TEXTS.deleteDescription("presentation")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                          {CONFIRMATION_TEXTS.cancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(presentation.id)}
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
            No presentations added yet.
          </p>
        )}
      </div>
    </CollapsibleCard>
  );
}
