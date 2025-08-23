"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IapiControlDbUrl, IapiControlDbUrlWithSqlServer } from "@/interfaces/controldb";
//import { ApiRequest } from "@/lib/utils";
import { ISqlServerInstance } from "@/interfaces/generic";
import { useObservable } from "rxjs-hooks";
import { ApiRequestRxjs } from "@/lib/rxjs";
import { catchError, forkJoin, map, of } from "rxjs";
import { ApiGetControlDbRxjs } from "@/lib/rxjs";

const apiControlDbUrl: IapiControlDbUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url }))
  : [];

export default function ApiDiv() {
  const data: IapiControlDbUrlWithSqlServer[] = useObservable(() =>
    ApiGetControlDbRxjs<ISqlServerInstance>(apiControlDbUrl),
    [] as IapiControlDbUrlWithSqlServer[] // initial value
  );

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}