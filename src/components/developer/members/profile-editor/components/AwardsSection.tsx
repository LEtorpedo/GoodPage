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
import { Award as AwardIcon, Pencil, X } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { sortAwardsByYearAndOrder } from "../utils";
import { BUTTON_STYLES, CONFIRMATION_TEXTS } from "../constants";
import type { AwardsSectionProps } from "../types";

/**
 * 获奖记录章节组件
 */
export function AwardsSection({
  awardsList,
  isOpen,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: AwardsSectionProps) {
  const sortedAwards = sortAwardsByYearAndOrder(awardsList);

  return (
    <CollapsibleCard
      title="Awards"
      icon={<AwardIcon className="h-5 w-5" />}
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
                Add Award
              </Button>
              
              {sortedAwards.length > 0 ? (
                <ul className="space-y-3">
                  {sortedAwards.map((award) => (
                    <li
                      key={award.id}
                      className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group"
                    >
                      <div className="flex-grow mr-4">
                        <p className="font-semibold dark:text-gray-200">
                          {award.content}
                        </p>
                        {award.year && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {award.year}
                          </p>
                        )}
                        {/* 可选显示其他字段如级别或链接 */}
                        {award.level && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            Level: {award.level}
                          </p>
                        )}
                        {award.link_url && (
                          <a
                            href={award.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline dark:text-blue-400 block mt-1"
                          >
                            Link
                          </a>
                        )}
                      </div>
                      
                      <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        {/* 编辑按钮 */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                          aria-label="Edit award record"
                          onClick={() => onEdit(award)}
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
                              aria-label="Delete award record"
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
                                {CONFIRMATION_TEXTS.deleteDescription("award")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                {CONFIRMATION_TEXTS.cancel}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(award.id)}
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
                  No awards added yet.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CollapsibleCard>
  );
}
