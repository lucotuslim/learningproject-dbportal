import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {ApiInterface} from "@/interfaces/generic";
import {IApiTokenParams} from "@/interfaces/generic";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

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
