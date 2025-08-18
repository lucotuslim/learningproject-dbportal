"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {IapiControlDbUrl,IapiControlDbUrlWithSqlServer, ISqlServerInstance} from "@/interfaces/controldb";
import {ApiRequest} from "@/lib/utils"

const apiControlDbUrl: IapiControlDbUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ Controldburl: url }))
  : [];

  
export default function ApiDiv() {
  const [data, setData] = React.useState<IapiControlDbUrlWithSqlServer[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(
        apiControlDbUrl.map(async url => {
          const result = await ApiRequest<ISqlServerInstance>(url.Controldburl);
          return {
            Controldburl: url.Controldburl,
            ...result
          };
        })
      );
      setData(results);
    };
    fetchData();
  }, []);

  // const dynamicColumns = [
  //   ...baseColumns,
  //   {
  //     accessorKey: "extra",
  //     header: "Extra Info",
  //     cell: ({ row }: { row: { original: IapiControlDbUrl } }) => {
  //       const [result, setResult] = React.useState<string>("Loading...");
  //       React.useEffect(() => {
  //         fetch(row.original.Controldburl)
  //           .then(res => res.ok ? res.text() : Promise.reject("Error"))
  //           .then(data => setResult(data))
  //           .catch(() => setResult("Error"));
  //       }, [row.original.Controldburl]);
  //       return <span>{result}</span>;
  //     },
  //   },
  // ];

  //   return (
  //   <div className="container mx-auto py-10">
  //     <DataTable columns={columns} data={data} />
  //   </div>
  // )
   
}



