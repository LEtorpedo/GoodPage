import type {
  Education,
  Award,
  Teaching,
  Project,
  ProjectMember,
  Publication,
  PublicationAuthor,
  AcademicService,
  Presentation,
  SoftwareDataset,
  Patent,
  MemberStatus,
} from "@prisma/client";
import type { MemberProfileData, PublicationInfo } from "@/lib/types";

/**
 * 主组件Props定义
 */
export type MemberProfileEditorProps = {
  initialData: MemberProfileData;
};

/**
 * 可编辑字段通用组件Props
 */
export type EditableTextFieldProps = {
  label: string;
  fieldName: keyof MemberProfileData;
  initialValue: string | number | null | undefined;
  memberId: string;
  isTextArea?: boolean;
  inputType?: "text" | "email" | "url" | "number";
  placeholder?: string;
};

/**
 * 可编辑发表论文类型
 */
export type EditablePublication = PublicationInfo & {
  isFeatured: boolean;
  profileDisplayOrder: number | null;
};

/**
 * 可编辑项目信息类型（结合Project和ProjectMember信息）
 */
export type EditableProjectInfo = ProjectMember & { project: Project };

/**
 * 章节ID类型定义
 */
export type SectionId =
  | "basicInfo"
  | "detailedProfile"
  | "links"
  | "education"
  | "awards"
  | "featuredPublications"
  | "projects"
  | "presentations"
  | "softwareDatasets"
  | "patents"
  | "academicServices"
  | "passwordChange"
  | "usernameChange";

/**
 * 排序发表论文项目Props
 */
export type SortablePublicationItemProps = {
  pub: EditablePublication;
  isSavingFeatured: boolean;
  onToggleFeatured: (id: number) => void;
};

/**
 * 头像上传组件Props
 */
export type AvatarUploadProps = {
  memberId: string;
  currentAvatarUrl: string;
  memberName: string;
};

/**
 * 基本信息组件Props
 */
export type BasicInfoSectionProps = {
  initialData: MemberProfileData;
  isOpen: boolean;
  onToggle: () => void;
};

/**
 * 详细信息组件Props
 */
export type DetailedProfileSectionProps = {
  initialData: MemberProfileData;
  isOpen: boolean;
  onToggle: () => void;
};

/**
 * 链接信息组件Props
 */
export type LinksSectionProps = {
  initialData: MemberProfileData;
  isOpen: boolean;
  onToggle: () => void;
};

/**
 * 教育历史组件Props
 */
export type EducationSectionProps = {
  educationHistory: Education[];
  isOpen: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (education: Education) => void;
  onDelete: (educationId: number) => void;
};

/**
 * 获奖记录组件Props
 */
export type AwardsSectionProps = {
  awardsList: Award[];
  isOpen: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (award: Award) => void;
  onDelete: (awardId: number) => void;
};

/**
 * 特色发表论文组件Props
 */
export type FeaturedPublicationsSectionProps = {
  publications: EditablePublication[];
  isOpen: boolean;
  isSaving: boolean;
  onToggle: () => void;
  onToggleFeatured: (publicationId: number) => void;
  onSave: () => void;
  onDragEnd: (event: any) => void;
};

/**
 * 项目组件Props
 */
export type ProjectsSectionProps = {
  projectsList: EditableProjectInfo[];
  isOpen: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (project: EditableProjectInfo) => void;
  onDelete: (projectId: number, memberId: string) => void;
};

/**
 * 演示报告组件Props
 */
export type PresentationsSectionProps = {
  presentationList: Presentation[];
  isOpen: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (presentation: Presentation) => void;
  onDelete: (presentationId: number) => void;
};

/**
 * 软件和数据集组件Props
 */
export type SoftwareDatasetsSectionProps = {
  softwareAndDatasetsList: SoftwareDataset[];
  isOpen: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (record: SoftwareDataset) => void;
  onDelete: (id: number) => void;
};

/**
 * 学术服务组件Props
 */
export type AcademicServicesSectionProps = {
  academicServicesList: AcademicService[];
  isOpen: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (service: AcademicService) => void;
  onDelete: (serviceId: number) => void;
};

/**
 * 专利组件Props
 */
export type PatentsSectionProps = {
  patentsList: Patent[];
  isOpen: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (patent: Patent) => void;
  onDelete: (patentId: number) => void;
};

/**
 * 可折叠卡片组件Props
 */
export type CollapsibleCardProps = {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * 状态管理相关类型
 */
export type OpenSectionsState = Record<SectionId, boolean>;

/**
 * 头像上传状态类型
 */
export type AvatarUploadState = {
  avatarUrl: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  isUploading: boolean;
};
