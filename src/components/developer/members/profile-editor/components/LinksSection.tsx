"use client";

import React from "react";
import { Link } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { EditableTextField } from "./EditableTextField";
import type { LinksSectionProps } from "../types";

/**
 * 链接信息章节组件
 */
export function LinksSection({
  initialData,
  isOpen,
  onToggle,
}: LinksSectionProps) {
  return (
    <CollapsibleCard
      title="Links & IDs"
      icon={<Link className="h-5 w-5" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <EditableTextField
          label="Personal Website"
          fieldName="personal_website"
          initialValue={initialData.personal_website}
          memberId={initialData.id}
          inputType="url"
        />
        <EditableTextField
          label="GitHub Username"
          fieldName="github_username"
          initialValue={initialData.github_username}
          memberId={initialData.id}
        />
        <EditableTextField
          label="LinkedIn URL"
          fieldName="linkedin_url"
          initialValue={initialData.linkedin_url}
          memberId={initialData.id}
          inputType="url"
        />
        <EditableTextField
          label="Google Scholar ID"
          fieldName="google_scholar_id"
          initialValue={initialData.google_scholar_id}
          memberId={initialData.id}
        />
        <EditableTextField
          label="DBLP URL"
          fieldName="dblp_url"
          initialValue={initialData.dblp_url}
          memberId={initialData.id}
          inputType="url"
        />
        <EditableTextField
          label="CV URL"
          fieldName="cv_url"
          initialValue={initialData.cv_url}
          memberId={initialData.id}
          inputType="url"
        />
        <EditableTextField
          label="ORCID ID"
          fieldName="orcid_id"
          initialValue={initialData.orcid_id}
          memberId={initialData.id}
          inputType="text"
        />
      </div>
    </CollapsibleCard>
  );
}
