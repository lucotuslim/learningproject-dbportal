"use client"
import { IapiInfo } from "@/interfaces/generic";
import { useParams } from "next/navigation";
import { useObservable } from "rxjs-hooks";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import {IDatabaseDetailsInfo} from "@/interfaces/databases";
import { GetDatabase } from "@/lib/rxjs/databases/databases";

export default function Page() {
  const params = useParams() // team === "nextjs"
  const serverName = (Array.isArray(params.ServerName)
    ? params.ServerName[0]
    : params.ServerName) ?? "";

  const databaseName = (Array.isArray(params.DatabaseName)
    ? params.DatabaseName[0]
    : params.DatabaseName) ?? "";

      const data = useObservable<IapiInfo<IDatabaseDetailsInfo >[]>(() =>
        GetDatabase<IDatabaseDetailsInfo>(serverName, databaseName),
        [] as IapiInfo<IDatabaseDetailsInfo>[]  
      );
    
      if (data.length === 0) {
        return <div className="container mx-auto py-10">Loading...</div>;
      }
      
        const details = data[0];

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">{details?.name || "Database Details"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details && Object.entries(details).map(([key, value]) => (
          <div key={key} className="flex">
<span className="font-semibold min-w-max pr-2">{key}:</span>
            <span>{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
  }
 