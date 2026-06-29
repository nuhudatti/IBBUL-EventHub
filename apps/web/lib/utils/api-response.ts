import { NextResponse } from "next/server";

export function ok<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({ success: true, data, message });
}

export function fail(code: string, message: string, details?: unknown, status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details }
    },
    { status }
  );
}
