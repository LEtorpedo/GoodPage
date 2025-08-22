/**
 * 权限检查核心工具函数
 * 单一职责：权限验证逻辑
 */

/**
 * 检查用户是否拥有特定权限
 * @param userRoles 用户角色数组
 * @param isFullAccess 是否为全权限用户
 * @param requiredPermission 需要的权限
 * @returns 是否拥有权限
 */
export function hasPermission(
  userRoles: string[],
  isFullAccess: boolean,
  requiredPermission?: string
): boolean {
  // 没有权限要求的功能，所有人都可以访问
  if (!requiredPermission) return true;

  // 全权限用户拥有所有权限
  if (isFullAccess) return true;

  // 根据角色检查权限
  for (const role of userRoles) {
    if (checkRolePermission(role, requiredPermission)) {
      return true;
    }
  }

  return false;
}

/**
 * 检查特定角色是否拥有权限
 * @param role 角色名称
 * @param permission 权限名称
 * @returns 是否拥有权限
 */
function checkRolePermission(role: string, permission: string): boolean {
  switch (role) {
    case "Root":
      // Root 拥有所有权限
      return true;

    case "Admin":
      // Admin 拥有除管理 Root 外的所有权限
      return permission !== "manage_roles";

    case "SeniorMember":
      return [
        "manage_news",
        "manage_publications",
        "manage_members",
        "manage_photos",
        "approve_content",
        "manage_codeservers",
      ].includes(permission);

    case "Maintainer":
      return [
        "manage_news",
        "manage_publications",
        "manage_photos",
        "manage_members",
      ].includes(permission);

    case "User":
      // User 只能编辑自身信息，无其他管理权限
      return false;

    case "Alumni":
      // Alumni 无任何开发者页面权限
      return false;

    default:
      return false;
  }
}

/**
 * 检查用户是否可以管理特定成员
 * @param currentUserRoles 当前用户角色
 * @param targetMemberRole 目标成员角色
 * @param currentUserId 当前用户ID
 * @param targetMemberId 目标成员ID
 * @returns 是否可以管理
 */
export function canManageMember(
  currentUserRoles: string[],
  targetMemberRole: string,
  currentUserId?: string,
  targetMemberId?: string
): boolean {
  // 用户可以编辑自己的信息
  if (currentUserId && targetMemberId && currentUserId === targetMemberId) {
    return true;
  }

  // Root 可以管理所有人
  if (currentUserRoles.includes("Root")) {
    return true;
  }

  // Admin 可以管理除 Root 外的所有人
  if (currentUserRoles.includes("Admin") && targetMemberRole !== "Root") {
    return true;
  }

  // SeniorMember 可以管理 User 和 Alumni
  if (
    currentUserRoles.includes("SeniorMember") &&
    (targetMemberRole === "User" || targetMemberRole === "Alumni")
  ) {
    return true;
  }

  return false;
}
