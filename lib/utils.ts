import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {ApiInterface} from "@/interfaces/generic";
import {IApiTokenParams} from "@/interfaces/generic";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// safeMsNodeSqlQuery.ts (paste into your helper or route)
import util from "util";

export async function safeMsNodeSqlQuery(connStr: string, sqlText: string, timeoutMs: number) {
  // require hidden so bundlers won't try to include native binding where not available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const msnodesqlv8 = eval("require")("msnodesqlv8");
  const queryAsync = util.promisify(msnodesqlv8.query);

  return new Promise<any>((resolve, reject) => {
    let finished = false;

    // Convert any unexpected global exceptions/rejections during this call into a rejection
    const onGlobalErr = (err: any) => {
      if (finished) return;
      finished = true;
      cleanup();
      // normalize
      const e = err instanceof Error ? err : new Error(String(err));
      return reject(e);
    };

    // Setup temporary listeners
    process.once("uncaughtException", onGlobalErr);
    process.once("unhandledRejection", onGlobalErr);

    // JS-level timeout guard (ensures route responds)
    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      cleanup();
      return reject(new Error("msnodesqlv8 query timed out"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      process.removeListener("uncaughtException", onGlobalErr);
      process.removeListener("unhandledRejection", onGlobalErr);
    }

    // Now call the driver. It may synchronously throw — catch that.
    try {
      queryAsync(connStr, sqlText)
        .then((rows: any) => {
          if (finished) return;
          finished = true;
          cleanup();
          resolve(rows);
        })
        .catch((err: any) => {
          if (finished) return;
          finished = true;
          cleanup();
          reject(err);
        });
    } catch (err) {
      // synchronous thrown error (e.g., "Connection is not open")
      if (finished) return;
      finished = true;
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

interface PushResponse {
  url_token: string;
  payload: string;
  expire_after_days: number;
  expire_after_views: number;
  expired: boolean;
  created_at: string;
  updated_at: string;
}

export async function createPush(payload: string): Promise<PushResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_PWPUSHER_API_URL}/p.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'password[payload]': payload
    })
  });

  const data: PushResponse = await response.json();
  console.log(`Share this secret URL: ${process.env.NEXT_PUBLIC_PWPUSHER_API_URL}/p/${data.url_token}`);
  return data;
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function ApiRequest<T>(
  fetchUrl: string,
  options?: RequestInit
): Promise<ApiInterface<T>> {
  const response = await fetch(fetchUrl, options);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.json();
}

export function encryptString(plainText: string, key: Buffer): string {
  if (![16, 32].includes(key.length)) {
    throw new Error("Key must be 16 or 32 bytes (AES-128 or AES-256).");
  }

  const iv = randomBytes(16); // PowerShell uses 16-byte IV for AES-CBC
  const cipher = createCipheriv(`aes-${key.length * 8}-cbc`, key, iv);
  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");

  // PowerShell prepends the IV (base64 encoded)
  const fullCipher = Buffer.concat([iv, Buffer.from(encrypted, "base64")]);
  return fullCipher.toString("base64");
}

/**
 * Decrypt a Base64 ciphertext encrypted with PowerShell's ConvertFrom-SecureString -Key
 */
export function decryptString(encryptedBase64: string, key: Buffer): string {
  if (![16, 32].includes(key.length)) {
    throw new Error("Key must be 16 or 32 bytes (AES-128 or AES-256).");
  }

  const fullCipher = Buffer.from(encryptedBase64, "base64");
  const iv = fullCipher.subarray(0, 16);
  const encrypted = fullCipher.subarray(16);

  const decipher = createDecipheriv(`aes-${key.length * 8}-cbc`, key, iv);
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}


export async function getApiToken({
  Url,
  Method,
  ContentType,
  GrantType,
  ClientId,
  Scope,
  ClientSecret,
}: IApiTokenParams): Promise<any> {
  try {

    // 🧠 Validate required params
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
  } catch (err: any) {
    throw new Error(`Get-DocApiToken: ${err.message}`);
  }
}
