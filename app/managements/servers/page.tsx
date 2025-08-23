"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IapiControlDbUrl, IapiControlDbUrlWithSqlServer } from "@/interfaces/controldb";
import { ISqlServerInstance } from "@/interfaces/generic";
import { useObservable } from "rxjs-hooks";
import { ApiGetControlDbRxjs } from "@/lib/rxjs";
import { map } from "rxjs/operators";

const apiControlDbUrl: IapiControlDbUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(",").map((url) => ({
      Controldburl: url,
    }))
  : [];

export default function ApiDiv() {
  const data: IapiControlDbUrlWithSqlServer[] = useObservable(
    () =>
      ApiGetControlDbRxjs<ISqlServerInstance>(apiControlDbUrl).pipe(
        map((results) =>
          results.map((result) => ({
            serverurl: result.Controldburl,
            ...result,
          }))
        )
      ),
    [] as IapiControlDbUrlWithSqlServer[]
  );

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
