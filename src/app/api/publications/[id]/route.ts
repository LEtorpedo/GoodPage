import { NextResponse } from "next/server";
import { Prisma, PublicationType } from "@prisma/client"; // Import PublicationType directly
import prisma from "@/lib/prisma"; // Import Prisma client instance
import { z } from "zod";

// Define the payload structure needed for includes (copied from ../route.ts)
const publicationWithAuthorsPayload =
  Prisma.validator<Prisma.PublicationDefaultArgs>()({
    include: {
      authors: {
        // Include the relation PublicationAuthor
        include: {
          author: {
            // From PublicationAuthor, include the related Member
            select: {
              // Select only necessary Member fields
              id: true,
              name_en: true,
              name_zh: true,
            },
          },
        },
        orderBy: {
          // Order authors by their specified order
          author_order: "asc",
        },
      },
    },
  });

interface RouteParams {
  params: Promise<{ id: string }>;
}

// You might want to export this type if needed elsewhere, but primarily for internal use here
// export type PublicationWithAuthors = Prisma.PublicationGetPayload<typeof publicationWithAuthorsPayload>;

// GET Handler for fetching a specific publication by ID
export async function GET(request: Request, { params }: RouteParams) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const publicationId = parseInt(id, 10);

  if (isNaN(publicationId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid Publication ID format." } },
      { status: 400 }
    );
  }

  try {
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
      // Optionally include authors or other relations if needed for verification
      // include: { authors: { include: { author: true } } }
    });

    if (!publication) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Publication with ID ${publicationId} not found.` },
        },
        { status: 404 } // Return 404 if not found
      );
    }

    return NextResponse.json({ success: true, data: publication });
  } catch (error: unknown) {
    console.error(`[API] Error fetching publication ${publicationId}:`, error);
    let errorMessage =
      "An unexpected error occurred while fetching the publication.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, error: { message: errorMessage } },
      { status: 500 }
    );
  }
}

// DELETE Handler for deleting a specific publication
export async function DELETE(request: Request, { params }: RouteParams) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Validate ID
  const publicationId = parseInt(id, 10);
  if (isNaN(publicationId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid Publication ID format." } },
      { status: 400 }
    );
  }

  console.log(
    `[API DELETE /api/publications/${id}] Attempting to delete publication. Parsed ID: ${publicationId} (Type: ${typeof publicationId})`
  );

  try {
    // Attempt to delete the publication
    // Using delete directly will throw if the record doesn't exist, implicitly handling 404
    await prisma.publication.delete({
      where: { id: publicationId },
    });

    console.log(
      `[API] Successfully deleted publication with ID: ${publicationId}`
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(`[API] Error deleting publication ${publicationId}:`, error);

    // Check if it's a Prisma error indicating record not found
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Prisma code for "Record to delete does not exist."
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Publication with ID ${publicationId} not found.`,
            },
          },
          { status: 404 }
        );
      }
    }

    // Generic error for other issues
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, error: { message: errorMessage } },
      { status: 500 }
    );
  }
}

// You might want to add PUT/PATCH handlers here later for editing

// --- Zod Schema for PUT/PATCH (reuse or adapt from POST) ---
// Assuming PUT requires similar fields as POST for now
// You might want a different schema for PATCH allowing partial updates
const updatePublicationSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  year: z.coerce
    .number()
    .int()
    .min(1900, { message: "Year must be 1900 or later." })
    .max(new Date().getFullYear() + 5, {
      message: "Year seems too far in the future.",
    }),
  // Add other expected fields from PublicationFormData here
  venue: z.string().nullable().optional(),
  ccf_rank: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  type: z.nativeEnum(PublicationType).optional(), // Use imported PublicationType
  pdf_url: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val))
    .refine((val) => val === null || z.string().url().safeParse(val).success, {
      message: "Invalid PDF URL format.",
    }),
  doi: z.string().nullable().optional(),
  abstract: z.string().nullable().optional(),
  bibtex: z.string().nullable().optional(),
  keywords: z.string().nullable().optional(), // Assuming keywords stored as comma-separated string
  conference_url: z
    .string()
    .url({ message: "Invalid Conference URL format." })
    .nullable()
    .optional(),
  journal_url: z
    .string()
    .url({ message: "Invalid Journal URL format." })
    .nullable()
    .optional(),
  project_url: z
    .string()
    .url({ message: "Invalid Project URL format." })
    .nullable()
    .optional(),
  code_url: z
    .string()
    .url({ message: "Invalid Code URL format." })
    .nullable()
    .optional(),
  slides_url: z
    .string()
    .url({ message: "Invalid Slides URL format." })
    .nullable()
    .optional(),
  video_url: z
    .string()
    .url({ message: "Invalid Video URL format." })
    .nullable()
    .optional(),
  poster_url: z
    .string()
    .url({ message: "Invalid Poster URL format." })
    .nullable()
    .optional(),
  authors_full_string: z.string().nullable().optional(),
  // authors_string: z.string().nullable().optional(), // <-- Remove if not in Prisma model
});

