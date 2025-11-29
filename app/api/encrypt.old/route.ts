import { NextResponse } from "next/server";
import { encryptString } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Missing password" }, { status: 400 });
    }

    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
      console.error("ENCRYPTION_KEY is missing in environment variables");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const key = Buffer.from(keyString.split(",").map(Number));
    const encPassword = encryptString(password, key);

    return NextResponse.json({ encPassword });
  } catch (err: any) {
    console.error("Encryption failed:", err);
    return NextResponse.json(
      { error: "Failed to encrypt", details: err?.message ?? err },
      { status: 500 }
    );
  }
}
