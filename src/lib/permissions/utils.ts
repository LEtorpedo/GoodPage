/**
 * 权限工具函数
 * 单一职责：权限相关的辅助工具函数
 */

import {
  ROLES,
  ROLE_DISPLAY_NAMES,
  PERMISSION_DISPLAY_NAMES,
} from "./constants";

/**
 * 检查角色是否为全权限角色
 * @param role 角色名称
 * @returns 是否为全权限角色
 */
export function isFullAccessRole(role: string): boolean {
  return role === ROLES.ROOT || role === ROLES.ADMIN;
}

/**
 * 获取角色显示名称
 * @param role 角色代码
 * @returns 显示名称
 */
export function getRoleDisplayName(role: string): string {
  return ROLE_DISPLAY_NAMES[role] || "未知角色";
}

/**
 * 获取权限显示名称
 * @param permission 权限代码
 * @returns 显示名称
 */
export function getPermissionDisplayName(permission: string): string {
  return PERMISSION_DISPLAY_NAMES[permission] || "未知权限";
}

/**
 * 获取用户可以访问的工具列表
 * @param userRoles 用户角色
 * @param isFullAccess 是否为全权限用户
 * @param allTools 所有工具配置
 * @param hasPermissionFn 权限检查函数
 * @returns 可访问的工具列表
 */
export function getAccessibleTools<T extends { requiredPermission?: string }>(
  userRoles: string[],
  isFullAccess: boolean,
  allTools: T[],
  hasPermissionFn: (permission?: string) => boolean
): T[] {
  return allTools.filter((tool) => hasPermissionFn(tool.requiredPermission));
}

/**
 * 获取角色层级（数字越小权限越高）
 * @param role 角色
 * @returns 层级数字
 */
export function getRoleLevel(role: string): number {
  const roleLevels: Record<string, number> = {
    [ROLES.ROOT]: 1,
    [ROLES.ADMIN]: 2,
    [ROLES.SENIOR_MEMBER]: 3,
    [ROLES.MAINTAINER]: 4,
    [ROLES.USER]: 5,
    [ROLES.ALUMNI]: 6,
  };
  return roleLevels[role] || 999;
}

/**
 * 检查是否可以分配特定角色
 * @param currentUserRoles 当前用户角色
 * @param targetRole 要分配的角色
 * @returns 是否可以分配
 */
export function canAssignRole(
  currentUserRoles: string[],
  targetRole: string
): boolean {
  // Root 可以分配任何角色
  if (currentUserRoles.includes(ROLES.ROOT)) {
    return true;
  }

  // Admin 可以分配除 Root 外的任何角色
  if (currentUserRoles.includes(ROLES.ADMIN) && targetRole !== ROLES.ROOT) {
    return true;
  }

  return false;
}
