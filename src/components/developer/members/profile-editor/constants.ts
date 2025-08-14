import { MemberStatus } from "@prisma/client";
import type { SectionId, OpenSectionsState } from "./types";

/**
 * 默认章节开启状态配置
 */
export const DEFAULT_OPEN_SECTIONS: OpenSectionsState = {
  basicInfo: false,
  detailedProfile: false,
  links: false,
  education: false,
  awards: false,
  featuredPublications: false,
  projects: false,
  presentations: false,
  softwareDatasets: false,
  patents: false,
  academicServices: false,
  passwordChange: false,
  usernameChange: false,
};

/**
 * 成员状态标签映射
 */
export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MemberStatus.PROFESSOR]: "Professor",
  [MemberStatus.POSTDOC]: "Postdoc",
  [MemberStatus.PHD_STUDENT]: "PhD Student",
  [MemberStatus.MASTER_STUDENT]: "Master Student",
  [MemberStatus.UNDERGRADUATE]: "Undergraduate",
  [MemberStatus.RESEARCH_STAFF]: "Research Staff",
  [MemberStatus.VISITING_SCHOLAR]: "Visiting Scholar",
  [MemberStatus.ALUMNI]: "Alumni",
  [MemberStatus.OTHER]: "Other",
};

/**
 * 支持的头像文件类型
 */
export const SUPPORTED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpg",
];

/**
 * 头像文件最大尺寸（字节）
 */
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 动画配置
 */
export const ANIMATION_CONFIG = {
  duration: 0.3,
  ease: "easeInOut" as const,
};

/**
 * 章节图标配置
 */
export const SECTION_ICONS = {
  basicInfo: "Info",
  detailedProfile: "ClipboardList",
  links: "Link",
  education: "GraduationCap",
  awards: "AwardIcon",
  featuredPublications: "Star",
  projects: "Briefcase",
  presentations: "PresentationIcon",
  softwareDatasets: "Database",
  patents: "ScrollText",
  academicServices: "Users",
  passwordChange: "KeyRound",
  usernameChange: "UserCog",
} as const;

/**
 * 表单验证配置
 */
export const FORM_VALIDATION = {
  // 最小年份（用于年份字段验证）
  MIN_YEAR: 1900,
  // 最大年份（当前年份+10）
  MAX_YEAR: new Date().getFullYear() + 10,
  // 最大文本长度
  MAX_TEXT_LENGTH: 1000,
  // 最大描述长度
  MAX_DESCRIPTION_LENGTH: 2000,
} as const;

/**
 * 默认占位符文本
 */
export const PLACEHOLDER_TEXTS = {
  notSet: "Not set",
  enterValue: "Enter value...",
  selectStatus: "Select status...",
  loading: "Loading...",
  saving: "Saving...",
  uploading: "Uploading...",
  deleting: "Deleting...",
} as const;

/**
 * Toast消息配置
 */
export const TOAST_MESSAGES = {
  success: {
    fieldUpdated: (fieldName: string) => `Field "${fieldName}" updated successfully.`,
    statusUpdated: (status: string) => `Status updated to ${status}.`,
    visibilityUpdated: (isPublic: boolean) =>
      `Profile visibility updated to ${isPublic ? "Public" : "Private"}.`,
    avatarUploaded: "Avatar uploaded and saved successfully!",
    recordAdded: (recordType: string) => `${recordType} record added successfully!`,
    recordUpdated: (recordType: string) => `${recordType} record updated successfully!`,
    recordDeleted: (recordType: string) => `${recordType} record deleted successfully!`,
    featuredPublicationsUpdated: "Featured publications updated successfully!",
  },
  error: {
    fieldUpdateFailed: (fieldName: string, error?: string) =>
      `Failed to update "${fieldName}": ${error || "Unknown error"}`,
    statusUpdateFailed: (error?: string) => `Failed to update status: ${error || "Unknown error"}`,
    visibilityUpdateFailed: (error?: string) =>
      `Failed to update visibility: ${error || "Unknown error"}`,
    avatarUploadFailed: (error?: string) => `Failed to upload avatar: ${error || "Unknown error"}`,
    invalidFileType: "Only JPG, PNG, GIF, and WEBP images are supported.",
    fileSizeExceeded: "Image size must not exceed 5MB.",
    invalidNumber: "Please enter a valid number.",
    recordOperationFailed: (operation: string, recordType: string, error?: string) =>
      `Failed to ${operation} ${recordType} record: ${error || "Unknown error"}`,
    featuredPublicationsUpdateFailed: (error?: string) =>
      `Failed to update featured publications: ${error || "Unknown error"}`,
    unexpectedError: (error?: string) => `An unexpected error occurred: ${error || "Unknown error"}`,
  },
} as const;

/**
 * 确认对话框文本
 */
export const CONFIRMATION_TEXTS = {
  deleteTitle: "Are you absolutely sure?",
  deleteDescription: (recordType: string) =>
    `This action cannot be undone. This will permanently delete this ${recordType} record.`,
  deleteProjectDescription:
    "This will remove your association with this project. It will not delete the project itself if others are linked.",
  cancel: "Cancel",
  confirm: "Yes, delete it",
  confirmRemoveLink: "Yes, remove link",
} as const;

/**
 * 卡片样式类名
 */
export const CARD_STYLES = {
  base: "overflow-hidden border-green-500/50 dark:border-green-400/40",
  header: "flex flex-row items-center justify-between cursor-pointer px-3 py-0",
  title: "text-lg flex items-center gap-2 text-green-700 dark:text-green-400",
  content: "pt-4",
  footer: "border-t dark:border-gray-700 p-3",
} as const;

/**
 * 按钮样式类名
 */
export const BUTTON_STYLES = {
  primary: "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white",
  outline: "border-green-500 text-green-700 dark:border-green-400 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900",
  chevron: "self-center text-green-500 dark:text-green-400",
} as const;
