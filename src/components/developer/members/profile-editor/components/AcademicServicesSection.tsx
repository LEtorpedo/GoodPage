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
import { Users, Pencil, X } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { sortAcademicServicesByYear } from "../utils";
import { BUTTON_STYLES, CONFIRMATION_TEXTS } from "../constants";
import type { AcademicServicesSectionProps } from "../types";

/**
 * 学术服务章节组件
 */
export function AcademicServicesSection({
  academicServicesList,
  isOpen,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: AcademicServicesSectionProps) {
  const sortedServices = sortAcademicServicesByYear(academicServicesList);

  return (
    <CollapsibleCard
      title="Academic Services"
      icon={<Users className="h-5 w-5" />}
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
          Add Academic Service
        </Button>
        
        {sortedServices.length > 0 ? (
          <ul className="space-y-3">
            {sortedServices.map((service) => (
              <li
                key={service.id}
                className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group"
              >
                <div className="flex-grow mr-4">
                  <p className="font-semibold dark:text-gray-200">
                    {service.role}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {service.organization}
                  </p>
                  {service.start_year && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {service.start_year} - {service.end_year || "Present"}
                    </p>
                  )}
                  {service.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {service.description}
                    </p>
                  )}
                </div>
                
                <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {/* 编辑按钮 */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                    aria-label="Edit academic service record"
                    onClick={() => onEdit(service)}
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
                        aria-label="Delete academic service record"
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
                          {CONFIRMATION_TEXTS.deleteDescription("academic service")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                          {CONFIRMATION_TEXTS.cancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(service.id)}
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
            No academic services added yet.
          </p>
        )}
      </div>
    </CollapsibleCard>
  );
}
