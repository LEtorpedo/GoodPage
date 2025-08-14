"use client";

import React from "react";
import { themeColors } from "@/styles/theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 导入组件
import PendingHeader from "./components/PendingHeader";
import PendingList from "./components/PendingList";
import { useDialog } from "../../shared/hooks/useDialog";
import { useSearch } from "../../shared/hooks/useSearch";
import SearchBar from "../../shared/components/SearchBar";
import SearchHelp from "../../shared/components/SearchHelp";
import { PublicationForm } from "../../forms/PublicationForm";

// 导入待审核专用Hook
import { usePendingManager } from "./hooks/usePendingManager";

interface PendingManagerProps {
  className?: string;
  onApproved?: () => void; // 审核通过后的回调
}

/**
 * 待审核出版物管理器
 * 组合各个小模块，提供完整的管理功能
 */
const PendingManager: React.FC<PendingManagerProps> = ({
  className = "",
  onApproved,
}) => {
  // 使用待审核管理器Hook
  const {
    publications,
    isLoading,
    error,
    processingIds,
    isSubmitting,
    isClearing,
    refreshPublications,
    createPublication,
    updatePendingPublication,
    approvePublication,
    rejectPublication,
    clearAllPublications,
    clearError,
  } = usePendingManager();

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
        await updatePendingPublication(editingItem.id, data);
      } else {
        await createPublication(data);
      }
      closeDialog();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // 处理批准
  const handleApprove = async (id: number) => {
    const success = await approvePublication(id);
    // 只有审核成功后才调用回调函数
    if (success && onApproved) {
      onApproved();
    }
  };

  // 处理拒绝
  const handleReject = async (id: number) => {
    await rejectPublication(id);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部区域 */}
      <PendingHeader
        count={publications.length}
        isLoading={isLoading}
        isClearing={isClearing}
        onRefresh={refreshPublications}
        onAdd={openAddDialog}
        onClearAll={clearAllPublications}
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
          Found {resultCount} pending publication{resultCount !== 1 ? "s" : ""}{" "}
          matching "{searchTerm}"
        </div>
      )}

      {/* 出版物列表 */}
      <PendingList
        publications={filteredPublications}
        isLoading={isLoading}
        error={error}
        processingIds={processingIds}
        onEdit={openEditDialog}
        onApprove={handleApprove}
        onReject={handleReject}
        onRetry={refreshPublications}
      />

      {/* 表单对话框 */}
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? "Edit Pending Publication"
                : "Add New Pending Publication"}
            </DialogTitle>
          </DialogHeader>
          <PublicationForm
            initialData={editingItem || undefined}
            onSubmit={handleFormSubmit}
            onCancel={closeDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingManager;
