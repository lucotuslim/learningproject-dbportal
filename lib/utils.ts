import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {ApiInterface} from "@/interfaces/generic";

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
