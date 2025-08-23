"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IapiUrl, IapiInfo } from "@/interfaces/generic";
import { ISqlServerInstance } from "@/interfaces/generic";
import { useObservable } from "rxjs-hooks";
import { ApiGetControlDbRxjs } from "@/lib/rxjs";

const apiControlDbUrl: IapiUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url }))
  : [];

export default function ApiDiv() {
  const data: IapiInfo<ISqlServerInstance>[] = useObservable(() =>
    ApiGetControlDbRxjs<ISqlServerInstance>(apiControlDbUrl),
    [] as IapiInfo<ISqlServerInstance>[] // initial value
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