"use client";

import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { SortablePublicationItem } from "./SortablePublicationItem";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { BUTTON_STYLES } from "../constants";
import type { FeaturedPublicationsSectionProps } from "../types";

/**
 * 特色发表论文章节组件
 */
export function FeaturedPublicationsSection({
  publications,
  isOpen,
  isSaving,
  onToggle,
  onToggleFeatured,
  onSave,
  onDragEnd,
}: FeaturedPublicationsSectionProps) {
  const { sensors } = useDragAndDrop();

  return (
    <CollapsibleCard
      title="Featured Publications"
      icon={<Star className="h-5 w-5" />}
      isOpen={isOpen}
      onToggle={onToggle}
      className="mb-6"
    >
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select and reorder publications to feature on your public profile.
        </p>

        {publications.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No publications found for this member.
          </p>
        )}

        {publications.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={publications.map((p) => p.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {publications.map((pub) => (
                  <SortablePublicationItem
                    key={pub.id}
                    pub={pub}
                    isSavingFeatured={isSaving}
                    onToggleFeatured={onToggleFeatured}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {publications.length > 0 && (
        <CardFooter className="border-t dark:border-gray-700 p-3">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className={`${BUTTON_STYLES.primary} disabled:opacity-50`}
          >
            {isSaving ? "Saving..." : "Save Featured List"}
          </Button>
        </CardFooter>
      )}
    </CollapsibleCard>
  );
}
