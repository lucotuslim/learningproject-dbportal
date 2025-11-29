import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import crypto from "crypto";

/**
 * POST /api/run-extract
 * Body JSON:
 * {
 *   "env": "dev",
 *   "Namespace": "abc",
 *   "Zipname": "file.zip",
 *   "SftpUsername": "user",
 *   "SftpPassword": "pass"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Incoming body:", body);
    const { env, Namespace, Zipname, SftpUsername, SftpPassword } = body;


    if (!env || !Namespace || !Zipname || !SftpUsername || !SftpPassword) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    console.log("Running, getting documents");

    // Simulate getting Namespace configuration
    const NamespaceInfo = await getNamespaceConfig(env, Namespace);
    const ServerDocuments = await getNamespaceDocuments(
      NamespaceInfo.ConstringServerName,
      NamespaceInfo.ConstringDatabaseName
    );

    console.log("Completed, getting namespace");

    const Documents = { Data: ServerDocuments };
    const ContainerName = `${NamespaceInfo.Namespace}-${NamespaceInfo.ClientID}`;

    // Load config
    const configPath = path.join(process.cwd(), "DocConfig.json");
    const configContent = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configContent);
    const currentEnvConfig = config[env];

    const token: {access_token: string} = await getDocApiToken({
      url: currentEnvConfig.GetDocApiToken.Url,
      method: currentEnvConfig.GetDocApiToken.Method,
      contentType: currentEnvConfig.GetDocApiToken.ContentType,
      grantType: currentEnvConfig.GetDocApiToken.GrantType,
      clientId: process.env.CLIENT_ID!,
      scope: process.env.SCOPE!,
      clientSecret: process.env.CLIENT_SECRET!,
    });

    const bulkExportResponse = await sendDocBulkExport({
      url: currentEnvConfig.SendDocBulkExport.Url,
      method: currentEnvConfig.SendDocBulkExport.Method,
      sftpHostName: currentEnvConfig.SendDocBulkExport.sftpHostName,
      contentType: currentEnvConfig.SendDocBulkExport.ContentType,
      token: token.access_token,
      containerName: ContainerName,
      Zipname: Zipname,
      sftpUsername: SftpUsername,
      sftpPassword: SftpPassword,
      documents: Documents,
    });

    if (bulkExportResponse["Export GUID"]) {
      const ExportGuid = bulkExportResponse["Export GUID"];
      const ExportFileName = bulkExportResponse["Export File Name"];
      const ExportPassword = bulkExportResponse["Password"];

      console.log("Export GUID:", ExportGuid);
      console.log("Export File Name:", ExportFileName);

      const encryptedPassword = encryptString(ExportPassword, process.env.SECURE_KEY!);
      const encryptedSftpPassword = encryptString(SftpPassword, process.env.SECURE_KEY!);

      await updateDocExportDetails({
        guid: ExportGuid,
        filename: ExportFileName,
        password: encryptedPassword,
        sftpUser: SftpUsername,
        sftpPassword: encryptedSftpPassword,
        containerName: ContainerName,
        namespace: Namespace,
        createdBy: process.env.USERNAME || "system",
      });

      return NextResponse.json({ ExportGuid });
    } else {
      return NextResponse.json({ message: bulkExportResponse.apiStatuses?.additionalInfo });
    }
  } catch (err: any) {
    console.error("Error:", err);
    
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* Helper functions — you can replace these with real implementations later.  */
/* -------------------------------------------------------------------------- */

async function getNamespaceConfig(env: string, ns: string) {
  // TODO: Replace with actual DB or API query
  return {
    Namespace: ns,
    ClientID: "client123",
    ConstringServerName: "sqlserver1",
    ConstringDatabaseName: "db1",
  };
}

async function getNamespaceDocuments(server: string, db: string) {
  // TODO: Replace with actual DB query
  return [{ DocumentGUID: "doc-001" }, { DocumentGUID: "doc-002" }];
}

async function getDocApiToken  (opts: {
  url: string;
  method: string;
  contentType: string;
  grantType: string;
  clientId: string;
  scope: string;
  clientSecret: string;
}) : Promise< {access_token:string}  >  {
  const res = await fetch(opts.url, {
    method: opts.method,
    headers: { "Content-Type": opts.contentType },
    body: new URLSearchParams({
      grant_type: opts.grantType,
      client_id: opts.clientId,
      scope: opts.scope,
      client_secret: opts.clientSecret,
    }),
  });
  return res.json() as Promise<{access_token:string}>;
}

async function sendDocBulkExport(opts: any) : Promise<any> {
  const res = await fetch(opts.url, {
    method: opts.method,
    headers: {
      Authorization: `Bearer ${opts.token}`,
      "Content-Type": opts.contentType,
    },
    body: JSON.stringify({
      containerName: opts.containerName,
      Zipname: opts.Zipname,
      sftpUsername: opts.sftpUsername,
      sftpPassword: opts.sftpPassword,
      documents: opts.documents,
    }),
  });
  return res.json();
}

export function encryptString(text: string, key: string): string {
  // Convert "001 002 003 ..." → [1, 2, 3, ...]
  const keyParts = key.trim().split(/\s+/).map(Number);
  const keyBuffer = Buffer.from(keyParts);

  if (keyBuffer.length !== 32) {
    throw new Error(`Invalid AES key length: ${keyBuffer.length}. Must be 32 bytes.`);
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}


async function updateDocExportDetails(details: any) {
  // TODO: Implement DB update (MSSQL, Prisma, Sequelize, etc.)
  console.log("Updating export details:", details);
}

export function decryptString(encrypted: string, key: string): string {
  const [ivHex, dataHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedData = Buffer.from(dataHex, "hex");

  const keyParts = key.trim().split(/\s+/).map(Number);
  const keyBuffer = Buffer.from(keyParts);

  if (keyBuffer.length !== 32) {
    throw new Error(`Invalid AES key length: ${keyBuffer.length}. Must be 32 bytes.`);
  }

  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
