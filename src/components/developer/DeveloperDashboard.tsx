"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Server,
  Edit,
  Wrench,
  Key,
  BookUp,
  FileText as LogIcon,
  Database,
  ArrowLeft,
  LogOut,
  Upload,
  Users,
} from "lucide-react";
import { themeColors } from "@/styles/theme";
import ToolCard from "./ToolCard";
import HomepageContentEditor from "./homepage/HomepageContentEditor";
import CodeServerManager from "./codeserver/CodeServerManager";
import MainPublicationContainer from "./publication/containers/MainPublicationContainer";
import { PhotoManager as PhotoManager } from "./photo";
// Assuming MemberManager is correctly located here for now
// (You might want to move it to ./members/MemberManager later for consistency)
import MemberManager from "./user/MemberManager";
import UserManager from "./user/UserManager";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";

// Define the structure for a tool configuration object
interface ToolConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  requiredPermission?: string;
  component?: React.ComponentType<any>;
  externalLink?: string;
  buttonText: string;
}

// Configuration array for available tools
const availableTools: ToolConfig[] = [
  {
    id: "news",
    title: "Manage Homepage",
    description:
      "Edit news, interests, projects, teaching, and section settings.",
    icon: Edit,
    requiredPermission: "manage_news",
    buttonText: "Manage Homepage",
  },
  {
    id: "publication",
    title: "Manage Publications",
    description: "Review pending, manually manage publication entries.",
    icon: BookUp,
    requiredPermission: "manage_publications",
    component: MainPublicationContainer,
    buttonText: "Manage Publications",
  },
  {
    id: "member",
    title: "Manage Members",
    description: "View and manage lab member information.", // Updated description
    icon: Users,
    requiredPermission: "manage_members", // 添加权限要求
    component: MemberManager, // The component rendered is the list manager
    buttonText: "Manage Members",
  },
  {
    id: "photo",
    title: "Manage Photo Gallery",
    description: "Upload photos and manage gallery settings.",
    icon: Upload,
    requiredPermission: "manage_photos",
    component: PhotoManager,
    buttonText: "Manage Photos",
  },
  {
    id: "codeserver",
    title: "Manage Code Servers",
    description: "View, add, or remove Code Server instances.",
    icon: Server,
    requiredPermission: "manage_codeservers",
    component: CodeServerManager,
    buttonText: "Manage Servers",
  },
  {
    id: "db",
    title: "Database Management",
    description: "Open Prisma Studio to directly manage the database.",
    icon: Database,
    externalLink: "http://localhost:5555",
    requiredPermission: "manage_settings",
    buttonText: "Open Prisma Studio",
  },
  // Remove the System Logs tool configuration
  // {
  //   id: "logs",
  //   title: "System Logs",
  //   description: "View application and server logs.",
  //   icon: LogIcon,
  //   requiredPermission: "view_logs",
  //   // component: SystemLogViewer, // TODO
  //   buttonText: "View Logs (TBD)",
  // },
];

interface DeveloperDashboardProps {
  onLogout: () => void;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  onLogout,
}) => {
  const { isFullAccess } = useAuthStore();
  const { hasPermission } = usePermissions();

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isHomepageEditorOpen, setIsHomepageEditorOpen] = useState(false); // State for modal
  // --- REMOVED editingMemberId state ---

  // Handler to select a tool
  const handleToolSelect = (toolId: string) => {
    if (toolId === "news") {
      // Open Homepage Editor as a modal
      setIsHomepageEditorOpen(true);
    } else {
      // Set active tool for other components
      setActiveTool(toolId);
    }
  };

  // Handler to go back to the tool grid
  const handleGoBack = () => {
    setActiveTool(null);
  };

  // --- REMOVED handleEditMemberRequest ---
  // --- REMOVED handleCloseMemberEditor ---

  // Find the configuration for the currently active tool
  const currentToolConfig = activeTool
    ? availableTools.find((tool) => tool.id === activeTool)
    : null;

  // --- Render Active Tool Logic (Simplified) ---
  const renderActiveTool = () => {
    if (!currentToolConfig) return null;

    // Render the component specified in the tool config
    if (currentToolConfig.component) {
      const ToolComponent = currentToolConfig.component;
      // Pass onClose handler to the tool component
      return <ToolComponent onClose={handleGoBack} />;
    }

    // Handle cases where the tool might not have a component (e.g., logs TBD)
    if (activeTool !== "db") {
      // Exclude Prisma Studio link case
      return (
        <div>
          <h3
            className={`text-lg font-semibold mb-4 ${themeColors.devTitleText ?? "text-green-400"}`}
          >
            Tool Not Implemented
          </h3>
          <p className={`${themeColors.devDescText ?? "text-gray-300"}`}>
            The tool '{currentToolConfig.title}' is not yet available.
          </p>
        </div>
      );
    }

    return null; // Should not be reached for valid tools with components or 'db'
  };

  return (
    <div className="container mx-auto px-4 py-12 font-mono">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative"
      >
        <h1
          className={`text-3xl sm:text-4xl font-bold ${themeColors.devTitleText ?? "text-green-400"} mb-2 flex items-center justify-center gap-3`}
        >
          <Unlock size={36} /> Developer Toolbox{" "}
          {isFullAccess ? "Activated" : "Limited Access"}
        </h1>
        <p
          className={`${themeColors.devDescText ?? "text-gray-400"} text-sm sm:text-base`}
        >
          {isFullAccess
            ? "Core systems unlocked. Welcome, Administrator! Remember: sudo responsibly."
            : "Welcome! Available tools depend on your access level."}
        </p>
        <button
          onClick={onLogout}
          className={`absolute top-0 right-0 mt-1 mr-1 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium ${themeColors.textWhite ?? "text-white"} bg-red-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-opacity`}
          title="Logout"
        >
          <LogOut size={14} className="mr-1" /> Logout
        </button>
      </motion.div>

      {/* Conditional Rendering: Tool Cards Grid OR Active Tool View */}
      {activeTool === null ? (
        // --- Tool Cards Grid ---
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {/* Render ALL available tools, disabling based on permission */}
          {availableTools.map((tool) => {
            const canAccessTool = hasPermission(tool.requiredPermission);
            const isDisabled = !canAccessTool;

            return (
              <ToolCard
                key={tool.id}
                title={tool.title}
                description={tool.description}
                buttonText={tool.buttonText}
                icon={<tool.icon size={16} className="mr-2" />}
                onButtonClick={
                  isDisabled ? undefined : () => handleToolSelect(tool.id)
                }
                externalLink={tool.externalLink}
                disabled={isDisabled}
              />
            );
          })}
        </motion.div>
      ) : (
        // --- Active Tool View ---
        <motion.div
          // --- Use only activeTool for key ---
          key={activeTool}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`p-4 sm:p-6 rounded-lg border ${themeColors.devBorder ?? "border-gray-700"} ${themeColors.devCardBg ?? "bg-gray-800"} shadow-md`}
        >
          {/* --- Always render Back button in active view --- */}
          <button
            onClick={handleGoBack}
            className={`mb-4 sm:mb-6 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium ${themeColors.devDescText ?? "text-gray-300"} hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors`}
          >
            <ArrowLeft size={16} className="mr-1 sm:mr-2" /> Back to Tools
          </button>

          {/* Render the active tool using the simplified logic */}
          {renderActiveTool()}
        </motion.div>
      )}

      {/* --- Homepage Editor Modal --- */}
      <AnimatePresence>
        {isHomepageEditorOpen && (
          <HomepageContentEditor
            onClose={() => setIsHomepageEditorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeveloperDashboard;
