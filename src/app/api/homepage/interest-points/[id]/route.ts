import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for validating PUT request body
const updateInterestPointSchema = z.object({
  text: z.string().min(1).optional(),
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional(),
});

// Helper to get ID from params (same as before)
const getIdFromParams = (params: { id?: string }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    throw new Error("Invalid ID parameter");
  }
  return id;
};

// GET handler for a single interest point (optional)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);
    const interestPoint = await prisma.interestPoint.findUnique({
      where: { id },
    });

    if (!interestPoint) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Interest point with ID ${id} not found.` },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: interestPoint });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(
      `Failed to fetch interest point ${resolvedParams.id}:`,
      error
    );
    const status = error.message.includes("Invalid ID") ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            status === 400 ? error.message : "Failed to fetch interest point.",
        },
      },
      { status }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT handler to update a specific interest point
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);
    const body = await request.json();

    // Validate input
    const validation = updateInterestPointSchema.safeParse(body);
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

    const updatedInterestPoint = await prisma.interestPoint.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: updatedInterestPoint });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(
      `Failed to update interest point ${resolvedParams.id}:`,
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
            message: `Interest point with ID ${resolvedParams.id} not found.`,
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update interest point." },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE handler to remove a specific interest point
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);

    await prisma.interestPoint.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: `Interest point with ID ${id} deleted.` },
      { status: 200 }
    );
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(
      `Failed to delete interest point ${resolvedParams.id}:`,
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
            message: `Interest point with ID ${resolvedParams.id} not found.`,
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to delete interest point." },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
