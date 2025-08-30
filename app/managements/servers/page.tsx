"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IapiUrl, IapiInfo } from "@/interfaces/generic";
import { IServerInfoDetails } from "@/interfaces/server";
import { useObservable } from "rxjs-hooks";
import { ApiGetServerInfoDetails , getAllServer} from "@/lib/rxjs/servers/servers";
import { forkJoin, map, switchMap } from "rxjs";

const apiControlDbUrls: IapiUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url }))
  : [];

 export default function ApiDiv() {
 // previous alternative approach (kept for reference)
 // const data: IapiInfo<IServerInfoDetails>[] = useObservable(() =>
 //   forkJoin(
 //     apiurl.map((entry) =>
 //       getApiEndpoint(entry.apiurl, "server").pipe(
 //         switchMap((api) =>
 //           ApiGetServerInfoDetails<IServerInfoDetails>([{ apiurl: api.ServerUrl, apitype: "ControlDb"}])
 //         )
 //       )
 //     )
 //   ).pipe(
 //     // flatten results if needed
 //     map((results) => results.flat())
 //   ),
 //   [] as IapiInfo<IServerInfoDetails>[]
 // );

  const data = useObservable<IapiInfo<IServerInfoDetails>[]>(() =>
    getAllServer<IServerInfoDetails>(apiControlDbUrls),
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
 