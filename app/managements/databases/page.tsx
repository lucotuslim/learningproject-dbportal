"use client"
import React, { useCallback, useState } from "react";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { IapiInfo } from "@/interfaces/generic";
import {IDatabaseInfo } from "@/interfaces/databases";
import {getAllDatabase} from "@/lib/rxjs/databases/databases";
import { useEventCallback } from "rxjs-hooks";
import { startWith, switchMap } from "rxjs";
import { RefreshCcw } from "lucide-react";

const apiControlDbUrls= process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url , apitype: "ControlDb"}))
  : [];

 export default function Page() {

const [refreshData, data] = useEventCallback(
  (event$) =>
    event$.pipe(
      startWith(0), // initial load
      switchMap(() =>
        getAllDatabase<IapiInfo<IDatabaseInfo & { MachineName?: string }>>(apiControlDbUrls)
      )
    ),
  [] as IapiInfo<IDatabaseInfo & { MachineName?: string }>[]
);
  
  if (!data || data.length === 0) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }
  return (
    <div> 

    <div className="container mx-auto py-10">
          <RefreshCcw onClick={() => refreshData(undefined)} />

      <DataTable columns={columns(() => refreshData(undefined))} data={data} />
    </div>
    </div>
  );
}
 




