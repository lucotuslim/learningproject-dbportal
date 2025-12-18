"use client"
import React from "react";
// import { columns } from "./columns";
// import { DataTable } from "./data-table";
import { IapiUrl, IapiInfo } from "@/interfaces/generic";
// import { ISqlServerInstance } from "@/interfaces/generic";
// import { useObservable } from "rxjs-hooks";
// import { ApiGetControlDbRxjs } from "@/lib/rxjs/servers/servers";
import { useGlobalSetting } from "@/lib/store";

const apiControlDbUrl: IapiUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url, apitype: "controldb" }))
  : [];

export default function ApiDiv() {
const selectedEnvironment =  useGlobalSetting((state) => state.selectedEnvironment);
console.log("Selected Environment in Control DB Page:", selectedEnvironment);

  return ( 
    <div> 
      <h1 className="text-2xl font-bold mb-4">Control DB Page</h1>
      <p>Pending implementation.</p>
      <p>SelectedEnvironment is: {selectedEnvironment}</p>
    </div>
  )
  // const data: IapiInfo<ISqlServerInstance>[] = useObservable(() =>
  //   ApiGetControlDbRxjs<ISqlServerInstance>(apiControlDbUrl),
  //   [] as IapiInfo<ISqlServerInstance>[] // initial value
  // );
  // if (data.length === 0) {
  //   return <div className="container mx-auto py-10">Loading...</div>;
  // }
  // return (
  //   <div className="container mx-auto py-10">
  //     <DataTable columns={columns} data={data} />
  //   </div>
  // );


}