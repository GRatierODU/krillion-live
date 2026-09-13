import { NextResponse } from "next/server";
import { loadBundled } from "@/lib/data/bundled";
import { inflate } from "@/lib/data/load";

export async function GET(request: Request) {
  try {
    const rows = await loadBundled();
    if (rows.length < 500) {
      throw new Error(`banque trop petite (${rows.length})`);
    }
    if (new URL(request.url).searchParams.has("meta")) {
      const prompts = inflate(rows);
      return NextResponse.json({
        count: prompts.length,
        ids: prompts.map((prompt) => prompt.id),
      });
    }
    return NextResponse.json(rows, {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=86400",
        "x-prompt-count": String(rows.length),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "catalogue indisponible" },
      { status: 502 },
    );
  }
}
