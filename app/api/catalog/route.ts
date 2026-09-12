import { NextResponse } from "next/server";

const REMOTE =
  "https://raw.githubusercontent.com/GRatierODU/krillion-prompts/main/bank.json";

type Manifest = { parts: string[] };

function isPromptArray(data: unknown): data is unknown[] {
  return Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);
}

export async function GET() {
  try {
    const first = await fetch(REMOTE, { cache: "no-store" });
    if (!first.ok) {
      return NextResponse.json(
        { error: "catalogue indisponible" },
        { status: 502 },
      );
    }
    const data: unknown = await first.json();
    let rows: unknown[] = [];
    if (isPromptArray(data)) {
      rows = data;
    } else if (
      data &&
      typeof data === "object" &&
      Array.isArray((data as Manifest).parts)
    ) {
      const base = REMOTE.replace(/[^/]+$/, "");
      for (const part of (data as Manifest).parts) {
        const url = /^https?:\/\//.test(part) ? part : base + part;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(part);
        const piece: unknown = await res.json();
        if (!isPromptArray(piece)) throw new Error(part);
        rows.push(...piece);
      }
    } else {
      throw new Error("format");
    }
    return NextResponse.json(rows, {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "catalogue indisponible" },
      { status: 502 },
    );
  }
}
