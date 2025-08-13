"use client";

import React, { useState, useEffect } from "react";
import { themeColors } from "@/styles/theme";
import { Plus, Trash2, Save, Loader2, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ProfessorsConfigProps {
  onConfigUpdate?: () => void;
}

/**
 * 教授配置管理组件
 * 允许用户配置要爬取的教授列表
 */
const ProfessorsConfig: React.FC<ProfessorsConfigProps> = ({
  onConfigUpdate,
}) => {
  const [professors, setProfessors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newProfessor, setNewProfessor] = useState("");

  useEffect(() => {
    loadProfessorsConfig();
  }, []);

  /**
   * 加载教授配置
   */
  const loadProfessorsConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/publications/dblp-professors");
      const result = await response.json();

      if (response.ok && result.success) {
        setProfessors(result.data.professors || []);
      } else {
        throw new Error(result.error || "Failed to load config");
      }
    } catch (error) {
      console.error("Load config error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to load professors config: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 保存教授配置
   */
  const saveProfessorsConfig = async () => {
    if (professors.length === 0) {
      toast.error("At least one professor is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/publications/dblp-professors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ professors }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Professors configuration saved successfully!");
        onConfigUpdate?.();
      } else {
        throw new Error(result.error || "Save failed");
      }
    } catch (error) {
      console.error("Save config error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save config: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 添加教授
   */
  const addProfessor = () => {
    if (!newProfessor.trim()) {
      toast.error("Please enter a professor name");
      return;
    }

    if (professors.includes(newProfessor.trim())) {
      toast.error("Professor already exists");
      return;
    }

    setProfessors([...professors, newProfessor.trim()]);
    setNewProfessor("");
  };

  /**
   * 删除教授
   */
  const removeProfessor = (index: number) => {
    setProfessors(professors.filter((_, i) => i !== index));
  };

  /**
   * 处理回车键添加
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addProfessor();
    }
  };

  return (
    <div
      className={`p-6 rounded-xl ${themeColors.devCardBg} border border-gray-600`}
    >
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-400" />
        <h3 className={`text-lg font-medium ${themeColors.devText}`}>
          Professors Configuration
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className={`ml-2 ${themeColors.devDescText}`}>
            Loading configuration...
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 添加新教授 */}
          <div className="flex gap-3">
            <input
              type="text"
              value={newProfessor}
              onChange={(e) => setNewProfessor(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter professor name (e.g., 'Jiahui Hu' or 'Zichen Xu 0001')"
              className={`flex-1 px-4 py-3 border border-gray-600 rounded-lg ${themeColors.devCardBg} ${themeColors.devText} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            />
            <button
              onClick={addProfessor}
              className="inline-flex items-center px-4 py-3 border border-blue-600 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </button>
          </div>

          {/* 教授列表 */}
          <div className="space-y-3">
            {professors.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className={`${themeColors.devDescText} text-lg mb-1`}>
                  No professors configured
                </p>
                <p className={`text-sm ${themeColors.devDescText}`}>
                  Add at least one professor to run the crawler
                </p>
              </div>
            ) : (
              professors.map((professor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                >
                  <span className={`${themeColors.devText} font-mono text-sm`}>
                    {professor}
                  </span>
                  <button
                    onClick={() => removeProfessor(index)}
                    className="inline-flex items-center px-3 py-2 border border-red-600 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end pt-6 border-t border-gray-600">
            <button
              onClick={saveProfessorsConfig}
              disabled={isSaving || professors.length === 0}
              className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isSaving || professors.length === 0
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              } transition-colors disabled:opacity-50`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </button>
          </div>

          {/* 说明 */}
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
            <p className="text-blue-400 text-sm font-medium mb-2">
              💡 <strong>Format Examples:</strong>
            </p>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>
                •{" "}
                <code className="bg-gray-800 px-2 py-1 rounded">Jiahui Hu</code>{" "}
                - Simple name format (but easily matched to other people)
              </li>
              <li>
                •{" "}
                <code className="bg-gray-800 px-2 py-1 rounded">
                  Zichen Xu 0001
                </code>{" "}
                - Name with DBLP identifier (preferred)
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorsConfig;
