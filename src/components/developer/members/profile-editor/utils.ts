import { MemberStatus } from "@prisma/client";
import {
  MEMBER_STATUS_LABELS,
  SUPPORTED_AVATAR_TYPES,
  MAX_AVATAR_SIZE,
} from "./constants";
import type { EditablePublication, EditableProjectInfo } from "./types";

/**
 * 格式化成员状态标签
 * @param status 成员状态枚举值
 * @returns 格式化后的状态标签
 */
export const formatStatusLabel = (status: MemberStatus): string => {
  const label = MEMBER_STATUS_LABELS[status];
  if (!label) {
    console.warn(`Unknown member status encountered: ${status}`);
    return status; // 返回原始值作为回退
  }
  return label;
};

/**
 * 验证头像文件是否有效
 * @param file 要验证的文件
 * @returns 验证结果对象，包含是否有效和错误信息
 */
export const validateAvatarFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // 检查文件类型
  if (!SUPPORTED_AVATAR_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Only JPG, PNG, GIF, and WEBP images are supported.",
    };
  }

  // 检查文件大小
  if (file.size > MAX_AVATAR_SIZE) {
    return {
      isValid: false,
      error: "Image size must not exceed 5MB.",
    };
  }

  return { isValid: true };
};

/**
 * 按年份降序排序教育记录
 * @param educationList 教育记录列表
 * @returns 排序后的教育记录列表
 */
export const sortEducationByYear = <T extends { start_year?: number | null }>(
  educationList: T[]
): T[] => {
  return [...educationList].sort(
    (a, b) => (b.start_year ?? 0) - (a.start_year ?? 0)
  );
};

/**
 * 按年份和显示顺序排序获奖记录
 * @param awardsList 获奖记录列表
 * @returns 排序后的获奖记录列表
 */
export const sortAwardsByYearAndOrder = <
  T extends { year?: number | null; display_order?: number | null },
>(
  awardsList: T[]
): T[] => {
  return [...awardsList].sort(
    (a, b) =>
      (b.year ?? 0) - (a.year ?? 0) ||
      (a.display_order ?? Infinity) - (b.display_order ?? Infinity)
  );
};

/**
 * 按开始年份降序排序项目记录
 * @param projectsList 项目记录列表
 * @returns 排序后的项目记录列表
 */
export const sortProjectsByYear = (
  projectsList: EditableProjectInfo[]
): EditableProjectInfo[] => {
  return [...projectsList].sort(
    (a, b) => (b.project.start_year ?? 0) - (a.project.start_year ?? 0)
  );
};

/**
 * 按年份降序排序演示报告记录
 * @param presentationList 演示报告记录列表
 * @returns 排序后的演示报告记录列表
 */
export const sortPresentationsByYear = <T extends { year?: number | null }>(
  presentationList: T[]
): T[] => {
  return [...presentationList].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
};

/**
 * 按开始年份降序排序学术服务记录
 * @param academicServicesList 学术服务记录列表
 * @returns 排序后的学术服务记录列表
 */
export const sortAcademicServicesByYear = <
  T extends { start_year?: number | null },
>(
  academicServicesList: T[]
): T[] => {
  return [...academicServicesList].sort(
    (a, b) => (b.start_year ?? 0) - (a.start_year ?? 0)
  );
};

/**
 * 验证数字输入值
 * @param value 输入值
 * @param inputType 输入类型
 * @returns 验证结果对象
 */
export const validateNumberInput = (
  value: string,
  inputType: string
): { isValid: boolean; error?: string; processedValue: string | null } => {
  if (inputType !== "number") {
    return { isValid: true, processedValue: value };
  }

  // 处理空字符串（对于数字输入应该为null）
  if (value.trim() === "") {
    return { isValid: true, processedValue: null };
  }

  // 检查是否为有效数字
  if (isNaN(Number(value))) {
    return {
      isValid: false,
      error: "Please enter a valid number.",
      processedValue: value,
    };
  }

  return { isValid: true, processedValue: value };
};

/**
 * 解析Zod验证错误信息
 * @param errorMessage 错误信息字符串
 * @returns 格式化后的错误信息
 */
export const parseZodError = (errorMessage: string): string => {
  try {
    const fieldErrors = JSON.parse(errorMessage);
    // 格式化Zod错误以提高可读性
    return `Validation Error: ${Object.entries(fieldErrors)
      .map(([field, errors]) => `${field}: ${(errors as string[]).join(", ")}`)
      .join("; ")}`;
  } catch (e) {
    // 如果解析失败，返回默认错误信息
    return `Error: ${errorMessage || "An unknown error occurred"}`;
  }
};

/**
 * 创建拖拽样式对象
 * @param transform 变换对象
 * @param transition 过渡字符串
 * @param isDragging 是否正在拖拽
 * @returns 样式对象
 */
export const createDragStyle = (
  transform: any,
  transition: string | undefined,
  isDragging: boolean
) => ({
  transform: transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined,
  transition,
  opacity: isDragging ? 0.7 : 1,
  zIndex: isDragging ? 10 : "auto",
  boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
  cursor: "default",
});

/**
 * 生成发表论文的特色更新数据
 * @param publications 发表论文列表
 * @returns 特色更新数据数组
 */
export const generateFeaturedUpdates = (
  publications: EditablePublication[]
) => {
  return publications.map((pub, index) => ({
    publicationId: pub.id,
    isFeatured: pub.isFeatured,
    order: pub.profileDisplayOrder ?? index,
  }));
};

/**
 * 检查字符串是否为空或仅包含空白字符
 * @param value 要检查的字符串
 * @returns 是否为空
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim() === "";
};

/**
 * 截断文本到指定长度
 * @param text 要截断的文本
 * @param maxLength 最大长度
 * @param suffix 后缀（默认为"..."）
 * @returns 截断后的文本
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix = "..."
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array)
    return obj.map((item) => deepClone(item)) as unknown as T;
  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};
