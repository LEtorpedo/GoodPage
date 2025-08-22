/**
 * 权限系统常量定义
 * 单一职责：权限和角色的常量定义
 */

// 权限点定义
export const PERMISSIONS = {
  // 用户和角色管理
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",

  // 网站设置
  MANAGE_SETTINGS: "manage_settings",

  // 内容管理
  MANAGE_NEWS: "manage_news",
  MANAGE_PUBLICATIONS: "manage_publications",
  MANAGE_MEMBERS: "manage_members",
  MANAGE_PHOTOS: "manage_photos",

  // 服务器管理
  MANAGE_CODESERVERS: "manage_codeservers",

  // 内容审核
  APPROVE_CONTENT: "approve_content",

  // 日志查看
  VIEW_LOGS: "view_logs",
} as const;

// 角色定义
export const ROLES = {
  ROOT: "Root",
  ADMIN: "Admin",
  SENIOR_MEMBER: "SeniorMember",
  MAINTAINER: "Maintainer",
  USER: "User",
  ALUMNI: "Alumni",
} as const;

// 角色显示名称映射
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  [ROLES.ROOT]: "系统管理员",
  [ROLES.ADMIN]: "网站管理员",
  [ROLES.SENIOR_MEMBER]: "资深成员",
  [ROLES.MAINTAINER]: "板块维护者",
  [ROLES.USER]: "普通成员",
  [ROLES.ALUMNI]: "已毕业学生",
};

// 权限显示名称映射
export const PERMISSION_DISPLAY_NAMES: Record<string, string> = {
  [PERMISSIONS.MANAGE_USERS]: "用户管理",
  [PERMISSIONS.MANAGE_ROLES]: "角色管理",
  [PERMISSIONS.MANAGE_SETTINGS]: "系统设置",
  [PERMISSIONS.MANAGE_NEWS]: "新闻管理",
  [PERMISSIONS.MANAGE_PUBLICATIONS]: "出版物管理",
  [PERMISSIONS.MANAGE_MEMBERS]: "成员管理",
  [PERMISSIONS.MANAGE_PHOTOS]: "图库管理",
  [PERMISSIONS.MANAGE_CODESERVERS]: "服务器管理",
  [PERMISSIONS.APPROVE_CONTENT]: "内容审核",
  [PERMISSIONS.VIEW_LOGS]: "日志查看",
};
