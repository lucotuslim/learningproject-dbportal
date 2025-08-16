"use client"

const apiUrl = process.env.NEXT_PUBLIC_APPDBSERVERAPI ?? "env not set";

export default function ApiDiv() {
  return <div> {apiUrl}</div>
}
