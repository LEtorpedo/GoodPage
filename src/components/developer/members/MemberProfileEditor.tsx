"use client";

import React from "react";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

// 解耦后的模块导入
import {
  // 类型
  type MemberProfileEditorProps,
  type EditableProjectInfo,
  // 组件
  AvatarUpload,
  BasicInfoSection,
  DetailedProfileSection,
  LinksSection,
  EducationSection,
  AwardsSection,
  FeaturedPublicationsSection,
  ProjectsSection,
  PresentationsSection,
  SoftwareDatasetSection,
  AcademicServicesSection,
  PatentsSection,
  // Hooks
  useMemberProfileState,
  useModalStates,
  useDragAndDrop,
  // 工具函数
  parseZodError,
  generateFeaturedUpdates,
} from "./profile-editor";

// 原有的模态框组件导入
import { EducationFormModal } from "./EducationFormModal";
import { AwardFormModal } from "./AwardFormModal";
import { TeachingFormModal } from "./TeachingFormModal";
import { ProjectFormModal } from "./ProjectFormModal";
import { AcademicServiceFormModal } from "./AcademicServiceFormModal";
import { PresentationFormModal } from "./PresentationFormModal";
import { SoftwareDatasetFormModal } from "./SoftwareDatasetFormModal";
import { PatentFormModal } from "./PatentFormModal";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { UsernameChangeForm } from "./UsernameChangeForm";

// 服务端Actions导入
import {
  addEducationRecord,
  updateEducationRecord,
  deleteEducationRecord,
  type EducationFormData,
} from "@/app/actions/educationActions";
import {
  addAwardRecord,
  updateAwardRecord,
  deleteAwardRecord,
  type AwardFormData,
} from "@/app/actions/awardActions";
import {
  addTeachingRecord,
  updateTeachingRecord,
  deleteTeachingRecord,
  type TeachingFormData,
} from "@/app/actions/teachingActions";
import {
  addProjectRecord,
  updateProjectRecord,
  deleteProjectRecord,
  type ProjectFormData,
} from "@/app/actions/projectActions";
import {
  addAcademicServiceRecord,
  updateAcademicServiceRecord,
  deleteAcademicServiceRecord,
  type AcademicServiceFormData,
} from "@/app/actions/academicServiceActions";
import {
  addPresentationRecord,
  updatePresentationRecord,
  deletePresentationRecord,
  type PresentationFormData,
} from "@/app/actions/presentationActions";
import {
  addSoftwareDatasetRecord,
  updateSoftwareDatasetRecord,
  deleteSoftwareDatasetRecord,
  type SoftwareDatasetFormData,
} from "@/app/actions/softwareDatasetActions";
import {
  addPatentRecord,
  updatePatentRecord,
  deletePatentRecord,
  type PatentFormData,
} from "@/app/actions/patentActions";
import { updateFeaturedPublications } from "@/app/actions/publicationActions";

/**
 * 重构后的成员资料编辑器主组件
 * 使用模块化架构，将复杂的逻辑拆分为多个子组件和Hooks
 */
