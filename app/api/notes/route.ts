import { verifyAccessToken, JWT_COOKIE_NAME } from "@/app/lib/jwt";
import { db } from "@/src/prisma/db";

// ---------------------------------------------------------------------------
// GET — List user's saved notes (authenticated)
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "list") {
    return handleListNotes(request);
  }

  // Default: return empty list for backward compatibility
  return Response.json({ notes: [] }, { status: 200 });
}

// ---------------------------------------------------------------------------
// POST — Create or update a saved note (authenticated)
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "create") {
    return handleCreateNote(await request.json(), request);
  }

  if (action === "update") {
    return handleUpdateNote(await request.json(), request);
  }

  // Default: try to parse as create for backward compatibility
  return handleCreateNote(await request.json(), request);
}

// ---------------------------------------------------------------------------
// Internal handlers
// ---------------------------------------------------------------------------

async function getAuthUser(request: Request): Promise<{ id: number; email: string } | null> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyAccessToken(authHeader.slice(7));
    if (payload) {
      return { id: Number(payload.sub), email: payload.email };
    }
  }

  // Fall back to refresh cookie
  const cookies = request.headers.get("cookie") || "";
  const refreshTokenMatch = cookies.match(new RegExp(`${JWT_COOKIE_NAME}=([^;]+)`));
  if (refreshTokenMatch) {
    return null; // Can't get user ID from cookie alone without verifying
  }

  return null;
}

async function handleCreateNote(body: unknown, request: Request) {
  const safeBody = body as {
    content?: string;
    sermonId?: number | null;
    customTitle?: string;
    tags?: string[];
    isPublic?: boolean;
  };
  const { content, sermonId, customTitle, tags, isPublic } = safeBody;

  const authUser = await getAuthUser(request);

  if (!authUser) {
    return Response.json(
      { error: "You must be signed in to save notes." },
      { status: 401 }
    );
  }

  if (!content || typeof content !== "string") {
    return Response.json(
      { error: "Note content is required." },
      { status: 400 }
    );
  }

  try {
    const note = await db.orm.public.SavedNote.create({
      userId: authUser.id,
      sermonId: sermonId || null,
      content,
      customTitle: customTitle || undefined,
      tags: tags || [],
      isPublic: isPublic || false,
    });

    console.log(`[note] Created for user ${authUser.id}:`, note.id);

    return Response.json(
      { message: "Note saved successfully.", noteId: note.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[note] Database error:", error);
    return Response.json(
      { error: "Failed to save note." },
      { status: 500 }
    );
  }
}

async function handleUpdateNote(body: unknown, request: Request) {
  const safeBody = body as { id?: number; content?: string; customTitle?: string; tags?: string[] };
  const { id, content, customTitle, tags } = safeBody;

  const authUser = await getAuthUser(request);

  if (!authUser || !id) {
    return Response.json(
      { error: "You must be signed in and provide a note ID." },
      { status: 400 }
    );
  }

  try {
    const existing = await db.orm.public.SavedNote.first({ id, userId: authUser.id });

    if (!existing) {
      return Response.json(
        { error: "Note not found." },
        { status: 404 }
      );
    }

    // Builder pattern: .where().update()
    await db.orm.public.SavedNote
      .where({ id })
      .update({
        content: content || existing.content,
        customTitle: customTitle !== undefined ? customTitle : undefined,
        tags: tags || existing.tags,
      });

    return Response.json(
      { message: "Note updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[note] Database error:", error);
    return Response.json(
      { error: "Failed to update note." },
      { status: 500 }
    );
  }
}

async function handleListNotes(request: Request) {
  const authUser = await getAuthUser(request);

  if (!authUser) {
    return Response.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  try {
    const notes = await db.orm.public.SavedNote
      .where({ userId: authUser.id })
      .orderBy((n) => n.createdAt.desc())
      .all();

    return Response.json(
      { notes: notes.map((n) => ({
        id: n.id,
        content: n.content,
        customTitle: n.customTitle,
        tags: n.tags,
        sermonId: n.sermonId,
        isPublic: n.isPublic,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      }))},
      { status: 200 }
    );
  } catch (error) {
    console.error("[note] Database error:", error);
    return Response.json(
      { notes: [] },
      { status: 200 }
    );
  }
}
