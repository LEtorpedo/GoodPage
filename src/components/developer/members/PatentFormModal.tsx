"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save } from "lucide-react";
import type { Patent } from "@prisma/client";
import type { PatentFormData } from "@/app/actions/patentActions";

type PatentFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatentFormData, patentId?: number) => Promise<void>;
  initialData?: Patent | null;
  memberId: string;
};

/**
 * 专利表单模态框组件
 */
export function PatentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  memberId,
}: PatentFormModalProps) {
  const [formData, setFormData] = useState<PatentFormData>({
    title: "",
    patent_number: "",
    inventors_string: "",
    issue_date: "",
    status: "",
    url: "",
    display_order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当模态框打开或初始数据改变时，重置表单
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // 编辑模式：填充现有数据
        setFormData({
          title: initialData.title,
          patent_number: initialData.patent_number || "",
          inventors_string: initialData.inventors_string || "",
          issue_date: initialData.issue_date || "",
          status: initialData.status || "",
          url: initialData.url || "",
          display_order: initialData.display_order,
        });
      } else {
        // 添加模式：重置为空
        setFormData({
          title: "",
          patent_number: "",
          inventors_string: "",
          issue_date: "",
          status: "",
          url: "",
          display_order: 0,
        });
      }
    }
  }, [isOpen, initialData]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData, initialData?.id);
    } catch (error) {
      console.error("Error submitting patent form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (
    field: keyof PatentFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 专利状态选项
  const patentStatusOptions = [
    { value: "Filed", label: "Filed (申请中)" },
    { value: "Published", label: "Published (已公布)" },
    { value: "Granted", label: "Granted (已授权)" },
    { value: "Expired", label: "Expired (已过期)" },
    { value: "Abandoned", label: "Abandoned (已放弃)" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* 模态框头部 */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {initialData ? "Edit Patent" : "Add Patent"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSubmitting}
              className="dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 表单内容 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* 专利标题 */}
            <div>
              <Label htmlFor="title" className="dark:text-gray-300">
                Patent Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter patent title"
                required
                disabled={isSubmitting}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* 专利号 */}
            <div>
              <Label htmlFor="patent_number" className="dark:text-gray-300">
                Patent Number
              </Label>
              <Input
                id="patent_number"
                value={formData.patent_number || ""}
                onChange={(e) =>
                  handleInputChange("patent_number", e.target.value)
                }
                placeholder="e.g., US10123456B2"
                disabled={isSubmitting}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* 发明人列表 */}
            <div>
              <Label htmlFor="inventors_string" className="dark:text-gray-300">
                Inventors
              </Label>
              <Textarea
                id="inventors_string"
                value={formData.inventors_string || ""}
                onChange={(e) =>
                  handleInputChange("inventors_string", e.target.value)
                }
                placeholder="List all inventors (e.g., John Doe, Jane Smith, Bob Johnson)"
                disabled={isSubmitting}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                rows={3}
              />
            </div>

            {/* 授权日期 */}
            <div>
              <Label htmlFor="issue_date" className="dark:text-gray-300">
                Issue Date
              </Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date || ""}
                onChange={(e) =>
                  handleInputChange("issue_date", e.target.value)
                }
                disabled={isSubmitting}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* 专利状态 */}
            <div>
              <Label htmlFor="status" className="dark:text-gray-300">
                Patent Status
              </Label>
              <Select
                value={formData.status || undefined}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue placeholder="Select patent status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {patentStatusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 专利链接 */}
            <div>
              <Label htmlFor="url" className="dark:text-gray-300">
                Patent URL
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://patents.google.com/patent/..."
                disabled={isSubmitting}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* 显示顺序 */}
            <div>
              <Label htmlFor="display_order" className="dark:text-gray-300">
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  handleInputChange(
                    "display_order",
                    parseInt(e.target.value) || 0
                  )
                }
                min="0"
                disabled={isSubmitting}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {initialData ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {initialData ? "Update Patent" : "Add Patent"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
