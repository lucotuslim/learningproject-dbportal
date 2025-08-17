"use client"
import React from "react";
import { columns as baseColumns } from "./columns";
import { DataTable } from "./data-table";
import {IapiControlDbUrl} from "./interfaces"

const apiControlDbUrl: IapiControlDbUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ Controldburl: url }))
  : [];

export default function ApiDiv() {
  const dynamicColumns = [
    ...baseColumns,
    {
      accessorKey: "extra",
      header: "Extra Info",
      cell: ({ row }: { row: { original: IapiControlDbUrl } }) => {
        const [result, setResult] = React.useState<string>("Loading...");
        React.useEffect(() => {
          fetch(row.original.Controldburl)
            .then(res => res.ok ? res.text() : Promise.reject("Error"))
            .then(data => setResult(data))
            .catch(() => setResult("Error"));
        }, [row.original.Controldburl]);
        return <span>{result}</span>;
      },
    },
  ];

    return (
    <div className="container mx-auto py-10">
      <DataTable columns={dynamicColumns} data={apiControlDbUrl} />
    </div>
  )
}



