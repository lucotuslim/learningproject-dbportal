"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IapiUrl, IapiInfo } from "@/interfaces/generic";
import { IClientInfo } from "@/interfaces/controldb";
import { useObservable } from "rxjs-hooks";
import { ApiGetControlDbRxjs } from "@/lib/rxjs/servers/servers";
import {clientinfo} from "@/lib/rxjs/controldb/controldb";

const apiControlDbUrl: IapiUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url, apitype: "controldb" }))
  : [];

export default function ApiDiv() {
  const data: IapiInfo<IClientInfo>[] = useObservable(() =>
    clientinfo<IClientInfo>(apiControlDbUrl),
    [] as IapiInfo<IClientInfo>[] // initial value
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