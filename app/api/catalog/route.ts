import { NextResponse } from "next/server";

const REMOTE =
  "https://raw.githubusercontent.com/GRatierODU/krillion-prompts/main/bank.json";

export async function GET() {
  try {
    const response = await fetch(REMOTE, { next: { revalidate: 3600 } });
    if (!response.ok) {
      return NextResponse.json(
        { error: "catalogue indisponible" },
        { status: 502 },
      );
    }
    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "catalogue indisponible" },
      { status: 502 },
    );
  }
}
