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
import { ScrollText, Pencil, X } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { BUTTON_STYLES, CONFIRMATION_TEXTS } from "../constants";
import type { PatentsSectionProps } from "../types";

/**
 * 专利章节组件
 */
export function PatentsSection({
  patentsList,
  isOpen,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: PatentsSectionProps) {
  // 按授权日期排序（最新的在前）
  const sortedPatents = [...(patentsList || [])].sort((a, b) => {
    if (!a.issue_date && !b.issue_date) return 0;
    if (!a.issue_date) return 1;
    if (!b.issue_date) return -1;
    return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime();
  });

  return (
    <CollapsibleCard
      title="Patents"
      icon={<ScrollText className="h-5 w-5" />}
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
          Add Patent
        </Button>

        {sortedPatents.length > 0 ? (
          <ul className="space-y-3">
            {sortedPatents.map((patent) => (
              <li
                key={patent.id}
                className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group"
              >
                <div className="flex-grow mr-4">
                  <p className="font-semibold dark:text-gray-200">
                    {patent.title}
                  </p>
                  {patent.patent_number && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Patent No: {patent.patent_number}
                    </p>
                  )}
                  {patent.inventors_string && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Inventors: {patent.inventors_string}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-1">
                    {patent.issue_date && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Issued:{" "}
                        {new Date(patent.issue_date).toLocaleDateString()}
                      </span>
                    )}
                    {patent.status && (
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-medium">
                        {patent.status}
                      </span>
                    )}
                  </div>
                  {patent.url && (
                    <a
                      href={patent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline dark:text-blue-400 block mt-1"
                    >
                      View Patent
                    </a>
                  )}
                </div>

                <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {/* 编辑按钮 */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                    aria-label="Edit patent record"
                    onClick={() => onEdit(patent)}
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
                        aria-label="Delete patent record"
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
                          {CONFIRMATION_TEXTS.deleteDescription("patent")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                          {CONFIRMATION_TEXTS.cancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(patent.id)}
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
            No patents added yet.
          </p>
        )}
      </div>
    </CollapsibleCard>
  );
}
