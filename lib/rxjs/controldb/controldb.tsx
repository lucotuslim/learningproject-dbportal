import { catchError, forkJoin, map, Observable, of } from "rxjs";
import { IapiInfo } from "@/interfaces/generic";
import {ApiRequestRxjs} from '@/lib/rxjs/generic';

export function clientinfo<T extends object>(
  apiclienturl: { apiurl: string, apitype: string }[]
): Observable<IapiInfo<T>[]> {
  return forkJoin(
    apiclienturl.map((entry) =>
      ApiRequestRxjs<T>(entry.apiurl, entry.apitype).pipe(
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
        catchError((err) =>
          of([
            {
              apiurl: entry.apiurl,
              message: err.message || "Unknown error",
              error: true,
              apitype: entry.apitype
            } as IapiInfo<T>,
          ])
        )
      )
    )
  ).pipe(map((results) => results.flat())) as Observable<IapiInfo<T>[]>;
}