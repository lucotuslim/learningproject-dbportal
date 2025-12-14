"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {  IapiInfo } from "@/interfaces/generic";
import { useObservable } from "rxjs-hooks";
import { GetClientServerFunction } from "@/lib/rxjs/servers/servers";
import { IServerInfoDetails } from "@/interfaces/server";

// const apiControlDbUrl: IapiUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
//   ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url }))
//   : [];

const ControlDbServerlist= [{ ServerName: "controldb1" }];

export default function ApiDiv() {
     
  return <div className="container mx-auto py-10"> AppDB Page - Under Construction</div>;
  // const data = useObservable<IapiInfo<IServerInfoDetails>[]>(() =>
  //   GetClientServerFunction(ControlDbServerlist),
  //   [] as IapiInfo<IServerInfoDetails>[]
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