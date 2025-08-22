/**
 * 权限管理 Hook
 * 单一职责：为 React 组件提供权限检查接口
 */

import { useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  hasPermission,
  canManageMember,
} from "@/lib/permissions/permissionChecker";
import { PERMISSIONS } from "@/lib/permissions/constants";

export function usePermissions() {
  const { permissions, isFullAccess } = useAuthStore();

  // 将 permissions 转换为角色数组（兼容现有逻辑）
  const userRoles = permissions || [];

  /**
   * 检查是否拥有特定权限
   */
  const checkPermission = useCallback(
    (requiredPermission?: string) => {
      return hasPermission(userRoles, isFullAccess, requiredPermission);
    },
    [userRoles, isFullAccess]
  );

  /**
   * 检查是否可以管理特定成员
   */
  const canManageUser = useCallback(
    (
      targetMemberRole: string,
      currentUserId?: string,
      targetMemberId?: string
    ) => {
      return canManageMember(
        userRoles,
        targetMemberRole,
        currentUserId,
        targetMemberId
      );
    },
    [userRoles]
  );

  return {
    // 基础权限检查
    hasPermission: checkPermission,
    canManageUser,
    isFullAccess,
    userRoles,

    // 常用权限检查快捷方法
    canManageNews: () => checkPermission(PERMISSIONS.MANAGE_NEWS),
    canManagePublications: () =>
      checkPermission(PERMISSIONS.MANAGE_PUBLICATIONS),
    canManageMembers: () => checkPermission(PERMISSIONS.MANAGE_MEMBERS),
    canManagePhotos: () => checkPermission(PERMISSIONS.MANAGE_PHOTOS),
    canManageUsers: () => checkPermission(PERMISSIONS.MANAGE_USERS),
    canManageSettings: () => checkPermission(PERMISSIONS.MANAGE_SETTINGS),
  };
}
