import { useState } from "react";
import { MemberStatus } from "@prisma/client";
import type {
  Education,
  Award,
  Teaching,
  AcademicService,
  Presentation,
  SoftwareDataset,
  Patent,
} from "@prisma/client";
import type { MemberProfileData } from "@/lib/types";
import type {
  OpenSectionsState,
  EditablePublication,
  EditableProjectInfo,
  SectionId,
} from "../types";
import { DEFAULT_OPEN_SECTIONS } from "../constants";

/**
 * 成员资料状态管理Hook
 * @param initialData 初始数据
 * @returns 状态和更新函数
 */
export const useMemberProfileState = (initialData: MemberProfileData) => {
  // 基本状态
  const [currentStatus, setCurrentStatus] = useState<MemberStatus | undefined>(
    initialData.status ?? undefined
  );
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(
    initialData.is_profile_public ?? true
  );
  const [isVisibilityLoading, setIsVisibilityLoading] = useState(false);

  // 章节展开/折叠状态
  const [openSections, setOpenSections] = useState<OpenSectionsState>(DEFAULT_OPEN_SECTIONS);

  // 教育历史状态
  const [educationHistory, setEducationHistory] = useState<Education[]>(
    initialData.educationHistory || []
  );

  // 获奖记录状态
  const [awardsList, setAwardsList] = useState<Award[]>(
    initialData.awards || []
  );

  // 教学记录状态
  const [teachingList, setTeachingList] = useState<Teaching[]>(
    initialData.teachingRoles || []
  );

  // 学术服务状态
  const [academicServicesList, setAcademicServicesList] = useState<AcademicService[]>(
    initialData.academicServices || []
  );

  // 演示报告状态
  const [presentationList, setPresentationList] = useState<Presentation[]>(
    initialData.presentations || []
  );

  // 软件和数据集状态
  const [softwareAndDatasetsList, setSoftwareAndDatasetsList] = useState<SoftwareDataset[]>(
    initialData.softwareAndDatasets || []
  );

  // 专利状态
  const [patentsList, setPatentsList] = useState<Patent[]>(
    initialData.patents || []
  );

  // 项目状态
  const [projectsList, setProjectsList] = useState<EditableProjectInfo[]>(
    initialData.projects || []
  );

  // 特色发表论文状态
  const [editablePublications, setEditablePublications] = useState<EditablePublication[]>(() => {
    return initialData.publications.map(
      (pub: any): EditablePublication => ({
        ...pub,
      })
    );
  });
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);

  // 切换章节展开状态
  const toggleSection = (sectionId: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  return {
    // 基本状态
    currentStatus,
    setCurrentStatus,
    isStatusLoading,
    setIsStatusLoading,
    isPublic,
    setIsPublic,
    isVisibilityLoading,
    setIsVisibilityLoading,

    // 章节状态
    openSections,
    toggleSection,

    // 各种记录状态
    educationHistory,
    setEducationHistory,
    awardsList,
    setAwardsList,
    teachingList,
    setTeachingList,
    academicServicesList,
    setAcademicServicesList,
    presentationList,
    setPresentationList,
    softwareAndDatasetsList,
    setSoftwareAndDatasetsList,
    patentsList,
    setPatentsList,
    projectsList,
    setProjectsList,

    // 特色发表论文状态
    editablePublications,
    setEditablePublications,
    isSavingFeatured,
    setIsSavingFeatured,
  };
};
