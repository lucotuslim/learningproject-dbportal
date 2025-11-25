// app/api/get-doc-token/route.ts
import { NextResponse } from "next/server";
import { DocumentExtractionTasksSetting } from "@/config/appsetting"; // must be server-importable
import { env } from "process";

export async function POST(req: Request) {
  try {
    // parse incoming JSON (no 1MB Server Action limit here)
    const body = await req.json();

    // Basic validation (adjust to your needs)
    if (!body?.Url || !body?.Method || !body?.Token || !Array.isArray(body.DocumentsGUID)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Build headers to forward to the external service
    const headers: Record<string, string> = {
      'Content-Type': body.ContentType || 'application/json',
      Authorization: `Bearer ${body.Token}`,
      ContainerName: body.ContainerName || '',
      ZipName: body.ZipName || '',
      SftpUsername: body.SftpUsername || '',
      sftppassword: body.sftppassword || '',
      sftpHostName: body.sftpHostName || '',
    };

    // Optional: do NOT forward empty headers (clean)
    Object.keys(headers).forEach((k) => {
      if (!headers[k]) delete headers[k];
    });

    // Forward the request to the configured endpoint
    const response = await fetch(body.Url, {
      method: body.Method,
      headers,
      body: JSON.stringify({Data: body.DocumentsGUID }),
      // optional: no-store to avoid Next caching
      cache: 'no-store',
    });

    // If the external call failed, bubble up a helpful error
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        {
          error: 'External bulk-export failed',
          status: response.status,
          statusText: response.statusText,
          body: text,
        },
        { status: 502 }
      );
    }

    // assume external returns JSON
    const result = await response.json().catch(async () => {
      // if not JSON, return raw text
      const t = await response.text();
      return { text: t };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('submitBulkExport route error', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}