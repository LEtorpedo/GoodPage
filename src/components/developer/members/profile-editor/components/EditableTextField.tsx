"use client";

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateMemberField } from "@/app/actions/memberActions";
import { validateNumberInput } from "../utils";
import { TOAST_MESSAGES } from "../constants";
import type { EditableTextFieldProps } from "../types";

/**
 * 可编辑文本字段组件
 */
export function EditableTextField({
  label,
  fieldName,
  initialValue,
  memberId,
  isTextArea = false,
  inputType = "text",
  placeholder,
}: EditableTextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  // 存储值为字符串以兼容输入框/文本域
  const [value, setValue] = useState(initialValue?.toString() ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 保存字段值
   */
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 验证数字输入
      const validation = validateNumberInput(value, inputType);
      if (!validation.isValid) {
        setError(validation.error!);
        setIsLoading(false);
        return;
      }

      const result = await updateMemberField(
        memberId,
        fieldName as any,
        validation.processedValue
      );

      if (result.success) {
        setIsEditing(false);
        toast.success(TOAST_MESSAGES.success.fieldUpdated(label));
      } else {
        setError(result.error || "Failed to update field.");
        toast.error(
          TOAST_MESSAGES.error.fieldUpdateFailed(label, result.error)
        );
      }
    } catch (err: any) {
      console.error(`Error updating ${fieldName}:`, err);
      const errorMessage = TOAST_MESSAGES.error.unexpectedError(err.message);
      setError(errorMessage);
      toast.error(TOAST_MESSAGES.error.fieldUpdateFailed(label, errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    setValue(initialValue?.toString() ?? "");
    setIsEditing(false);
    setError(null);
  };

  /**
   * 处理输入框变化
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  /**
   * 处理文本域变化
   */
  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="mb-4">
      <Label
        htmlFor={fieldName}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
      >
        {label}
      </Label>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          {isTextArea ? (
            <Textarea
              id={fieldName}
              value={value}
              onChange={handleTextAreaChange}
              className="flex-grow resize-y min-h-[80px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              rows={4}
              disabled={isLoading}
              placeholder={placeholder || `Enter ${label}...`}
            />
          ) : (
            <Input
              id={fieldName}
              type={inputType}
              value={value}
              onChange={handleInputChange}
              className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              disabled={isLoading}
              placeholder={placeholder || `Enter ${label}...`}
            />
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={isLoading}
            aria-label={`Save ${label}`}
            className="dark:text-gray-400 dark:hover:text-green-400"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            aria-label={`Cancel editing ${label}`}
            className="dark:text-gray-400 dark:hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between group min-h-[40px] py-1 px-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md transition-colors">
          <p className="text-gray-900 dark:text-gray-100 flex-grow break-words">
            {value || (
              <span className="text-gray-400 dark:text-gray-500 italic">
                Not set
              </span>
            )}
          </p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ml-2 flex-shrink-0 dark:text-gray-400 dark:hover:text-indigo-400"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
