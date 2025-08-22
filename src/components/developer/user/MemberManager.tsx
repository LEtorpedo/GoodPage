"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Loader2,
  Edit,
  UserPlus,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { AddMemberForm } from "./AddMemberForm";
import { SortableMemberItem } from "./SortableMemberItem";
import { useAuthStore } from "@/store/authStore";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { Toaster } from "sonner";

// Placeholder for Member type - ideally import from a shared types file
interface Member {
  id: string;
  name_en: string;
  name_zh?: string | null;
  status: string;
  avatar_url?: string | null;
  username?: string | null; // Ensure username is included
  display_order?: number; // 新增：用于教授排序
  enrollment_year?: number | null; // 入学年份
  // Add other relevant fields if needed for display
}

interface MemberManagerProps {
  onClose: () => void;
}

const MemberManager: React.FC<MemberManagerProps> = ({ onClose }) => {
  const { isFullAccess, username: loggedInUsername } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/members?includeUsername=true"); // Example: added query param if needed
      if (!res.ok) {
        let errorMsg = `Failed to fetch members (Status: ${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData && errorData.error && errorData.error.message) {
            errorMsg = errorData.error.message;
          } else if (errorData && errorData.error) {
            errorMsg = errorData.error; // Handle simple string errors too
          }
        } catch (e) {
          /* Ignore parsing error */
        }
        throw new Error(errorMsg);
      }
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        let fetchedMembers = result.data as Member[];

        if (!isFullAccess && loggedInUsername) {
          fetchedMembers = fetchedMembers.filter(
            (member) => member.username === loggedInUsername
          );
          console.log(
            `User role detected. Filtered members down to user: ${loggedInUsername}`
          );
        }

        // 按状态分组并排序，保持与展示页面一致的逻辑
        const groupedMembers: Record<string, Member[]> = {};

        // 先分组
        fetchedMembers.forEach((member) => {
          const status = member.status || "OTHER";
          if (!groupedMembers[status]) groupedMembers[status] = [];
          groupedMembers[status].push(member);
        });

        // 对每个分组进行排序 - 所有成员都按 display_order 排序
        Object.keys(groupedMembers).forEach((status) => {
          groupedMembers[status].sort((a, b) => {
            const orderA = a.display_order ?? 0;
            const orderB = b.display_order ?? 0;
            if (orderA !== orderB) {
              return orderA - orderB; // 首先按 display_order 排序
            }
            // 如果 display_order 相同，则按年份和姓名排序作为备用
            const yearA = a.enrollment_year ?? Infinity;
            const yearB = b.enrollment_year ?? Infinity;
            if (yearA !== yearB) {
              return yearA - yearB;
            }
            return (a.name_en || a.name_zh || "").localeCompare(
              b.name_en || b.name_zh || ""
            );
          });
        });

        // 按状态优先级排序并合并
        const statusOrder = [
          "PROFESSOR",
          "POSTDOC",
          "PHD_STUDENT",
          "MASTER_STUDENT",
          "UNDERGRADUATE",
          "VISITING_SCHOLAR",
          "RESEARCH_STAFF",
          "ALUMNI",
          "OTHER",
        ];
        const sortedMembers: Member[] = [];
        statusOrder.forEach((status) => {
          if (groupedMembers[status]) {
            sortedMembers.push(...groupedMembers[status]);
          }
        });

        setMembers(sortedMembers);
      } else {
        throw new Error(
          result.error || "Invalid data format received from API."
        );
      }
    } catch (err) {
      console.error("Fetch members error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred while fetching members."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isFullAccess, loggedInUsername]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMemberSuccess = () => {
    setIsAddMemberDialogOpen(false); // Close the dialog
    fetchMembers(); // Refresh the member list
  };

  // Handle drag end for reordering members
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = members.findIndex((member) => member.id === active.id);
      const newIndex = members.findIndex((member) => member.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find dragged member index in state.");
        return;
      }

      const draggedMember = members[oldIndex];
      const targetMember = members[newIndex];

      // 检查是否在相同状态内拖拽
      if (draggedMember.status !== targetMember.status) {
        toast.error(
          "Members can only be reordered within the same status group"
        );
        return;
      }

      // Update UI immediately for better UX
      const newMembers = arrayMove(members, oldIndex, newIndex);
      setMembers(newMembers);

      // 所有成员的排序都需要保存到数据库
      setIsUpdatingOrder(true);
      try {
        // 只更新相同状态成员的 display_order
        const sameStatusMembers = newMembers.filter(
          (m) => m.status === draggedMember.status
        );
        const memberIds = sameStatusMembers.map((member) => member.id);

        const response = await fetch("/api/members", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ memberIds }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.error?.message || "Failed to update member order"
          );
        }

        const statusDisplayName =
          draggedMember.status?.toLowerCase().replace(/_/g, " ") || "member";
        toast.success(
          `${statusDisplayName.charAt(0).toUpperCase() + statusDisplayName.slice(1)} order updated successfully`
        );
      } catch (error) {
        console.error("Error updating member order:", error);
        toast.error("Failed to update member order");
        // Revert UI changes on error
        fetchMembers();
      } finally {
        setIsUpdatingOrder(false);
      }
    }
  };

  // Handle member deletion
  const handleDeleteMember = async (memberId: string) => {
    setDeletingMemberId(memberId);
    try {
      const response = await fetch("/api/members", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to delete member");
      }

      toast.success(result.message || "Member deleted successfully");
      // Refresh the member list
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member");
    } finally {
      setDeletingMemberId(null);
    }
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="mt-10 p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-semibold text-green-400">
            Manage Members
          </h2>
          <div className="flex items-center space-x-2">
            <Dialog
              open={isAddMemberDialogOpen}
              onOpenChange={setIsAddMemberDialogOpen}
            >
              <DialogTrigger asChild disabled={!isFullAccess}>
                <Button
                  variant="default"
                  size="sm"
                  className="inline-flex items-center text-xs bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-800"
                  title={
                    isFullAccess ? "Add New Member" : "Permission Required"
                  }
                  disabled={!isFullAccess}
                >
                  <UserPlus size={14} className="mr-1" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-green-400">
                    Add New Member
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <AddMemberForm
                    onSuccess={handleAddMemberSuccess}
                    onCancel={() => setIsAddMemberDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="default"
              size="sm"
              onClick={fetchMembers}
              disabled={isLoading}
              className="inline-flex items-center text-xs bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 disabled:opacity-50 disabled:bg-blue-800"
              title="Refresh Member List"
            >
              {isLoading ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <RefreshCw size={14} className="mr-1" />
              )}
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              <span className="ml-2 text-gray-400">Loading members...</span>
            </div>
          )}
          {error && (
            <div className="flex flex-col justify-center items-center h-full text-red-400">
              <AlertTriangle size={24} className="mb-2" />
              <p>Error loading members:</p>
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={fetchMembers}
                className="mt-4 px-3 py-1 text-xs bg-red-700 hover:bg-red-600 text-white rounded"
              >
                Retry
              </button>
            </div>
          )}
          {!isLoading && !error && (
            <div className="space-y-4 pr-2">
              {members.length === 0 ? (
                <p className="text-center text-gray-500 italic mt-8">
                  {isFullAccess
                    ? "No members found."
                    : "Could not find your member profile."}
                </p>
              ) : (
                <>
                  {/* Information banner */}
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 text-blue-200 text-sm">
                    <p>
                      <strong>Drag & Drop:</strong> You can reorder members
                      within the same status group. All member order changes
                      will be saved and reflected on the public site.
                    </p>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={members.map((member) => member.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {/* Render members with status group separators */}
                      {(() => {
                        const statusTitles: Record<string, string> = {
                          PROFESSOR: "Professors",
                          POSTDOC: "Postdoctoral Researchers",
                          PHD_STUDENT: "PhD Students",
                          MASTER_STUDENT: "Master Students",
                          UNDERGRADUATE: "Undergraduate Students",
                          VISITING_SCHOLAR: "Visiting Scholars",
                          RESEARCH_STAFF: "Research Staff",
                          ALUMNI: "Alumni",
                          OTHER: "Other Members",
                        };

                        let currentStatus = "";
                        const renderedElements: React.ReactNode[] = [];

                        members.forEach((member, index) => {
                          // Add status header if this is a new status group
                          if (member.status !== currentStatus) {
                            currentStatus = member.status || "OTHER";

                            renderedElements.push(
                              <div
                                key={`header-${currentStatus}`}
                                className="pt-4 pb-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-lg font-semibold text-green-400">
                                    {statusTitles[currentStatus] ||
                                      currentStatus}
                                  </h3>
                                </div>
                                {index > 0 && (
                                  <div className="border-t border-gray-600 mt-2" />
                                )}
                              </div>
                            );
                          }

                          // Add the member item
                          renderedElements.push(
                            <SortableMemberItem
                              key={member.id}
                              member={member}
                              onDelete={handleDeleteMember}
                              isDeleting={deletingMemberId === member.id}
                              canDelete={isFullAccess}
                            />
                          );
                        });

                        return renderedElements;
                      })()}
                    </SortableContext>
                  </DndContext>
                </>
              )}

              {/* Status indicator for bulk operations */}
              {isUpdatingOrder && (
                <div className="flex items-center justify-center p-4 text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Updating member order...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MemberManager;
