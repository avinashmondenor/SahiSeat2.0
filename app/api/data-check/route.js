import { NextResponse } from "next/server";
import { getCsvStats } from "../../lib/csvData";

export async function GET() {
  const stats = getCsvStats();

  return NextResponse.json({
    status: "ok",
    fileCount: stats.fileCount,
    totalRows: stats.totalRows,
    files: stats.files,
  });
}