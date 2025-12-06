import { catchError, forkJoin, map, Observable, of, tap } from "rxjs";
import { IapiInfo } from "@/interfaces/generic";
import {ApiRequestRxjs} from '@/lib/rxjs/generic';
//import {ApiGetControlDbRxjs} from "../servers/servers";

export function GetClientInfo<T>(apiControlDbUrls: { apiurl: string; apitype: string }[]): Observable<IapiInfo<T>[]> {
  return forkJoin(
    apiControlDbUrls.map((url) =>
      ApiRequestRxjs<T>(url.apiurl  + '/clientinfo', url.apitype).pipe(
        tap((result) => console.log("API result for", url.apiurl, ":", result)),
        map((result) =>
          result.items.map(
            (item) =>
              ({
                ...item,
                message: result.message || "",
                error: result.error || false,
                apiurl: url.apiurl,
                apitype: (item as T & { type?: string })?.type ?? ""
              } as IapiInfo<T>)
          )
        ),
        tap((mappedItems) => console.log("Mapped items for", url.apiurl, ":", mappedItems)),
        catchError((err) => {
          console.log("Error for", url.apiurl, ":", err);
          return of([
            {
              apiurl: url.apiurl,
              message: err?.message || "Unknown error",
              error: true,
              apitype: url.apitype
            } as IapiInfo<T>
          ]);
        })
      )
    )
  ).pipe(map((results) => results.flat())) as Observable<IapiInfo<T>[]>;
}


export function clientinfo<T extends object>(
  apiclienturl: { apiurl: string, apitype: string }[]
): Observable<IapiInfo<T>[]> {
  return forkJoin(
    apiclienturl.map((entry) =>
      ApiRequestRxjs<T>(entry.apiurl, entry.apitype).pipe(
        tap((result) => console.log("Raw API result for", entry.apiurl, ":", result)),
        map((result) =>
          result.items.map((item) =>
            ({
              ...item,
              message: result.message || "",
              error: result.error || false,
              apiurl: entry.apiurl,
              apitype: (item as T & { type?: string })?.type ?? ""
            }) as IapiInfo<T>
          )
        ),
        tap((mappedItems) => console.log("Mapped items for", entry.apiurl, ":", mappedItems)),
        catchError((err) => {
          console.log("Error for", entry.apiurl, ":", err);
          return of([
            {
              apiurl: entry.apiurl,
              message: err.message || "Unknown error",
              error: true,
              apitype: entry.apitype
            } as IapiInfo<T>,
          ]);
        })
      )
    )
  ).pipe(
    tap((allResults) => console.log("All forkJoin results:", allResults)),
    map((results) => results.flat()),
    tap((finalResult) => console.log("Final flattened result:", finalResult))
  ) as Observable<IapiInfo<T>[]>;
}