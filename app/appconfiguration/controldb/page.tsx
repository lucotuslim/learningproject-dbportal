"use client"
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {IapiControlDbUrl} from "./interfaces"

const apiControlDbUrl: IapiControlDbUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ Controldburl: url }))
  : [];

export default function ApiDiv() {
  // return (
  //   <div>
  //     {apiControlDbUrl.map(
  //       (url, index) => <pre key={index}>{url}</pre>
  //     )}
  //   </div>
  // );

    return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={apiControlDbUrl} />
    </div>
  )
}