// PUT Handler for updating a specific publication
export async function PUT(request: Request, { params }: RouteParams) {
  // 【修复】在Next.js 15中需要await params
  const resolvedParams = await params;

  // Defensively check params
  if (!resolvedParams || !resolvedParams.id) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Missing Publication ID in route parameters." },
      },
      { status: 400 }
    );
  }
  const id = resolvedParams.id;
  const publicationId = parseInt(id, 10);

  if (isNaN(publicationId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid Publication ID format." } },
      { status: 400 }
    );
  }

  let body: any;
  try {
    // Log headers to check Content-Type
    console.log(
      `[API PUT /api/publications/${id}] Request Headers:`,
      request.headers
    );

    // 1. Parse request body with error handling
    body = await request.json();
    console.log(`[API PUT /api/publications/${id}] Parsed request body:`, body);

    if (!body) {
      throw new Error("Request body is empty or could not be parsed.");
    }

    // 2. Validate input data using the updated schema (which includes authors_full_string)
    const validationResult = updatePublicationSchema.safeParse(body);
    if (!validationResult.success) {
      console.log(
        `[API PUT /api/publications/${id}] Invalid input for updating publication:`,
        validationResult.error.errors
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Invalid publication data provided for update.",
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // 保留所有数据，包括 authors_full_string，因为它也是数据库字段
    const publicationData = validationResult.data;
    const { authors_full_string } = validationResult.data;

    console.log(
      `[API PUT /api/publications/${id}] Validated publication data:`,
      publicationData
    );
    console.log(
      `[API PUT /api/publications/${id}] Received authors string for processing:`,
      authors_full_string
    );

    let newAuthorLinks: { member_id: string; author_order: number }[] = [];

    if (authors_full_string && authors_full_string.trim().length > 0) {
      // Parse the string: Split by semicolon, trim whitespace, remove empty entries
      const parsedNames = authors_full_string
        .split(";")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      console.log(
        `[API PUT /api/publications/${id}] Parsed author names:`,
        parsedNames
      );

      // Attempt to find Member IDs for each parsed name, handling "LastName, FirstName" format
      const memberLookups = parsedNames.map(
        async (name): Promise<{ id: string } | null> => {
          let searchName = name; // Default to using the name as is
          // 【修复】检查是否为 "FirstName, LastName" 格式（而不是 "LastName, FirstName"）
          if (name.includes(",")) {
            const parts = name.split(",").map((part) => part.trim());
            if (
              parts.length === 2 &&
              parts[0].length > 0 &&
              parts[1].length > 0
            ) {
              // 重新组装为 "FirstName LastName" 格式
              // 注意：输入格式是 "FirstName, LastName"，所以parts[0]是FirstName，parts[1]是LastName
              searchName = `${parts[0]} ${parts[1]}`;
              console.log(
                `[API PUT /api/publications/${id}] Transformed name '${name}' to '${searchName}' for DB lookup.`
              );
            }
            // Optional: Add else block here to handle cases like "LastName, " or ", FirstName" if necessary
          }
          // Use the potentially transformed name for lookup and explicitly await
          const member = await prisma.member.findFirst({
            where: { name_en: searchName }, // Use potentially transformed name
            select: { id: true },
          });
          // Explicitly check and return null if not found
          return member ? member : null;
        }
      );

      // Wait for all database lookups (which are now Promises) to complete
      const foundMembers = await Promise.all(memberLookups);

      // Prepare the data for creating new PublicationAuthor links
      newAuthorLinks = foundMembers
        .map((member, index) => {
          if (member && member.id) {
            // If a member is found, create a link object
            return { member_id: member.id, author_order: index + 1 }; // Use 1-based order
          } else {
            // Log a warning if a member could not be found
            console.warn(
              `[API PUT /api/publications/${id}] Could not find Member in DB with name_en matching: '${parsedNames[index]}'`
            );
            return null; // Indicate failure for this name
          }
        })
        // Filter out any null results where a member wasn't found
        .filter(
          (link): link is { member_id: string; author_order: number } =>
            link !== null
        );

      console.log(
        `[API PUT /api/publications/${id}] Member IDs found for linking:`,
        newAuthorLinks.map((l) => l.member_id)
      );

      // Optional: Check if the number of found links matches parsed names
      if (newAuthorLinks.length !== parsedNames.length) {
        console.warn(
          `[API PUT /api/publications/${id}] Warning: Not all parsed author names could be matched to existing Members. Proceeding with found matches.`
        );
        // Decide if this should be a hard error
        // throw new Error(`Could not find all authors in the database. Please check names: ${parsedNames.join(', ')}`);
      }
    } else {
      console.log(
        `[API PUT /api/publications/${id}] No authors_full_string provided or it was empty. Existing author links will be removed.`
      );
      // newAuthorLinks remains an empty array
    }

    // 3. Perform update within a transaction
    const updatedPublicationWithAuthors = await prisma.$transaction(
      async (tx) => {
        // Step 1: Update the Publication's own fields (包括 authors_full_string)
        await tx.publication.update({
          where: { id: publicationId },
          data: publicationData, // 包含所有验证过的数据，包括 authors_full_string
        });

        // Step 2: Delete ALL existing author links for this publication
        const deleteResult = await tx.publicationAuthor.deleteMany({
          where: { publication_id: publicationId },
        });
        console.log(
          `[API PUT /api/publications/${id}] Deleted ${deleteResult.count} existing author links in transaction.`
        );

        // Step 3: Create new author links if any were successfully resolved from the string
        if (newAuthorLinks.length > 0) {
          const createResult = await tx.publicationAuthor.createMany({
            data: newAuthorLinks.map((link) => ({
              publication_id: publicationId,
              member_id: link.member_id,
              author_order: link.author_order,
              // Set defaults for other PublicationAuthor fields if needed
              // is_corresponding_author: false, // Example
            })),
          });
          console.log(
            `[API PUT /api/publications/${id}] Created ${createResult.count} new author links in transaction.`
          );
        } else {
          console.log(
            `[API PUT /api/publications/${id}] No new author links to create.`
          );
        }

        // Step 4: Fetch the final state of the publication including the *potentially updated* authors relation
        const finalResult = await tx.publication.findUniqueOrThrow({
          where: { id: publicationId },
          include: publicationWithAuthorsPayload.include, // Use the same include definition as before
        });

        return finalResult; // The transaction returns the result of this last operation
      }
    );

    // Return the final publication data which now includes the updated 'authors' relation
    return NextResponse.json({
      success: true,
      data: updatedPublicationWithAuthors,
    });
  } catch (error: unknown) {
    // Log the body received if an error occurred after parsing
    if (body) {
      console.error(
        `[API] Error occurred after parsing body for publication ${publicationId}. Body was:`,
        body
      );
    } else {
      console.error(
        `[API] Error occurred before or during body parsing for publication ${publicationId}.`
      );
    }
    console.error(`[API] Error details:`, error);

    // Check for Prisma errors (e.g., record not found)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Record to update not found.
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Publication with ID ${publicationId} not found for update.`,
            },
          },
          { status: 404 }
        );
      }
      // Handle other potential Prisma errors (e.g., unique constraints) if necessary
    }

    // Generic error handling
    let errorMessage =
      "An unexpected error occurred while updating the publication.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, error: { message: errorMessage } },
      { status: 500 }
    );
  }
}
