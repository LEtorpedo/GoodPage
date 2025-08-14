"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  X,
  RefreshCw,
  Info,
  ExternalLink,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { themeColors } from "@/styles/theme";

interface ImportResult {
  imported: number;
  duplicatesSkipped: number;
  total: number;
  duplicateTitles: string[];
  fileName: string;
}

interface YamlFile {
  name: string;
  size: number;
  lastModified: string;
  path: string;
}

/**
 * YAML 导入管理器组件
 * 参考重置密码的逻辑，直接处理服务器上的文件
 */
const YamlImportManager: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [yamlFiles, setYamlFiles] = useState<YamlFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 加载文件列表
   */
  const loadYamlFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch("/api/publications/yaml-files");
      const result = await response.json();

      if (response.ok && result.success) {
        setYamlFiles(result.data);
      } else {
        throw new Error(result.error || "Failed to load files");
      }
    } catch (error) {
      console.error("Load files error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to load files: ${errorMessage}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  /**
   * 上传文件
   */
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/publications/yaml-files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`File "${file.name}" uploaded successfully!`);
        await loadYamlFiles(); // 重新加载文件列表
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 删除文件
   */
  const handleFileDelete = async (fileName: string) => {
    if (!confirm(`确定要删除文件 "${fileName}" 吗？此操作不可撤销！`)) {
      return;
    }

    setDeletingFiles((prev) => new Set(prev).add(fileName));
    try {
      const response = await fetch(
        `/api/publications/yaml-files/${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`File "${fileName}" deleted successfully!`);
        await loadYamlFiles(); // 重新加载文件列表
      } else {
        throw new Error(result.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Delete failed: ${errorMessage}`);
    } finally {
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // 清空 input 值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * 组件挂载时加载文件列表
   */
  useEffect(() => {
    loadYamlFiles();
  }, []);

  /**
   * 执行导入 - 参考重置密码的逻辑
   */
  const handleImport = async (fileName: string) => {
    if (!fileName) {
      toast.error("Please select a YAML file first");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // 发送到 API，类似重置密码的逻辑
      const response = await fetch("/api/publications/import-yaml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: fileName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setImportResult(result.data);
        toast.success(
          `Successfully imported ${result.data.imported} publications!`
        );

        if (result.data.duplicatesSkipped > 0) {
          toast.warning(
            `Skipped ${result.data.duplicatesSkipped} duplicate publications`
          );
        }
      } else {
        throw new Error(result.error || "Import failed");
      }
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * 重置状态
   */
  const handleReset = () => {
    setImportResult(null);
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className={`text-3xl font-bold ${themeColors.devText} mb-2`}>
          Import Publications from YAML
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Upload className="w-4 h-4" />
          <span>Upload and import publication data from YAML files</span>
        </div>
      </div>

      {/* 文件管理区域 */}
      <div
        className={`p-6 rounded-xl ${themeColors.devCardBg} border border-gray-600 bg-gradient-to-br from-blue-900/10 to-indigo-900/10`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h3 className={`text-lg font-medium ${themeColors.devText}`}>
              YAML Files Management
            </h3>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".yml,.yaml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isUploading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              } transition-colors disabled:opacity-50`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload YAML File
                </>
              )}
            </button>
            <button
              onClick={loadYamlFiles}
              disabled={isLoadingFiles}
              className={`inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg shadow-sm text-sm font-medium ${themeColors.devText} ${themeColors.devCardBg} hover:bg-gray-700 transition-colors disabled:opacity-50`}
            >
              {isLoadingFiles ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* 文件列表 */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden">
          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className={`ml-2 ${themeColors.devText}`}>
                Loading files...
              </span>
            </div>
          ) : yamlFiles.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className={`${themeColors.devDescText} mb-2 text-lg`}>
                No YAML files available
              </p>
              <p className={`text-sm ${themeColors.devDescText}`}>
                Upload a YAML file to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {yamlFiles.map((file, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className={`font-medium ${themeColors.devText}`}>
                          {file.name}
                        </p>
                        <p className={`text-sm ${themeColors.devDescText}`}>
                          {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleImport(file.name)}
                        disabled={isImporting}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white ${
                          isImporting
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        } transition-colors disabled:opacity-50`}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Import
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleFileDelete(file.name)}
                        disabled={deletingFiles.has(file.name)}
                        className={`inline-flex items-center px-3 py-2 border border-red-600 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white transition-colors ${
                          deletingFiles.has(file.name) ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {deletingFiles.has(file.name) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 导入结果区域 */}
      {importResult && (
        <div
          className={`p-6 rounded-xl ${themeColors.devCardBg} border border-green-600 bg-gradient-to-br from-green-900/20 to-emerald-900/20`}
        >
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <h3 className={`text-xl font-medium ${themeColors.devText}`}>
              Import Completed Successfully
            </h3>
            <button
              onClick={handleReset}
              className={`ml-auto inline-flex items-center px-3 py-1 border border-gray-600 rounded-lg shadow-sm text-sm font-medium ${themeColors.devText} ${themeColors.devCardBg} hover:bg-gray-700 transition-colors`}
            >
              <X className="w-4 h-4 mr-1" />
              Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-green-900/30 border border-green-600/50">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {importResult.imported}
              </div>
              <div className={`text-xs ${themeColors.devDescText} font-medium`}>
                Successfully Imported
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-900/30 border border-yellow-600/50">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {importResult.duplicatesSkipped}
              </div>
              <div className={`text-xs ${themeColors.devDescText} font-medium`}>
                Duplicates Skipped
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-900/30 border border-blue-600/50">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {importResult.total}
              </div>
              <div className={`text-xs ${themeColors.devDescText} font-medium`}>
                Total Processed
              </div>
            </div>
          </div>

          {importResult.duplicateTitles && importResult.duplicateTitles.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
              <p className={`text-sm ${themeColors.devDescText} mb-2 font-medium`}>
                Skipped duplicate publications:
              </p>
              <div className="max-h-24 overflow-y-auto">
                <ul className={`text-xs ${themeColors.devDescText} space-y-1`}>
                  {importResult.duplicateTitles.map((title, index) => (
                    <li key={index} className="truncate">
                      • {title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 Imported publications have been added to the "Pending Review" tab where you can review, edit, and publish them.
            </p>
          </div>
        </div>
      )}

      {/* 使用说明区域 */}
      <div className={`p-6 rounded-xl bg-gray-800/50 border border-gray-600`}>
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-5 h-5 text-blue-400" />
          <h4 className={`font-medium ${themeColors.devText} text-lg`}>
            Usage Instructions
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className={`font-medium ${themeColors.devText} mb-3 text-green-400`}>
              File Management:
            </h5>
            <ul className={`text-sm ${themeColors.devDescText} space-y-2`}>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Upload:</strong> Click "Upload YAML File" to add new YAML files to the system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Import:</strong> Click "Import" button for any available YAML file to import publications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Delete:</strong> Click "Delete" button to remove YAML files from the system</span>
              </li>
            </ul>
          </div>
          <div>
            <h5 className={`font-medium ${themeColors.devText} mb-3 text-orange-400`}>
              File Requirements:
            </h5>
            <ul className={`text-sm ${themeColors.devDescText} space-y-2`}>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Only .yml and .yaml files are accepted (max 10MB)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>The file should have a 'works' array with publication entries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Files are stored in the /data/yaml directory on the server</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
            <ExternalLink className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className={`text-sm ${themeColors.devText} font-medium mb-1`}>
                YAML Source Information:
              </p>
              <p className={`text-xs ${themeColors.devDescText} mb-2`}>
                YAML source files come from{" "}
                <a
                  href="https://github.com/TheAlbertDev/get-orcid-publications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  get-orcid-publications
                </a>
              </p>
              <p className={`text-xs ${themeColors.devDescText}`}>
                To update the YAML file, please fork the repository and use the workflow to generate new data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YamlImportManager;
