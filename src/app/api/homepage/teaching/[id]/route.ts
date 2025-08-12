import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for validating PUT request body
const updateTeachingSchema = z.object({
  course_title: z.string().min(1).optional(),
  details: z.string().optional().nullable(),
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

// GET handler for a single teaching entry
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);
    const teachingEntry = await prisma.homepageTeaching.findUnique({
      where: { id },
    });

    if (!teachingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Teaching entry with ID ${id} not found.` },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: teachingEntry });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(
      `Failed to fetch teaching entry ${resolvedParams.id}:`,
      error
    );
    const status = error.message.includes("Invalid ID") ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            status === 400 ? error.message : "Failed to fetch teaching entry.",
        },
      },
      { status }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT handler to update a specific teaching entry
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);
    const body = await request.json();

    // Validate input
    const validation = updateTeachingSchema.safeParse(body);
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

    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "No valid fields provided for update." },
        },
        { status: 400 }
      );
    }

    const updatedTeachingEntry = await prisma.homepageTeaching.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: updatedTeachingEntry });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(
      `Failed to update teaching entry ${resolvedParams.id}:`,
      error
    );
    if (error instanceof Error && error.message.includes("Invalid ID")) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      // Record not found
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Teaching entry with ID ${resolvedParams.id} not found.`,
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update teaching entry." },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE handler to remove a specific teaching entry
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);

    await prisma.homepageTeaching.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: `Teaching entry with ID ${id} deleted.` },
      { status: 200 }
    );
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(
      `Failed to delete teaching entry ${resolvedParams.id}:`,
      error
    );
    if (error instanceof Error && error.message.includes("Invalid ID")) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      // Record not found
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Teaching entry with ID ${resolvedParams.id} not found.`,
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to delete teaching entry." },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
