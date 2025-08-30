import { catchError, filter, forkJoin, from, map, mergeMap, Observable, of, tap } from "rxjs";
import { switchMap, throwError } from 'rxjs';
import { IapiInfo } from "@/interfaces/generic";
import { apiSetting } from "@/config/apisetting"
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
              type: (item as any)?.type ?? ""
            }) as IapiInfo<T>
          )
        ),
        catchError((err) =>
          of([
            {
              apiurl: entry.apiurl,
              message: err.message || "Unknown error",
              error: true,
              type: ""
            } as IapiInfo<T>,
          ])
        )
      )
    )
  ).pipe(map((results) => results.flat())) as Observable<IapiInfo<T>[]>;
}