"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { GraduationCap, Pencil, X } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { sortEducationByYear } from "../utils";
import { BUTTON_STYLES, CONFIRMATION_TEXTS } from "../constants";
import type { EducationSectionProps } from "../types";

/**
 * 教育历史章节组件
 */
export function EducationSection({
  educationHistory,
  isOpen,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: EducationSectionProps) {
  const sortedEducation = sortEducationByYear(educationHistory);

  return (
    <CollapsibleCard
      title="Education History"
      icon={<GraduationCap className="h-5 w-5" />}
      isOpen={isOpen}
      onToggle={onToggle}
      className="mb-6"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {/* 添加按钮 */}
              <Button
                onClick={onAdd}
                size="sm"
                className={`mb-4 ${BUTTON_STYLES.primary}`}
              >
                Add Education
              </Button>
              
              {sortedEducation.length > 0 ? (
                <ul className="space-y-3">
                  {sortedEducation.map((edu) => (
                    <li
                      key={edu.id}
                      className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group"
                    >
                      <div className="flex-grow mr-4">
                        <p className="font-semibold dark:text-gray-200">
                          {edu.degree} in {edu.field || "N/A"}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {edu.school}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {edu.start_year} - {edu.end_year || "Present"}
                        </p>
                        {edu.thesis_title && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                            Thesis: {edu.thesis_title}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {edu.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        {/* 编辑按钮 */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                          aria-label="Edit education record"
                          onClick={() => onEdit(edu)}
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
                              aria-label="Delete education record"
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
                                {CONFIRMATION_TEXTS.deleteDescription("education")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                {CONFIRMATION_TEXTS.cancel}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(edu.id)}
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
                  No education history added yet.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CollapsibleCard>
  );
}
