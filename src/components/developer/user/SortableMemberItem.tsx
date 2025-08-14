"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Member {
  id: string;
  name_en: string;
  name_zh?: string | null;
  status: string;
  avatar_url?: string | null;
  username?: string | null;
  display_order?: number;
}

interface SortableMemberItemProps {
  member: Member;
  onDelete: (memberId: string) => void;
  isDeleting: boolean;
  canDelete: boolean; // Permission check
}

export function SortableMemberItem({
  member,
  onDelete,
  isDeleting,
  canDelete,
}: SortableMemberItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : "auto",
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
    cursor: "default",
  };

  const handleDeleteConfirm = () => {
    onDelete(member.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative overflow-hidden
        rounded-lg transition-all duration-200
        ${
          isDragging
            ? "bg-gray-600 shadow-xl ring-2 ring-blue-400 dark:ring-blue-500"
            : "bg-gray-700 hover:bg-gray-600"
        }
      `}
    >
      <div className="flex items-center justify-between">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing focus:outline-none touch-none hover:text-blue-400 transition-colors p-1"
          aria-label="Drag to reorder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>

        {/* Main content area */}
        <div className="flex items-center space-x-3 flex-grow min-w-0 mx-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white overflow-hidden flex-shrink-0">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={`${member.name_en}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{member.name_en.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-200 truncate">
                {member.name_en}
              </span>
              {member.name_zh && (
                <span className="text-sm text-gray-400 truncate">
                  ({member.name_zh})
                </span>
              )}
            </div>
            <span className="block text-xs text-gray-400 capitalize">
              {member.status
                ? member.status.toLowerCase().replace(/_/g, " ")
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Edit Button */}
          <Link
            href={`/developer/members/${member.id}/edit`}
            className="p-1 text-gray-400 hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-indigo-500 rounded transition-colors"
            title={`Edit ${member.name_en}`}
          >
            <Edit size={16} />
          </Link>

          {/* Delete Button */}
          {canDelete && (
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <button
                  className="p-1 text-gray-400 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-red-500 rounded transition-colors disabled:opacity-50"
                  title={`Delete ${member.name_en}`}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400">
                    Delete Member
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">{member.name_en}</span>
                    {member.name_zh && ` (${member.name_zh})`}? This action
                    cannot be undone and will remove all associated data
                    including publications, education records, and other profile
                    information.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
