"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import type { Patent } from "@prisma/client";

// Zod schema for patent form validation
const PatentFormSchema = z.object({
  title: z.string().min(1, "Patent title is required"),
  patent_number: z.string().optional().nullable(),
  inventors_string: z.string().optional().nullable(),
  issue_date: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  url: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
      message: "Invalid URL format",
    }),
  display_order: z.number().int().min(0).default(0),
});

export type PatentFormData = z.infer<typeof PatentFormSchema>;

// 添加专利记录
export async function addPatentRecord(
  memberId: string,
  data: PatentFormData
): Promise<{
  success: boolean;
  patent?: Patent;
  error?: string;
}> {
  try {
    // 验证输入数据
    const validatedData = PatentFormSchema.parse(data);

    // 创建专利记录
    const patent = await prisma.patent.create({
      data: {
        member_id: memberId,
        title: validatedData.title,
        patent_number: validatedData.patent_number || null,
        inventors_string: validatedData.inventors_string || null,
        issue_date: validatedData.issue_date || null,
        status: validatedData.status || null,
        url: validatedData.url || null,
        display_order: validatedData.display_order,
      },
    });

    // 重新验证相关页面缓存
    revalidatePath("/developer");
    revalidatePath(`/members/${memberId}`);

    return { success: true, patent };
  } catch (error: any) {
    console.error("Error adding patent record:", error);

    if (error instanceof z.ZodError) {
      // 返回验证错误信息
      const fieldErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          const fieldName = err.path.join(".");
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = [];
          }
          fieldErrors[fieldName].push(err.message);
        }
      });
      return {
        success: false,
        error: JSON.stringify(fieldErrors),
      };
    }

    return {
      success: false,
      error: error.message || "Failed to add patent record",
    };
  }
}

// 更新专利记录
export async function updatePatentRecord(
  patentId: number,
  data: PatentFormData
): Promise<{
  success: boolean;
  patent?: Patent;
  error?: string;
}> {
  try {
    // 验证输入数据
    const validatedData = PatentFormSchema.parse(data);

    // 检查专利是否存在
    const existingPatent = await prisma.patent.findUnique({
      where: { id: patentId },
    });

    if (!existingPatent) {
      return { success: false, error: "Patent record not found" };
    }

    // 更新专利记录
    const patent = await prisma.patent.update({
      where: { id: patentId },
      data: {
        title: validatedData.title,
        patent_number: validatedData.patent_number || null,
        inventors_string: validatedData.inventors_string || null,
        issue_date: validatedData.issue_date || null,
        status: validatedData.status || null,
        url: validatedData.url || null,
        display_order: validatedData.display_order,
      },
    });

    // 重新验证相关页面缓存
    revalidatePath("/developer");
    revalidatePath(`/members/${existingPatent.member_id}`);

    return { success: true, patent };
  } catch (error: any) {
    console.error("Error updating patent record:", error);

    if (error instanceof z.ZodError) {
      // 返回验证错误信息
      const fieldErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          const fieldName = err.path.join(".");
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = [];
          }
          fieldErrors[fieldName].push(err.message);
        }
      });
      return {
        success: false,
        error: JSON.stringify(fieldErrors),
      };
    }

    return {
      success: false,
      error: error.message || "Failed to update patent record",
    };
  }
}

// 删除专利记录
export async function deletePatentRecord(
  patentId: number
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 检查专利是否存在
    const existingPatent = await prisma.patent.findUnique({
      where: { id: patentId },
    });

    if (!existingPatent) {
      return { success: false, error: "Patent record not found" };
    }

    // 删除专利记录
    await prisma.patent.delete({
      where: { id: patentId },
    });

    // 重新验证相关页面缓存
    revalidatePath("/developer");
    revalidatePath(`/members/${existingPatent.member_id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting patent record:", error);
    return {
      success: false,
      error: error.message || "Failed to delete patent record",
    };
  }
}
