"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table";
// import { IapiInfo } from "@/interfaces/generic";
// import {IDatabaseInfo } from "@/interfaces/databases";
// import {getAllDatabase} from "@/lib/rxjs/databases/databases";
import { useEventCallback } from "rxjs-hooks";
import { startWith, switchMap } from "rxjs";
// import { RefreshCcw } from "lucide-react";
import {Namespace} from "./interface";
import {getNamespaces } from "./serverlib";
import { useGlobalSetting } from "@/lib/store";
import { useEffect } from "react";

// const apiControlDbUrls= process.env.NEXT_PUBLIC_CONTROLSERVERAPI
//   ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ apiurl: url , apitype: "ControlDb"}))
//   : [];

export default  function Page() {
const selectedEnvironment =  useGlobalSetting((state) => state.selectedEnvironment);
console.log("Selected Environment in Database Page:", selectedEnvironment);

const [refreshData, data] = useEventCallback(
  (event$) =>
    event$.pipe(
      startWith(0), // initial load
      switchMap(() =>
        selectedEnvironment
          ? getNamespaces<Namespace>("ServerInventory", "nonprod")
          : Promise.resolve([])
      )
    ),
  [] as Namespace[],
  [selectedEnvironment]
);

  if (!data ||  (data).length === 0) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns(() => refreshData(undefined))} data={data} />
    </div>
  );
}
