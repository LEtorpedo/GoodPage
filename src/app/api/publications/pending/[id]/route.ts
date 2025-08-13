import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Handler for DELETE requests
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15 requires Promise
) {
  const { id: idString } = await params; // Await params in Next.js 15
  const id = parseInt(idString, 10); // Convert string to integer

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { error: "Valid publication ID is required" },
      { status: 400 }
    );
  }

  try {
    // Find the publication first to ensure it exists and is pending
    const publication = await prisma.publication.findUnique({
      where: { id: id },
      select: { status: true }, // Only need status to verify
    });

    if (!publication) {
      console.warn(`Publication with ID ${id} not found.`);
      // Return 404 even if it never existed, or was already deleted/approved
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }

    // IMPORTANT: Only allow deletion if the status is 'pending_review'
    if (publication.status !== "pending_review") {
      console.warn(
        `Attempted to delete publication ${id} with status ${publication.status}.`
      );
      return NextResponse.json(
        { error: "Cannot delete publication that is not pending review." },
        { status: 400 }
      );
    }

    // Delete the publication
    await prisma.publication.delete({
      where: { id: id },
    });

    // Return a success response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting pending publication ${id}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Handler for PUT requests (Update)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params; // Await params in Next.js 15
  const id = parseInt(idString, 10); // Convert string to integer

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "Valid publication ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields (adjust based on your form validation)
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Extract fields allowed for update
    const { authorIds, status, ...updateData } = body;

    // Basic type validation for year (optional but good practice)
    if (updateData.year !== null && typeof updateData.year !== "number") {
      try {
        updateData.year = updateData.year
          ? parseInt(updateData.year, 10)
          : null;
        if (isNaN(updateData.year)) updateData.year = null;
      } catch {
        updateData.year = null;
      }
    }

    // 【修复】编辑 pending publication 时应该保持 pending_review 状态
    // 只有 approve 操作才应该改为 published 状态
    const finalStatus = "pending_review";

    // Use Prisma transaction to update publication and connect authors
    const updatedPublication = await prisma.$transaction(async (tx) => {
      // 1. Update the publication data
      await tx.publication.update({
        where: { id: id },
        data: {
          ...updateData,
          status: finalStatus, // 保持 pending_review 状态
        },
      });

      // 2. Clear existing author relationships
      await tx.publicationAuthor.deleteMany({
        where: { publication_id: id },
      });

      // 3. Create new author relationships (if any)
      if (authorIds && Array.isArray(authorIds) && authorIds.length > 0) {
        // Ensure authorIds are valid strings
        const validAuthorIds = authorIds.filter(
          (aid): aid is string => typeof aid === "string" && aid.length > 0
        );
        if (validAuthorIds.length > 0) {
          await tx.publicationAuthor.createMany({
            data: validAuthorIds.map((authorId, index) => ({
              publication_id: id,
              member_id: authorId,
              author_order: index + 1,
              is_corresponding_author: false,
            })),
          });
        }
      }

      // 4. Re-fetch the updated publication with authors included for the response
      const result = await tx.publication.findUnique({
        where: { id: id },
        include: {
          authors: {
            include: {
              author: {
                select: { id: true, name_en: true, name_zh: true },
              },
            },
            orderBy: { author_order: "asc" },
          },
        },
      });

      if (!result) {
        // This shouldn't happen if the initial update succeeded, but handle defensively
        throw new Error(
          "Failed to re-fetch updated publication after transaction."
        );
      }
      return result;
    });

    return NextResponse.json(
      { success: true, data: updatedPublication },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating publication ${id}:`, error);
    // Handle potential Prisma errors (e.g., record not found)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { success: false, error: "Publication not found" },
          { status: 404 }
        );
      }
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
