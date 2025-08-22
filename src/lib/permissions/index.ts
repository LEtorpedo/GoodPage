/**
 * 权限系统统一导出
 * 单一职责：提供权限系统的统一入口
 */

// 导出常量
export {
  PERMISSIONS,
  ROLES,
  ROLE_DISPLAY_NAMES,
  PERMISSION_DISPLAY_NAMES,
} from "./constants";

// 导出权限检查函数
export { hasPermission, canManageMember } from "./permissionChecker";

// 导出工具函数
export {
  isFullAccessRole,
  getRoleDisplayName,
  getPermissionDisplayName,
  getAccessibleTools,
  getRoleLevel,
  canAssignRole,
} from "./utils";
