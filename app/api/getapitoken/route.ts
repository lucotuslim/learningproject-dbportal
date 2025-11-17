// app/api/get-doc-token/route.ts
import { NextResponse } from "next/server";
import { getApiToken } from "@/lib/utils";
import { DocumentExtractionTasksSetting } from "@/config/appsetting"; // must be server-importable

export async function POST(req: Request) {
  try {
    const { env } = await req.json(); // client sends selected env key

    if (!env) return NextResponse.json({ error: "env required" }, { status: 400 });

    const envConfig = DocumentExtractionTasksSetting.find((e) => e.env === env);
    if (!envConfig) return NextResponse.json({ error: "invalid env" }, { status: 400 });

    // >>> IMPORTANT: keep client secret server-side only.
    const token = await getApiToken({
      Url: envConfig.GetDocApiToken.Url,
      Method: envConfig.GetDocApiToken.Method,
      ContentType: envConfig.GetDocApiToken.ContentType,
      GrantType: envConfig.GetDocApiToken.GrantType,
      ClientId: process.env.NEXT_PUBLIC_DocApiClientId!,
      Scope:   process.env.NEXT_PUBLIC_DocApiScope!,
      ClientSecret: process.env.NEXT_PUBLIC_DocApiClientSecret! // server env var, not client
    });

    return NextResponse.json(token, { status: 200 });
  } catch (err: any) {
    console.error("get-doc-token error", err);
    return NextResponse.json({ error: err.message ?? "unknown error" }, { status: 500 });
  }
}
