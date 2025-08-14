"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { MemberStatus } from "@prisma/client";
import { updateMemberStatus, updateMemberProfileVisibility } from "@/app/actions/memberActions";
import { CollapsibleCard } from "./CollapsibleCard";
import { EditableTextField } from "./EditableTextField";
import { formatStatusLabel } from "../utils";
import { TOAST_MESSAGES } from "../constants";
import type { BasicInfoSectionProps } from "../types";

/**
 * 基本信息章节组件
 */
export function BasicInfoSection({
  initialData,
  isOpen,
  onToggle,
}: BasicInfoSectionProps) {
  const [currentStatus, setCurrentStatus] = useState<MemberStatus | undefined>(
    initialData.status ?? undefined
  );
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(
    initialData.is_profile_public ?? true
  );
  const [isVisibilityLoading, setIsVisibilityLoading] = useState(false);

  /**
   * 处理状态变更
   */
  const handleStatusChange = async (newStatusValue: string) => {
    // 验证状态值是否有效
    const isValidStatus = Object.values(MemberStatus).includes(
      newStatusValue as MemberStatus
    );
    if (!isValidStatus || !newStatusValue) {
      toast.error(`Invalid status value: ${newStatusValue}`);
      return;
    }
    const newStatus: MemberStatus = newStatusValue as MemberStatus;

    setIsStatusLoading(true);
    try {
      const result = await updateMemberStatus(initialData.id, newStatus);
      if (result.success) {
        setCurrentStatus(newStatus);
        toast.success(TOAST_MESSAGES.success.statusUpdated(formatStatusLabel(newStatus)));
      } else {
        toast.error(TOAST_MESSAGES.error.statusUpdateFailed(result.error));
      }
    } catch (err: any) {
      console.error("Error calling updateMemberStatus action:", err);
      toast.error(TOAST_MESSAGES.error.unexpectedError(err.message));
    } finally {
      setIsStatusLoading(false);
    }
  };

  /**
   * 处理可见性变更
   */
  const handleVisibilityChange = async (checked: boolean) => {
    setIsVisibilityLoading(true);
    try {
      const result = await updateMemberProfileVisibility(initialData.id, checked);
      if (result.success) {
        setIsPublic(checked);
        toast.success(TOAST_MESSAGES.success.visibilityUpdated(checked));
      } else {
        toast.error(TOAST_MESSAGES.error.visibilityUpdateFailed(result.error));
      }
    } catch (err: any) {
      console.error("Error calling updateMemberProfileVisibility action:", err);
      toast.error(TOAST_MESSAGES.error.unexpectedError(err.message));
    } finally {
      setIsVisibilityLoading(false);
    }
  };

  return (
    <CollapsibleCard
      title="Basic Information"
      icon={<Info className="h-5 w-5" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        {/* 英文姓名（只读） */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            English Name
          </Label>
          <p className="mt-1 text-gray-900 dark:text-gray-100 min-h-[40px] py-1 px-2 break-words">
            {initialData.name_en || (
              <span className="text-gray-400 dark:text-gray-500 italic">
                Not set
              </span>
            )}
          </p>
        </div>

        {/* 中文姓名（只读） */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            Chinese Name
          </Label>
          <p className="mt-1 text-gray-900 dark:text-gray-100 min-h-[40px] py-1 px-2 break-words">
            {initialData.name_zh || (
              <span className="text-gray-400 dark:text-gray-500 italic">
                Not set
              </span>
            )}
          </p>
        </div>

        <EditableTextField
          label="Email"
          fieldName="email"
          initialValue={initialData.email}
          memberId={initialData.id}
          inputType="email"
        />
        <EditableTextField
          label="English Title"
          fieldName="title_en"
          initialValue={initialData.title_en}
          memberId={initialData.id}
        />
        <EditableTextField
          label="Chinese Title"
          fieldName="title_zh"
          initialValue={initialData.title_zh}
          memberId={initialData.id}
        />

        {/* 状态选择 */}
        <div className="mb-4">
          <Label htmlFor="status" className="dark:text-gray-300">
            Status
          </Label>
          <Select
            value={currentStatus ?? ""}
            onValueChange={handleStatusChange}
            disabled={isStatusLoading}
          >
            <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              {Object.values(MemberStatus).map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                >
                  {formatStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 资料公开设置 */}
        <div className="mb-4 flex items-center space-x-3 justify-between rounded-md border dark:border-gray-700 p-3 col-span-1 md:col-span-2">
          <Label
            htmlFor="is_profile_public"
            className="text-sm font-medium cursor-pointer dark:text-gray-300"
          >
            Profile Public
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Make this member's profile page visible to the public internet.
            </p>
          </Label>
          <Switch
            id="is_profile_public"
            checked={isPublic}
            onCheckedChange={handleVisibilityChange}
            disabled={isVisibilityLoading}
            aria-label="Toggle profile visibility"
          />
        </div>

        <EditableTextField
          label="Enrollment Year"
          fieldName="enrollment_year"
          initialValue={initialData.enrollment_year}
          memberId={initialData.id}
          inputType="number"
        />
        <EditableTextField
          label="Graduation Year"
          fieldName="graduation_year"
          initialValue={initialData.graduation_year}
          memberId={initialData.id}
          inputType="number"
        />
        <EditableTextField
          label="Office Location"
          fieldName="office_location"
          initialValue={initialData.office_location}
          memberId={initialData.id}
        />
        <EditableTextField
          label="Phone Number"
          fieldName="phone_number"
          initialValue={initialData.phone_number}
          memberId={initialData.id}
          inputType="text"
        />
        <EditableTextField
          label="Office Hours"
          fieldName="office_hours"
          initialValue={initialData.office_hours}
          memberId={initialData.id}
        />
        <EditableTextField
          label="Pronouns"
          fieldName="pronouns"
          initialValue={initialData.pronouns}
          memberId={initialData.id}
          placeholder="e.g., she/her, he/him, they/them"
        />
      </div>
    </CollapsibleCard>
  );
}
