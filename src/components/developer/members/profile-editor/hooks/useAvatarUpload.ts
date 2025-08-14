import { useState } from "react";
import { toast } from "sonner";
import { updateMemberField } from "@/app/actions/memberActions";
import { validateAvatarFile } from "../utils";
import { TOAST_MESSAGES } from "../constants";
import type { AvatarUploadState } from "../types";

/**
 * 头像上传Hook
 * @param initialAvatarUrl 初始头像URL
 * @param memberId 成员ID
 * @returns 头像上传相关状态和函数
 */
export const useAvatarUpload = (initialAvatarUrl: string, memberId: string) => {
  const [avatarState, setAvatarState] = useState<AvatarUploadState>({
    avatarUrl: initialAvatarUrl || "/avatars/placeholder.png",
    avatarFile: null,
    avatarPreview: null,
    isUploading: false,
  });

  /**
   * 处理头像文件选择
   * @param e 文件输入事件
   */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setAvatarState((prev) => ({
      ...prev,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
  };

  /**
   * 上传头像到服务器
   */
  const handleUploadAvatar = async () => {
    if (!avatarState.avatarFile) return;

    setAvatarState((prev) => ({ ...prev, isUploading: true }));

    try {
      const formData = new FormData();
      formData.append("file", avatarState.avatarFile);
      formData.append("username", memberId);

      // 调用后端API上传
      const res = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        // 上传成功后，更新avatar_url字段
        const updateRes = await updateMemberField(
          memberId,
          "avatar_url",
          data.url
        );

        if (updateRes.success) {
          setAvatarState((prev) => ({
            ...prev,
            avatarUrl: data.url,
            avatarPreview: null,
            avatarFile: null,
          }));
          toast.success(TOAST_MESSAGES.success.avatarUploaded);
        } else {
          toast.error(
            "Avatar uploaded, but failed to save avatar URL: " +
              (updateRes.error || "Unknown error")
          );
        }
      } else {
        toast.error(TOAST_MESSAGES.error.avatarUploadFailed(data.error));
      }
    } catch (err: any) {
      toast.error(TOAST_MESSAGES.error.avatarUploadFailed(err.message));
    } finally {
      setAvatarState((prev) => ({ ...prev, isUploading: false }));
    }
  };

  /**
   * 清除头像预览
   */
  const clearAvatarPreview = () => {
    if (avatarState.avatarPreview) {
      URL.revokeObjectURL(avatarState.avatarPreview);
    }
    setAvatarState((prev) => ({
      ...prev,
      avatarFile: null,
      avatarPreview: null,
    }));
  };

  return {
    avatarState,
    handleAvatarChange,
    handleUploadAvatar,
    clearAvatarPreview,
  };
};
