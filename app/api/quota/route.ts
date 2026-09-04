import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getQuota } from "@/lib/quota";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  const quota = await getQuota(user!.id);
  return NextResponse.json(quota);
}
