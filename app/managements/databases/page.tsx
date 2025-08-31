"use client"
import React from "react";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { IapiInfo } from "@/interfaces/generic";
import {IDatabaseInfo } from "@/interfaces/databases";
import { useObservable } from "rxjs-hooks";
import {  getAllServer} from "@/lib/rxjs/servers/servers";

const apiControlDbUrls= process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url , apitype: "ControlDb"}))
  : [];

 export default function ApiDiv() {
 
  const data = useObservable<IapiInfo<IDatabaseInfo>[]>(() =>
    getAllServer<IDatabaseInfo>(apiControlDbUrls),
    [] as IapiInfo<IDatabaseInfo>[]
  );

  if (data.length === 0) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
 