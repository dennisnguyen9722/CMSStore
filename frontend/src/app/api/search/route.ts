import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();

  return NextResponse.json(data);
}
