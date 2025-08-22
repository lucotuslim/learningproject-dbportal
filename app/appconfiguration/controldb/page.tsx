"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IapiControlDbUrl, IapiControlDbUrlWithSqlServer} from "@/interfaces/controldb";
import { ApiRequest } from "@/lib/utils";
import { ISqlServerInstance } from "@/interfaces/generic";
import { useObservable } from "rxjs-hooks";
import {ApiRequestRxjs} from "@/lib/rxjs";
import { catchError, forkJoin, map, of } from "rxjs";

const apiControlDbUrl: IapiControlDbUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ Controldburl: url }))
  : [];

export default function ApiDiv() {

  const data: IapiControlDbUrlWithSqlServer[] = useObservable(() =>
  forkJoin(
    apiControlDbUrl.map(entry =>
      ApiRequestRxjs<{ items: ISqlServerInstance[]; message?: string; error?: boolean }>(entry.Controldburl).pipe(
        map(result =>
          result.items.map(item => ({
            ...item,
            message: result.message || "",
            error: result.error || false,
            Controldburl: entry.Controldburl,
          }))
        ),
        catchError(err =>
          of([
            {
              Controldburl: entry.Controldburl,
              message: err.message || "Unknown error",
              error: true,
            } as IapiControlDbUrlWithSqlServer,
          ])
        )
      )
    )
  ).pipe(
    // flatten the array-of-arrays into a single array
    map(results => results.flat())
  ),
  [] as IapiControlDbUrlWithSqlServer[] // initial value
);
  
  // const [data, setData] = React.useState<IapiControlDbUrlWithSqlServer[]>([]);

// React.useEffect(() => {
//   const fetchData = async () => {
//     const results = await Promise.all(
//       apiControlDbUrl.map(async (url) => {
//         try {
//           const result = await ApiRequest<ISqlServerInstance>(url.Controldburl);
//           return result.items.map((item: ISqlServerInstance) => ({
//             ...item,
//             message: result.message || "",
//             error: result.error || false,
//             Controldburl: url.Controldburl,
//           }));
//         } catch (err) {
//           console.error(`Error fetching from ${url.Controldburl}:`, err);
//           return [{
//             message: err instanceof Error ? err.message : "Unknown error",
//             error: true,
//             Controldburl: url.Controldburl,
//           }];
//         }
//       })
//     );
//     // Flatten results
//     const controldbs = results.flat();
//     console.log("Fetched data:", controldbs);
//     setData(controldbs);
//   };
//   fetchData();
// }, [apiControlDbUrl]);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}



