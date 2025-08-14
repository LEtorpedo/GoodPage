"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { themeColors } from "@/styles/theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 导入模块组件
import { PublishedHeader, PublishedList, usePublishedManager } from "./index";
import { useDialog } from "../../shared/hooks/useDialog";
import { useSearch } from "../../shared/hooks/useSearch";
import SearchBar from "../../shared/components/SearchBar";
import SearchHelp from "../../shared/components/SearchHelp";
import { PublicationForm } from "../../forms/PublicationForm";

interface PublishedManagerProps {
  className?: string;
}

// 暴露给父组件的方法接口
export interface PublishedManagerRef {
  refreshPublications: () => void;
}

/**
 * 已发布出版物管理器
 * 组合各个小模块，提供完整的管理功能
 */
const PublishedManager = forwardRef<PublishedManagerRef, PublishedManagerProps>(
  ({ className = "" }, ref) => {
    // 使用管理器Hook
    const {
      publications,
      isLoading,
      error,
      deletingIds,
      isSubmitting,
      refreshPublications,
      createPublication,
      updatePublication,
      deletePublication,
      clearError,
    } = usePublishedManager();

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        refreshPublications,
      }),
      [refreshPublications]
    );

    // 使用对话框Hook
    const {
      isOpen,
      editingItem,
      isEditMode,
      openAddDialog,
      openEditDialog,
      closeDialog,
    } = useDialog();

    // 使用搜索Hook
    const {
      searchTerm,
      setSearchTerm,
      filteredPublications,
      clearSearch,
      hasSearch,
      resultCount,
    } = useSearch(publications);

    // 处理表单提交
    const handleFormSubmit = async (data: any) => {
      try {
        if (isEditMode && editingItem) {
          await updatePublication(editingItem.id, data);
        } else {
          await createPublication(data);
        }
        closeDialog();
      } catch (error) {
        // 错误已在Hook中处理
        console.error("Form submission error:", error);
      }
    };

    return (
      <div className={`space-y-6 ${className}`}>
        {/* 头部区域 */}
        <PublishedHeader
          count={publications.length}
          isLoading={isLoading}
          onRefresh={refreshPublications}
          onAdd={openAddDialog}
        />

        {/* 搜索栏 */}
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={clearSearch}
              placeholder="Search by title, venue, author, year, type, abstract, keywords..."
            />
          </div>
          <SearchHelp />
        </div>

        {/* 搜索结果提示 */}
        {hasSearch && (
          <div className={`text-sm ${themeColors.devDescText}`}>
            Found {resultCount} publication{resultCount !== 1 ? "s" : ""}{" "}
            matching "{searchTerm}"
          </div>
        )}

        {/* 出版物列表 */}
        <PublishedList
          publications={filteredPublications}
          isLoading={isLoading}
          error={error}
          deletingIds={deletingIds}
          onEdit={openEditDialog}
          onDelete={deletePublication}
          onRetry={refreshPublications}
        />

        {/* 表单对话框 */}
        <Dialog open={isOpen} onOpenChange={closeDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Publication" : "Add New Publication"}
              </DialogTitle>
            </DialogHeader>
            <PublicationForm
              initialData={editingItem}
              onSubmit={handleFormSubmit}
              onCancel={closeDialog}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

PublishedManager.displayName = "PublishedManager";

export default PublishedManager;
