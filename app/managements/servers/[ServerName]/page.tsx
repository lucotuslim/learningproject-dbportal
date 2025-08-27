"use client"


import { useParams } from "next/navigation";

export default function Page() {
  const { ServerName } = useParams();

  return (
    <div>
      <h2>Databases for {ServerName}</h2>
      {/* Render databases list */}
    </div>
  );
}