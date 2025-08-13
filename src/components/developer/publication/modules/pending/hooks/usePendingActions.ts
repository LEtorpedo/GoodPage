import { useCallback } from "react";
import { toast } from "sonner";
import { PublicationWithAuthors } from "@/app/api/publications/route";
import { pendingApi } from "../services/pendingApi";

/**
 * 待审核出版物操作Hook
 * 负责业务逻辑和API调用
 */
export const usePendingActions = (
  setLoadingState: (loading: boolean) => void,
  setErrorState: (error: string | null) => void,
  clearError: () => void,
  setPublications: (publications: PublicationWithAuthors[]) => void,
  addProcessingId: (id: number) => void,
  removeProcessingId: (id: number) => void,
  setSubmittingState: (submitting: boolean) => void,
  updatePublication: (id: number, publication: PublicationWithAuthors) => void,
  removePublication: (id: number) => void,
  addPublication: (publication: PublicationWithAuthors) => void,
  setClearingState: (clearing: boolean) => void
) => {
  // 获取待审核出版物列表
  const fetchPublications = useCallback(async () => {
    setLoadingState(true);
    clearError();

    try {
      const publications = await pendingApi.fetchAll();
      setPublications(publications);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setErrorState(`Failed to load pending publications: ${errorMessage}`);
      toast.error("Failed to load pending publications");
    } finally {
      setLoadingState(false);
    }
  }, [setLoadingState, clearError, setPublications, setErrorState]);

  // 批准出版物
  const approvePublication = useCallback(
    async (id: number) => {
      // 确认操作
      if (
        !window.confirm("Are you sure you want to approve this publication?")
      ) {
        return false; // 用户取消操作
      }

      addProcessingId(id);
      clearError();

      try {
        await pendingApi.approve(id);
        removePublication(id);
        toast.success("Publication approved successfully!");
        return true; // 操作成功
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setErrorState(`Failed to approve publication: ${errorMessage}`);
        toast.error("Failed to approve publication");
        return false; // 操作失败
      } finally {
        removeProcessingId(id);
      }
    },
    [
      addProcessingId,
      removeProcessingId,
      clearError,
      setErrorState,
      removePublication,
    ]
  );

  // 拒绝出版物
  const rejectPublication = useCallback(
    async (id: number) => {
      // 确认操作
      if (
        !window.confirm(
          "Are you sure you want to reject this publication? This action cannot be undone."
        )
      ) {
        return;
      }

      addProcessingId(id);
      clearError();

      try {
        await pendingApi.reject(id);
        removePublication(id);
        toast.success("Publication rejected successfully!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setErrorState(`Failed to reject publication: ${errorMessage}`);
        toast.error("Failed to reject publication");
      } finally {
        removeProcessingId(id);
      }
    },
    [
      addProcessingId,
      removeProcessingId,
      clearError,
      setErrorState,
      removePublication,
    ]
  );

  // 更新出版物
  const updatePendingPublication = useCallback(
    async (id: number, data: any) => {
      setSubmittingState(true);
      clearError();

      try {
        const updatedPublication = await pendingApi.update(id, data);
        updatePublication(id, updatedPublication);
        toast.success("Publication updated successfully!");
        return updatedPublication;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setErrorState(`Failed to update publication: ${errorMessage}`);
        toast.error("Failed to update publication");
        throw error;
      } finally {
        setSubmittingState(false);
      }
    },
    [setSubmittingState, clearError, setErrorState, updatePublication]
  );

  // 创建新的待审核出版物
  const createPublication = useCallback(
    async (data: any) => {
      setSubmittingState(true);
      clearError();

      try {
        const newPublication = await pendingApi.create(data);
        addPublication(newPublication);
        toast.success("Publication created successfully!");
        return newPublication;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setErrorState(`Failed to create publication: ${errorMessage}`);
        toast.error("Failed to create publication");
        throw error;
      } finally {
        setSubmittingState(false);
      }
    },
    [setSubmittingState, clearError, setErrorState, addPublication]
  );

  // 清除所有待审核出版物
  const clearAllPublications = useCallback(async () => {
    // 确认操作
    if (
      !window.confirm(
        "Are you sure you want to delete ALL pending publications? This action cannot be undone."
      )
    ) {
      return;
    }

    setClearingState(true);
    clearError();

    try {
      const result = await pendingApi.clearAll();
      setPublications([]); // 清空列表
      toast.success(
        `Successfully deleted ${result.deletedCount} pending publications!`
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setErrorState(`Failed to clear all publications: ${errorMessage}`);
      toast.error("Failed to clear all publications");
      throw error;
    } finally {
      setClearingState(false);
    }
  }, [setClearingState, clearError, setErrorState, setPublications]);

  return {
    fetchPublications,
    approvePublication,
    rejectPublication,
    updatePendingPublication,
    createPublication,
    clearAllPublications,
  };
};
