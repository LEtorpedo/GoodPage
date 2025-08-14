"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { MemberProfileImage } from "@/components/members/MemberProfileImage";
import { useAvatarUpload } from "../hooks";
import type { AvatarUploadProps } from "../types";

/**
 * 头像上传组件
 */
export function AvatarUpload({
  memberId,
  currentAvatarUrl,
  memberName,
}: AvatarUploadProps) {
  const {
    avatarState,
    handleAvatarChange,
    handleUploadAvatar,
  } = useAvatarUpload(currentAvatarUrl, memberId);

  return (
    <Card className="overflow-hidden border-green-500/50 dark:border-green-400/40 mb-6 rounded-xl">
      <CardHeader className="flex flex-row items-center gap-6 px-3 py-4">
        {/* 头像显示区 */}
        <div className="flex flex-col items-center justify-center">
          <MemberProfileImage
            src={avatarState.avatarPreview || avatarState.avatarUrl}
            alt={memberName + " avatar"}
            width={96}
            height={96}
            className="rounded-full border-2 border-green-400 shadow-md mb-2"
          />
          <span className="text-xs text-green-400">Avatar Preview</span>
        </div>
        
        {/* 上传控件与按钮 */}
        <div className="flex flex-col gap-2 flex-1">
          <input
            type="file"
            accept="image/*"
            id="avatar-upload-input"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={avatarState.isUploading}
          />
          <label htmlFor="avatar-upload-input">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={avatarState.isUploading}
              className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900"
            >
              <span>Select New Avatar</span>
            </Button>
          </label>
          
          {avatarState.avatarPreview && (
            <Button
              variant="default"
              size="sm"
              onClick={handleUploadAvatar}
              disabled={avatarState.isUploading}
              className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
            >
              {avatarState.isUploading ? (
                <span>
                  <svg
                    className="animate-spin inline-block mr-2 h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Upload and Save Avatar"
              )}
            </Button>
          )}
          
          <span className="text-xs text-green-500">
            Supported: JPG/PNG/GIF/WEBP, Max 5MB
          </span>
        </div>
      </CardHeader>
    </Card>
  );
}
