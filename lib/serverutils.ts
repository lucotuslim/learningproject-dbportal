'use server'
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

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
