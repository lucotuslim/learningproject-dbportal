"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {  IapiInfo } from "@/interfaces/generic";
import { useObservable } from "rxjs-hooks";
import {clientinfo} from "@/lib/rxjs/controldb/controldb"
import { IClientInfo } from "@/interfaces/controldb";
import { getApiEndpoint} from  "@/lib/rxjs/generic";
import { forkJoin, map, of, switchMap } from "rxjs";
import { ApiGetServerInfoDetails } from "@/lib/rxjs/servers/servers";
import { GetClientServerFunction } from "@/lib/rxjs/servers/servers";
import { IServerInfoDetails } from "@/interfaces/server";

// const apiControlDbUrl: IapiUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
//   ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url }))
//   : [];

const ControlDbServerlist= [{ ServerName: "controldb1" }];

export default function ApiDiv() {
     
  const data = useObservable<IapiInfo<IServerInfoDetails>[]>(() =>
    GetClientServerFunction(ControlDbServerlist),
    [] as IapiInfo<IServerInfoDetails>[]
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