export default function MemberProfileEditor({
  initialData,
}: MemberProfileEditorProps) {
  // 使用自定义Hook管理状态
  const {
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
  } = useMemberProfileState(initialData);

  // 使用模态框状态管理Hook
  const {
    // 教育历史模态框
    isEducationModalOpen,
    editingEducationData,
    openAddEducationModal,
    openEditEducationModal,
    closeEducationModal,
    
    // 获奖记录模态框
    isAwardModalOpen,
    editingAward,
    openAddAwardModal,
    openEditAwardModal,
    closeAwardModal,
    
    // 教学记录模态框
    isTeachingModalOpen,
    editingTeaching,
    openAddTeachingModal,
    openEditTeachingModal,
    closeTeachingModal,
    
    // 项目模态框
    isProjectModalOpen,
    editingProjectData,
    openAddProjectModal,
    openEditProjectModal,
    closeProjectModal,
    
    // 学术服务模态框
    isAcademicServiceModalOpen,
    editingAcademicService,
    openAddServiceModal,
    openEditServiceModal,
    closeServiceModal,
    
    // 演示报告模态框
    isPresentationModalOpen,
    editingPresentation,
    openAddPresentationModal,
    openEditPresentationModal,
    closePresentationModal,
    
    // 软件和数据集模态框
    isSoftwareDatasetModalOpen,
    editingSoftwareAndDataset,
    openAddSoftwareDatasetModal,
    openEditSoftwareDatasetModal,
    closeSoftwareDatasetModal,

    // 专利模态框
    isPatentModalOpen,
    editingPatent,
    openAddPatentModal,
    openEditPatentModal,
    closePatentModal,
  } = useModalStates();

  // 使用拖拽Hook
  const { handlePublicationDragEnd } = useDragAndDrop();

  // 教育历史CRUD处理函数
  const handleEducationSubmit = async (
    data: EducationFormData,
    educationId?: number
  ): Promise<void> => {
    const actionPromise = educationId
      ? updateEducationRecord(educationId, data)
      : addEducationRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: "Saving education record...",
      success: (result) => {
        if (result.success && result.education) {
          if (educationId) {
            setEducationHistory((prev) =>
              prev.map((edu) =>
                edu.id === educationId ? result.education! : edu
              )
            );
          } else {
            setEducationHistory((prev) => [...prev, result.education!]);
          }
          closeEducationModal();
          return `Education record ${educationId ? "updated" : "added"} successfully!`;
        } else {
          throw new Error(result.error || "Failed to save education record.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });
  };

  const handleDeleteEducation = async (educationId: number) => {
    const actionPromise = deleteEducationRecord(educationId);

    toast.promise(actionPromise, {
      loading: "Deleting education record...",
      success: (result) => {
        if (result.success) {
          setEducationHistory((prev) =>
            prev.filter((edu) => edu.id !== educationId)
          );
          return "Education record deleted successfully!";
        } else {
          throw new Error(result.error || "Failed to delete education record.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });
  };

  // 获奖记录CRUD处理函数
  const handleAwardSubmit = async (
    data: AwardFormData,
    awardId?: number
  ): Promise<void> => {
    const actionPromise = awardId
      ? updateAwardRecord(awardId, data)
      : addAwardRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: "Saving award record...",
      success: (result) => {
        if (result.success && result.award) {
          if (awardId) {
            setAwardsList((prev) =>
              prev.map((award) =>
                award.id === awardId ? result.award! : award
              )
            );
          } else {
            setAwardsList((prev) => [...prev, result.award!]);
          }
          closeAwardModal();
          return `Award record ${awardId ? "updated" : "added"} successfully!`;
        } else {
          throw new Error(result.error || "Failed to save award record.");
        }
      },
      error: (err: any) => parseZodError(err.message),
    });
  };

  const handleDeleteAward = async (awardId: number) => {
    const actionPromise = deleteAwardRecord(awardId);

    toast.promise(actionPromise, {
      loading: "Deleting award record...",
      success: (result) => {
        if (result.success) {
          setAwardsList((prev) => prev.filter((award) => award.id !== awardId));
          return "Award record deleted successfully!";
        } else {
          throw new Error(result.error || "Failed to delete award record.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });
  };

  // 项目CRUD处理函数
  const handleProjectSubmit = async (
    data: ProjectFormData,
    projectId?: number
  ): Promise<void> => {
    const actionPromise = projectId
      ? updateProjectRecord(projectId, data)
      : addProjectRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: "Saving project record...",
      success: (result) => {
        if (result.success && result.project) {
          if (projectId) {
            setProjectsList((prev) =>
              prev.map((pm) =>
                pm.project_id === projectId
                  ? {
                      ...pm,
                      project: { ...pm.project, ...result.project },
                      role: data.role ?? pm.role,
                    }
                  : pm
              )
            );
          } else {
            const newProject: EditableProjectInfo = {
              project_id: result.project.id,
              member_id: initialData.id,
              role: data.role ?? null,
              project: result.project,
            };
            setProjectsList((prev) => [...prev, newProject]);
          }
          closeProjectModal();
          return `Project record ${projectId ? "updated" : "added"} successfully!`;
        } else {
          throw new Error(result.error || "Failed to save project record.");
        }
      },
      error: (err: any) => parseZodError(err.message),
    });
  };

  const handleDeleteProject = async (projectId: number, memberId: string) => {
    const actionPromise = deleteProjectRecord(projectId, memberId);

    toast.promise(actionPromise, {
      loading: "Deleting project record...",
      success: (result) => {
        if (result.success) {
          setProjectsList((prev) =>
            prev.filter(
              (pm) =>
                !(pm.project_id === projectId && pm.member_id === memberId)
            )
          );
          return "Project record deleted successfully!";
        } else {
          throw new Error(result.error || "Failed to delete project record.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });
  };

  // 演示报告CRUD处理函数
  const handlePresentationSubmit = async (
    data: PresentationFormData,
    presentationId?: number
  ): Promise<void> => {
    const actionPromise = presentationId
      ? updatePresentationRecord(presentationId, data)
      : addPresentationRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: "Saving presentation record...",
      success: (result) => {
        if (result.success && result.presentation) {
          if (presentationId) {
            setPresentationList((prev) =>
              prev.map((pres) =>
                pres.id === presentationId ? result.presentation! : pres
              )
            );
          } else {
            setPresentationList((prev) => [...prev, result.presentation!]);
          }
          closePresentationModal();
          return `Presentation record ${presentationId ? "updated" : "added"} successfully!`;
        } else {
          throw new Error(result.error || "Failed to save presentation record.");
        }
      },
      error: (err: any) => parseZodError(err.message),
    });
  };

  const handleDeletePresentation = async (presentationId: number) => {
    const actionPromise = deletePresentationRecord(presentationId);

    toast.promise(actionPromise, {
      loading: "Deleting presentation record...",
      success: (result) => {
        if (result.success) {
          setPresentationList((prev) => 
            prev.filter((pres) => pres.id !== presentationId)
          );
          return "Presentation record deleted successfully!";
        } else {
          throw new Error(result.error || "Failed to delete presentation record.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });
  };

  // 软件和数据集CRUD处理函数
  const handleSoftwareDatasetSubmit = async (
    data: SoftwareDatasetFormData,
    recordId?: number
  ): Promise<void> => {
    const actionPromise = recordId
      ? updateSoftwareDatasetRecord(recordId, data)
      : addSoftwareDatasetRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: "Saving software/dataset record...",
      success: (result) => {
        if (result.success && result.softwareDataset) {
          if (recordId) {
            setSoftwareAndDatasetsList((prev) =>
              prev.map((record) =>
                record.id === recordId ? result.softwareDataset! : record
              )
            );
          } else {
            setSoftwareAndDatasetsList((prev) => [...prev, result.softwareDataset!]);
          }
          closeSoftwareDatasetModal();
          return `Software/Dataset record ${recordId ? "updated" : "added"} successfully!`;
        } else {
          throw new Error(result.error || "Failed to save software/dataset record.");
        }
      },
      error: (err: any) => parseZodError(err.message),
    });
  };

  const handleDeleteSoftwareDataset = async (recordId: number) => {
    const actionPromise = deleteSoftwareDatasetRecord(recordId);

    toast.promise(actionPromise, {
      loading: "Deleting software/dataset record...",
      success: (result) => {
        if (result.success) {
          setSoftwareAndDatasetsList((prev) =>
            prev.filter((record) => record.id !== recordId)
          );
          return "Software/Dataset record deleted successfully!";
        } else {
          throw new Error(result.error || "Failed to delete software/dataset record.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });
  };

  // 学术服务CRUD处理函数
  const handleAcademicServiceSubmit = async (
    data: AcademicServiceFormData,
    serviceId?: number
  ): Promise<void> => {
    const actionPromise = serviceId
      ? updateAcademicServiceRecord(serviceId, data)
      : addAcademicServiceRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: "Saving academic service record...",
      success: (result) => {
        if (result.success && result.academicService) {
          if (serviceId) {
            setAcademicServicesList((prev) =>
              prev.map((service) =>
                service.id === serviceId ? result.academicService! : service
              )
            );
          } else {
            setAcademicServicesList((prev) => [...prev, result.academicService!]);
          }
          closeServiceModal();
          return `Academic service record ${serviceId ? "updated" : "added"} successfully!`;
        } else {
          throw new Error(result.error || "Failed to save academic service record.");
        }
      },
      error: (err: any) => parseZodError(err.message),
    });
  };

  const handleDeleteAcademicService = async (serviceId: number) => {
    const actionPromise = deleteAcademicServiceRecord(serviceId);

    toast.promise(actionPromise, {
      loading: "Deleting academic service record...",
      success: (result) => {
        if (result.success) {
          setAcademicServicesList((prev) =>
            prev.filter((service) => service.id !== serviceId)
          );
          return "Academic service record deleted successfully!";
        } else {
          throw new Error(result.error || "Failed to delete academic service record.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });
  };

  // 专利CRUD处理函数
  const handlePatentSubmit = async (
    data: PatentFormData,
    patentId?: number
  ): Promise<void> => {
    const actionPromise = patentId
      ? updatePatentRecord(patentId, data)
      : addPatentRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: "Saving patent record...",
      success: (result) => {
        if (result.success && result.patent) {
          if (patentId) {
            setPatentsList((prev) =>
              prev.map((patent) =>
                patent.id === patentId ? result.patent! : patent
              )
            );
          } else {
            setPatentsList((prev) => [...prev, result.patent!]);
          }
          closePatentModal();
          return `Patent record ${patentId ? "updated" : "added"} successfully!`;
        } else {
          throw new Error(result.error || "Failed to save patent record.");
        }
      },
      error: (err: any) => parseZodError(err.message),
    });
  };

  const handleDeletePatent = async (patentId: number) => {
    const actionPromise = deletePatentRecord(patentId);

    toast.promise(actionPromise, {
      loading: "Deleting patent record...",
      success: (result) => {
        if (result.success) {
          setPatentsList((prev) =>
            prev.filter((patent) => patent.id !== patentId)
          );
          return "Patent record deleted successfully!";
        } else {
          throw new Error(result.error || "Failed to delete patent record.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });
  };

  // 特色发表论文处理函数
  const handleSaveFeaturedPublications = async () => {
    setIsSavingFeatured(true);
    const featuredUpdates = generateFeaturedUpdates(editablePublications);

    const actionPromise = updateFeaturedPublications(
      initialData.id,
      featuredUpdates
    );

    toast.promise(actionPromise, {
      loading: "Saving featured publications list...",
      success: (result) => {
        if (result.success) {
          return "Featured publications updated successfully!";
        } else {
          throw new Error(result.error || "Failed to update featured publications.");
        }
      },
      error: (err: any) => `Error: ${err.message || "An unknown error occurred"}`,
    });

    try {
      await actionPromise;
    } catch (e) {
      // 错误已由toast处理
    } finally {
      setIsSavingFeatured(false);
    }
  };

  const handleToggleFeatured = (publicationId: number) => {
    setEditablePublications((currentPubs) =>
      currentPubs.map((pub) =>
        pub.id === publicationId ? { ...pub, isFeatured: !pub.isFeatured } : pub
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEditablePublications((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id.toString() === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.id.toString() === over.id
        );

        if (oldIndex === -1 || newIndex === -1) {
          console.error("Could not find dragged item index in state.");
          return items;
        }

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 头像上传组件 */}
      <AvatarUpload
        memberId={initialData.id}
        currentAvatarUrl={initialData.avatar_url || "/avatars/placeholder.png"}
        memberName={initialData.name_en || "Member"}
      />

      {/* 基本信息章节 */}
      <BasicInfoSection
        initialData={initialData}
        isOpen={openSections.basicInfo}
        onToggle={() => toggleSection("basicInfo")}
      />

      {/* 密码修改章节 */}
      <PasswordChangeForm
        memberId={initialData.id}
        isOpen={openSections.passwordChange}
        onToggle={() => toggleSection("passwordChange")}
      />

      {/* 用户名修改章节 */}
      <UsernameChangeForm
        memberId={initialData.id}
        currentUsername={initialData.username}
        isOpen={openSections.usernameChange}
        onToggle={() => toggleSection("usernameChange")}
      />

      {/* 详细资料章节 */}
      <DetailedProfileSection
        initialData={initialData}
        isOpen={openSections.detailedProfile}
        onToggle={() => toggleSection("detailedProfile")}
      />

      {/* 链接信息章节 */}
      <LinksSection
        initialData={initialData}
        isOpen={openSections.links}
        onToggle={() => toggleSection("links")}
      />

      {/* 教育历史章节 */}
      <EducationSection
        educationHistory={educationHistory}
        isOpen={openSections.education}
        onToggle={() => toggleSection("education")}
        onAdd={openAddEducationModal}
        onEdit={openEditEducationModal}
        onDelete={handleDeleteEducation}
      />

      {/* 获奖记录章节 */}
      <AwardsSection
        awardsList={awardsList}
        isOpen={openSections.awards}
        onToggle={() => toggleSection("awards")}
        onAdd={openAddAwardModal}
        onEdit={openEditAwardModal}
        onDelete={handleDeleteAward}
      />

      {/* 特色发表论文章节 */}
      <FeaturedPublicationsSection
        publications={editablePublications}
        isOpen={openSections.featuredPublications}
        isSaving={isSavingFeatured}
        onToggle={() => toggleSection("featuredPublications")}
        onToggleFeatured={handleToggleFeatured}
        onSave={handleSaveFeaturedPublications}
        onDragEnd={handleDragEnd}
      />

      {/* 项目章节 */}
      <ProjectsSection
        projectsList={projectsList}
        isOpen={openSections.projects}
        onToggle={() => toggleSection("projects")}
        onAdd={openAddProjectModal}
        onEdit={(project) => {
          openEditProjectModal({
            ...project.project,
            memberRole: project.role ?? undefined,
          });
        }}
        onDelete={handleDeleteProject}
      />

      {/* 演示报告章节 */}
      <PresentationsSection
        presentationList={presentationList}
        isOpen={openSections.presentations}
        onToggle={() => toggleSection("presentations")}
        onAdd={openAddPresentationModal}
        onEdit={openEditPresentationModal}
        onDelete={handleDeletePresentation}
      />

      {/* 软件和数据集章节 */}
      <SoftwareDatasetSection
        softwareAndDatasetsList={softwareAndDatasetsList}
        isOpen={openSections.softwareDatasets}
        onToggle={() => toggleSection("softwareDatasets")}
        onAdd={openAddSoftwareDatasetModal}
        onEdit={openEditSoftwareDatasetModal}
        onDelete={handleDeleteSoftwareDataset}
      />

      {/* 专利章节 */}
      <PatentsSection
        patentsList={patentsList}
        isOpen={openSections.patents}
        onToggle={() => toggleSection("patents")}
        onAdd={openAddPatentModal}
        onEdit={openEditPatentModal}
        onDelete={handleDeletePatent}
      />

      {/* 学术服务章节 */}
      <AcademicServicesSection
        academicServicesList={academicServicesList}
        isOpen={openSections.academicServices}
        onToggle={() => toggleSection("academicServices")}
        onAdd={openAddServiceModal}
        onEdit={openEditServiceModal}
        onDelete={handleDeleteAcademicService}
      />

      {/* 所有模态框组件 */}
      <EducationFormModal
        isOpen={isEducationModalOpen}
        onClose={closeEducationModal}
        onSubmit={handleEducationSubmit}
        initialData={editingEducationData}
        memberId={initialData.id}
      />

      <AwardFormModal
        isOpen={isAwardModalOpen}
        onClose={closeAwardModal}
        onSubmit={handleAwardSubmit}
        initialData={editingAward}
        memberId={initialData.id}
      />

      <TeachingFormModal
        isOpen={isTeachingModalOpen}
        onClose={closeTeachingModal}
        onSubmit={async (data, teachingId) => {
          const actionPromise = teachingId
            ? updateTeachingRecord(teachingId, data)
            : addTeachingRecord(initialData.id, data);

          toast.promise(actionPromise, {
            loading: "Saving teaching record...",
            success: (result) => {
              if (result.success && result.teaching) {
                if (teachingId) {
                  setTeachingList((prev) =>
                    prev.map((teaching) =>
                      teaching.id === teachingId ? result.teaching! : teaching
                    )
                  );
                } else {
                  setTeachingList((prev) => [...prev, result.teaching!]);
                }
                closeTeachingModal();
                return `Teaching record ${teachingId ? "updated" : "added"} successfully!`;
              } else {
                throw new Error(result.error || "Failed to save teaching record.");
              }
            },
            error: (err: any) => parseZodError(err.message),
          });
        }}
        initialData={editingTeaching}
        memberId={initialData.id}
      />

      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={closeProjectModal}
        onSubmit={handleProjectSubmit}
        initialData={editingProjectData}
        memberId={initialData.id}
      />

      <AcademicServiceFormModal
        isOpen={isAcademicServiceModalOpen}
        onClose={closeServiceModal}
        onSubmit={handleAcademicServiceSubmit}
        initialData={editingAcademicService}
        memberId={initialData.id}
      />

      <PresentationFormModal
        isOpen={isPresentationModalOpen}
        onClose={closePresentationModal}
        onSubmit={handlePresentationSubmit}
        initialData={editingPresentation}
        memberId={initialData.id}
      />

      <SoftwareDatasetFormModal
        isOpen={isSoftwareDatasetModalOpen}
        onClose={closeSoftwareDatasetModal}
        onSubmit={handleSoftwareDatasetSubmit}
        initialData={editingSoftwareAndDataset}
        memberId={initialData.id}
      />

      <PatentFormModal
        isOpen={isPatentModalOpen}
        onClose={closePatentModal}
        onSubmit={handlePatentSubmit}
        initialData={editingPatent}
        memberId={initialData.id}
      />
    </div>
  );
}
