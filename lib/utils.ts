import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {ApiInterface} from "@/interfaces/generic";
import {IApiTokenParams} from "@/interfaces/generic";

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

// export async function ApiRequest<T>(
//   fetchUrl: string,
//   options?: RequestInit
// ): Promise<ApiInterface<T>> {
//   const response = await fetch(fetchUrl, options);
//   if (!response.ok) throw new Error(`API error: ${response.status}`);
//   return await response.json();
// }

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
