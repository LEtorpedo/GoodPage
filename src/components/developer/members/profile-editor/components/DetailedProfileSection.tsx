"use client";

import React from "react";
import { ClipboardList } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { EditableTextField } from "./EditableTextField";
import type { DetailedProfileSectionProps } from "../types";

/**
 * 详细资料章节组件
 */
export function DetailedProfileSection({
  initialData,
  isOpen,
  onToggle,
}: DetailedProfileSectionProps) {
  return (
    <CollapsibleCard
      title="Detailed Profile"
      icon={<ClipboardList className="h-5 w-5" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 gap-y-1">
        <EditableTextField
          label="English Bio"
          fieldName="bio_en"
          initialValue={initialData.bio_en}
          memberId={initialData.id}
          isTextArea={true}
        />
        <EditableTextField
          label="Chinese Bio"
          fieldName="bio_zh"
          initialValue={initialData.bio_zh}
          memberId={initialData.id}
          isTextArea={true}
        />
        <EditableTextField
          label="Research Statement (English)"
          fieldName="research_statement_en"
          initialValue={initialData.research_statement_en}
          memberId={initialData.id}
          isTextArea={true}
        />
        <EditableTextField
          label="Research Statement (Chinese)"
          fieldName="research_statement_zh"
          initialValue={initialData.research_statement_zh}
          memberId={initialData.id}
          isTextArea={true}
        />
        <EditableTextField
          label="Research Interests"
          fieldName="research_interests"
          initialValue={initialData.research_interests}
          memberId={initialData.id}
          isTextArea={true}
          placeholder="Comma-separated interests"
        />
        <EditableTextField
          label="Skills"
          fieldName="skills"
          initialValue={initialData.skills}
          memberId={initialData.id}
          isTextArea={true}
          placeholder="Comma-separated skills"
        />
        <EditableTextField
          label="More About Me"
          fieldName="more_about_me"
          initialValue={initialData.more_about_me}
          memberId={initialData.id}
          isTextArea={true}
        />
        <EditableTextField
          label="Interests & Hobbies"
          fieldName="interests_hobbies"
          initialValue={initialData.interests_hobbies}
          memberId={initialData.id}
          isTextArea={true}
        />
      </div>
    </CollapsibleCard>
  );
}
