import { useState } from "react";
import type {
  Education,
  Award,
  Teaching,
  Project,
  AcademicService,
  Presentation,
  SoftwareDataset,
  Patent,
} from "@prisma/client";

/**
 * 模态框状态管理Hook
 * @returns 各种模态框的状态和控制函数
 */
export const useModalStates = () => {
  // 教育历史模态框状态
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducationData, setEditingEducationData] =
    useState<Partial<Education> | null>(null);

  // 获奖记录模态框状态
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Partial<Award> | null>(null);

  // 教学记录模态框状态
  const [isTeachingModalOpen, setIsTeachingModalOpen] = useState(false);
  const [editingTeaching, setEditingTeaching] =
    useState<Partial<Teaching> | null>(null);

  // 项目模态框状态
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectData, setEditingProjectData] = useState<
    (Project & { memberRole?: string }) | undefined
  >(undefined);

  // 学术服务模态框状态
  const [isAcademicServiceModalOpen, setIsAcademicServiceModalOpen] =
    useState(false);
  const [editingAcademicService, setEditingAcademicService] =
    useState<AcademicService | null>(null);

  // 演示报告模态框状态
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [editingPresentation, setEditingPresentation] =
    useState<Presentation | null>(null);

  // 软件和数据集模态框状态
  const [isSoftwareDatasetModalOpen, setIsSoftwareDatasetModalOpen] =
    useState(false);
  const [editingSoftwareAndDataset, setEditingSoftwareAndDataset] =
    useState<SoftwareDataset | null>(null);

  // 专利模态框状态
  const [isPatentModalOpen, setIsPatentModalOpen] = useState(false);
  const [editingPatent, setEditingPatent] = useState<Patent | null>(null);

  // 教育历史模态框控制函数
  const openAddEducationModal = () => {
    setEditingEducationData(null);
    setIsEducationModalOpen(true);
  };

  const openEditEducationModal = (education: Education) => {
    setEditingEducationData(education);
    setIsEducationModalOpen(true);
  };

  const closeEducationModal = () => {
    setIsEducationModalOpen(false);
    setEditingEducationData(null);
  };

  // 获奖记录模态框控制函数
  const openAddAwardModal = () => {
    setEditingAward(null);
    setIsAwardModalOpen(true);
  };

  const openEditAwardModal = (award: Award) => {
    setEditingAward(award);
    setIsAwardModalOpen(true);
  };

  const closeAwardModal = () => {
    setIsAwardModalOpen(false);
    setEditingAward(null);
  };

  // 教学记录模态框控制函数
  const openAddTeachingModal = () => {
    setEditingTeaching(null);
    setIsTeachingModalOpen(true);
  };

  const openEditTeachingModal = (teaching: Teaching) => {
    setEditingTeaching(teaching);
    setIsTeachingModalOpen(true);
  };

  const closeTeachingModal = () => {
    setIsTeachingModalOpen(false);
    setEditingTeaching(null);
  };

  // 项目模态框控制函数
  const openAddProjectModal = () => {
    setEditingProjectData(undefined);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (
    projectData: Project & { memberRole?: string }
  ) => {
    setEditingProjectData(projectData);
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProjectData(undefined);
  };

  // 学术服务模态框控制函数
  const openAddServiceModal = () => {
    setEditingAcademicService(null);
    setIsAcademicServiceModalOpen(true);
  };

  const openEditServiceModal = (service: AcademicService) => {
    setEditingAcademicService(service);
    setIsAcademicServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsAcademicServiceModalOpen(false);
    setEditingAcademicService(null);
  };

  // 演示报告模态框控制函数
  const openAddPresentationModal = () => {
    setEditingPresentation(null);
    setIsPresentationModalOpen(true);
  };

  const openEditPresentationModal = (presentation: Presentation) => {
    setEditingPresentation(presentation);
    setIsPresentationModalOpen(true);
  };

  const closePresentationModal = () => {
    setIsPresentationModalOpen(false);
    setEditingPresentation(null);
  };

  // 软件和数据集模态框控制函数
  const openAddSoftwareDatasetModal = () => {
    setEditingSoftwareAndDataset(null);
    setIsSoftwareDatasetModalOpen(true);
  };

  const openEditSoftwareDatasetModal = (record: SoftwareDataset) => {
    setEditingSoftwareAndDataset(record);
    setIsSoftwareDatasetModalOpen(true);
  };

  const closeSoftwareDatasetModal = () => {
    setIsSoftwareDatasetModalOpen(false);
    setEditingSoftwareAndDataset(null);
  };

  // 专利模态框控制函数
  const openAddPatentModal = () => {
    setEditingPatent(null);
    setIsPatentModalOpen(true);
  };

  const openEditPatentModal = (patent: Patent) => {
    setEditingPatent(patent);
    setIsPatentModalOpen(true);
  };

  const closePatentModal = () => {
    setIsPatentModalOpen(false);
    setEditingPatent(null);
  };

  return {
    // 教育历史
    isEducationModalOpen,
    editingEducationData,
    openAddEducationModal,
    openEditEducationModal,
    closeEducationModal,

    // 获奖记录
    isAwardModalOpen,
    editingAward,
    openAddAwardModal,
    openEditAwardModal,
    closeAwardModal,

    // 教学记录
    isTeachingModalOpen,
    editingTeaching,
    openAddTeachingModal,
    openEditTeachingModal,
    closeTeachingModal,

    // 项目
    isProjectModalOpen,
    editingProjectData,
    openAddProjectModal,
    openEditProjectModal,
    closeProjectModal,

    // 学术服务
    isAcademicServiceModalOpen,
    editingAcademicService,
    openAddServiceModal,
    openEditServiceModal,
    closeServiceModal,

    // 演示报告
    isPresentationModalOpen,
    editingPresentation,
    openAddPresentationModal,
    openEditPresentationModal,
    closePresentationModal,

    // 软件和数据集
    isSoftwareDatasetModalOpen,
    editingSoftwareAndDataset,
    openAddSoftwareDatasetModal,
    openEditSoftwareDatasetModal,
    closeSoftwareDatasetModal,

    // 专利
    isPatentModalOpen,
    editingPatent,
    openAddPatentModal,
    openEditPatentModal,
    closePatentModal,
  };
};
