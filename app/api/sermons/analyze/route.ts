import { NextResponse } from "next/server";

import { generateSermonNotes } from "@/app/lib/ai/engine";

import type { SermonMetadata } from "@/app/types/sermon";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      transcript,
      metadata,
      mode,
    } = body;

    if (!transcript) {
      return NextResponse.json(
        {
          error: "Transcript is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!metadata) {
      return NextResponse.json(
        {
          error: "Sermon metadata is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (mode !== "ai") {
      return NextResponse.json(
        {
          error:
            "This endpoint currently supports AI mode only.",
        },
        {
          status: 400,
        }
      );
    }

    const sermonNote =
      await generateSermonNotes(
        transcript,
        metadata as SermonMetadata
      );

    return NextResponse.json({
      message:
        "AI sermon notes generated successfully.",
      sermonNote,
    });
  } catch (error) {
    console.error(
      "Sermon analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze sermon.",
      },
      {
        status: 500,
      }
    );
  }
}