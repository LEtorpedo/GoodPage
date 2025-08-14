"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import type { SortablePublicationItemProps } from "../types";

/**
 * 可排序的发表论文项目组件
 * 支持拖拽排序和特色标记功能
 */
export function SortablePublicationItem({
  pub,
  isSavingFeatured,
  onToggleFeatured,
}: SortablePublicationItemProps) {
  const {
    // 从useSortable解构属性
    attributes,
    listeners, // 用于拖拽手柄
    setNodeRef, // 可拖拽元素的ref
    transform,
    transition,
    isDragging, // 是否正在拖拽的状态
  } = useSortable({ id: pub.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform), // 应用变换以获得视觉反馈
    transition, // 应用过渡以实现平滑移动
    // 拖拽时添加一些视觉指示
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : "auto",
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
    cursor: "default", // 项目的默认光标
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative overflow-hidden
        border-2 rounded-lg transition-all duration-200
        ${
          pub.isFeatured
            ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 shadow-sm"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600"
        }
        ${isDragging ? "shadow-xl ring-2 ring-blue-400 dark:ring-blue-500" : "hover:shadow-md"}
      `}
    >
      {/* 左侧彩色条 */}
      <div
        className={`
        absolute left-0 top-0 bottom-0 w-1 transition-colors duration-200
        ${
          pub.isFeatured
            ? "bg-green-500 dark:bg-green-400"
            : "bg-transparent group-hover:bg-blue-400"
        }
      `}
      />

      <div className="flex items-start space-x-3 p-4 pl-5">
        {/* 拖拽手柄 */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 pt-1 cursor-grab active:cursor-grabbing focus:outline-none touch-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Drag to reorder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 dark:text-gray-500"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>

        {/* 复选框 */}
        <div className="flex-shrink-0 pt-1">
          <Checkbox
            id={`featured-pub-${pub.id}`}
            checked={pub.isFeatured}
            onCheckedChange={() => onToggleFeatured(pub.id)}
            aria-labelledby={`featured-pub-label-${pub.id}`}
            disabled={isSavingFeatured}
            className="border-2 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
        </div>

        {/* 论文详情 */}
        <div className="flex-grow min-w-0">
          <label
            htmlFor={`featured-pub-${pub.id}`}
            id={`featured-pub-label-${pub.id}`}
            className={`
              block text-sm font-semibold leading-tight cursor-pointer transition-colors
              ${
                pub.isFeatured
                  ? "text-green-800 dark:text-green-200"
                  : "text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300"
              }
            `}
          >
            {pub.title}
          </label>

          <div className="mt-2 flex items-center space-x-3 flex-wrap text-xs">
            <span
              className={`
              font-medium
              ${
                pub.isFeatured
                  ? "text-green-700 dark:text-green-300"
                  : "text-gray-600 dark:text-gray-400"
              }
            `}
            >
              {pub.venue}
            </span>

            <span
              className={`
              px-2 py-1 rounded-full font-medium
              ${
                pub.isFeatured
                  ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }
            `}
            >
              {pub.year}
            </span>

            {pub.ccf_rank && (
              <span
                className={`
                px-2 py-1 rounded-full text-xs font-bold
                ${
                  pub.ccf_rank === "A"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : pub.ccf_rank === "B"
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                }
              `}
              >
                CCF {pub.ccf_rank}
              </span>
            )}
          </div>
        </div>

        {/* 特色标识 */}
        {pub.isFeatured && (
          <div className="flex-shrink-0 pt-1">
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="drop-shadow-sm"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-medium">Featured</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
