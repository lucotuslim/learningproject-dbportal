"use client"

const apiUrl = process.env.NEXT_PUBLIC_APPDBSERVERAPI ?? "env NEXT_PUBLIC_APPDBSERVERAPI not set";

export default function ApiDiv() {
  return <div> {apiUrl}</div>
}
