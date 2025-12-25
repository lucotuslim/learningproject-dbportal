'use server'
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import {IApiTokenParams} from "@/interfaces/generic";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export async function getApiToken({
  Url,
  Method,
  ContentType,
  GrantType,
  ClientId,
  Scope,
  ClientSecret = process.env.DocApiClientSecret
}: IApiTokenParams): Promise<TokenResponse> {
  try {
    if (
      !Url ||
      !Method ||
      !ContentType ||
      !GrantType ||
      !ClientId ||
      !Scope ||
      !ClientSecret
    ) {
      throw new Error("Missing required parameters");
    }

    // 🧩 Prepare headers and body
    const headers = {
      "Content-Type": ContentType,
    };

    const body = new URLSearchParams({
      grant_type: GrantType,
      client_id: ClientId,
      scope: Scope,
      client_secret: ClientSecret,
    });

    // 🚀 Send request
    const response = await fetch(Url, {
      method: Method.toUpperCase(),
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.statusText} — ${errorText}`);
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`getApiToken: ${message}`);
  }
}


export async function  chunkArray<T>(arr: T[], size: number): Promise<T[][]> {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function decryptString(encryptedBase64: string): Promise<string> {
  const keyString = process.env.ENCRYPTION_KEY;
  const key = Buffer.from(keyString!.split(",").map(Number));
  const fullCipher = Buffer.from(encryptedBase64, "base64");
  const iv = fullCipher.subarray(0, 16);
  const encrypted = fullCipher.subarray(16);
  const decipher = createDecipheriv(`aes-${key.length * 8}-cbc`, key, iv);
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function encryptString(plainText: string): Promise<string> {
  const keyString = process.env.ENCRYPTION_KEY;
  const key = Buffer.from(keyString!.split(",").map(Number));

  const iv = randomBytes(16); // PowerShell uses 16-byte IV for AES-CBC
  const cipher = createCipheriv(`aes-${key.length * 8}-cbc`, key, iv);
  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");

  // PowerShell prepends the IV (base64 encoded)
  const fullCipher = Buffer.concat([iv, Buffer.from(encrypted, "base64")]);
  return fullCipher.toString("base64");
}
