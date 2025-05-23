"use client";

import React from "react";
import { ArrowLeft, Image } from "lucide-react"; // Import necessary icons

// 定义 PhotoManager 组件预期的 props，主要是 onClose
interface PhotoManagerProps {
  onClose: () => void;
}

/**
 * PhotoManager 组件的占位符。
 * TODO: 实现照片上传和管理功能。
 */
const PhotoManager: React.FC<PhotoManagerProps> = ({ onClose }) => {
  return (
    <div>
      {/* 页眉，包含返回按钮 */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
          <Image size={24} /> {/* 添加图标 */}
          Manage Photos (Coming Soon)
        </h2>
      </div>

      {/* 主要内容区域 */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center text-gray-400">
        <p>Photo upload and management features will be available here.</p>
        <p className="mt-2 text-sm">(Functionality under development)</p>
      </div>
    </div>
  );
};

// 确保有默认导出，使其成为一个有效的模块
export default PhotoManager;
