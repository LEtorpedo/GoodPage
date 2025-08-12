import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for validating PUT request body
const updateNewsSchema = z.object({
  content: z.string().min(1).optional(),
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional(),
});

// Helper to get ID from params
const getIdFromParams = (params: { id?: string }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    throw new Error("Invalid ID parameter");
  }
  return id;
};

// GET handler for a single news item (optional, but good practice)
export async function GET(
  request: Request, // Keep request parameter even if unused for consistency
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);
    const newsItem = await prisma.homepageNews.findUnique({
      where: { id },
    });

    if (!newsItem) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `News item with ID ${id} not found.` },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: newsItem });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Failed to fetch news item ${resolvedParams.id}:`, error);
    const status = error.message.includes("Invalid ID") ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            status === 400 ? error.message : "Failed to fetch news item.",
        },
      },
      { status }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT handler to update a specific news item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);
    const body = await request.json();

    // Validate input
    const validation = updateNewsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid input.",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Check if there's anything to update
    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "No valid fields provided for update." },
        },
        { status: 400 }
      );
    }

    const updatedNewsItem = await prisma.homepageNews.update({
      where: { id },
      data: validation.data, // Use validated data
    });

    return NextResponse.json({ success: true, data: updatedNewsItem });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Failed to update news item ${resolvedParams.id}:`, error);
    if (error instanceof Error && error.message.includes("Invalid ID")) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }
    // Handle potential Prisma errors like record not found
    if (error.code === "P2025") {
      // Prisma error code for record not found on update/delete
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `News item with ID ${resolvedParams.id} not found.`,
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Failed to update news item." } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE handler to remove a specific news item
export async function DELETE(
  request: Request, // Keep request parameter even if unused for consistency
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);

    await prisma.homepageNews.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: `News item with ID ${id} deleted.` },
      { status: 200 }
    ); // Can also use 204 No Content
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Failed to delete news item ${resolvedParams.id}:`, error);
    if (error instanceof Error && error.message.includes("Invalid ID")) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }
    // Handle potential Prisma errors like record not found
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `News item with ID ${resolvedParams.id} not found.`,
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete news item." } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
