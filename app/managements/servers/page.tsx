"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IapiUrl, IapiInfo } from "@/interfaces/generic";
import { IServerInfoDetails } from "@/interfaces/server";
import { useObservable } from "rxjs-hooks";
import { ApiGetServerInfoDetails , getApiEndpoint} from "@/lib/rxjs";
import { forkJoin, map, switchMap } from "rxjs";

// const apiControlDbUrl: IapiUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
//   ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url }))
//   : [];

const apiurl: IapiUrl[] = [
  { apiurl: "localhost" }
];

export default function ApiDiv() {

    const data: IapiInfo<IServerInfoDetails>[] = useObservable(() =>
    forkJoin(
      apiurl.map((entry) =>
        getApiEndpoint(entry.apiurl, "server").pipe(
          switchMap((api) =>
            ApiGetServerInfoDetails<IServerInfoDetails>([{ apiurl: api.ServerUrl }])
          )
        )
      )
    ).pipe(
      // flatten results if needed
      map((results) => results.flat())
    ),
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