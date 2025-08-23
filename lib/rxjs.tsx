import { catchError, filter, forkJoin, from, map, mergeMap, Observable, of, tap } from "rxjs";
import { ApiInterface, ISqlServerInstance } from '@/interfaces/generic';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, throwError } from 'rxjs';
import { IapiInfo } from "@/interfaces/generic";
import { apiSetting } from "@/config/apisetting"
import { IServerInfoDetails } from "@/interfaces/server";

export function getAllServer<T extends { MachineName?: string }>(
  apiControlDbUrls: { apiurl: string }[]
): Observable<IapiInfo<T>[]> {

  const controldb$ = ApiGetControlDbRxjs<T>(apiControlDbUrls).pipe(
    tap(controldbs =>
      controldbs.forEach(controldb =>
        console.log("MachineName:", controldb?.MachineName ?? "N/A")
      )
    ),
    // filter out entries without MachineName
    map(controldbs =>
      controldbs.filter(controldb =>
        !!controldb.MachineName && controldb.MachineName.trim() !== ""
      )
    )
  )

  return forkJoin([controldb$]).pipe(
    // forkJoin([controldb$]) emits an array of arrays, so destructure
    switchMap(([servers]) =>
      // map each server to its getApiEndpoint observable
      forkJoin(
        (servers as IapiInfo<T>[]).map(server =>
          getApiEndpoint("localhost", "server").pipe(
            switchMap(api =>
              ApiGetServerInfoDetails<T>([{ apiurl: api.ServerUrl, apitype: "ControlDb" }])
            )
          )
        )
      )
    ),
    // flatten array-of-arrays
    map(results => results.flat())
  );

}

export function getApiEndpoint(servername: string, type: string) {
  const setting = apiSetting.find((entry) => entry.type === type);
  if (!setting) {
    throw new Error(`API type "${type}" not found in apiSetting`);
  }
  const endpoint = setting.endpoint;
  return of(servername).pipe(
    map((name) => ({
      Servername: name,
      ServerUrl: `http://${name}:3000/api/${endpoint}`,
    }))
  );
}

export function ApiRequestRxjs<T>(fetchUrl: string,
  options?: RequestInit) {
  return fromFetch(fetchUrl, options).pipe(
    switchMap(response => {
      if (!response.ok) {
        return throwError(() => new Error(`API error: ${response.status}`));
      }
      return response.json() as Promise<ApiInterface<T>>;
    })
  );
}

export function ApiGetServerInfoDetails<T extends object>(
  apiUrl: { apiurl: string, apitype: string }[]
): Observable<IapiInfo<T>[]> {
  return forkJoin(
    apiUrl.map((entry) =>
      ApiRequestRxjs<T>(entry.apiurl).pipe(
        map((result) =>
          result.items.map((item) =>
            ({
              ...item,
              type: entry.apitype,
              message: result.message || "",
              error: result.error || false,
              apiurl: entry.apiurl,
            }) as IapiInfo<T>
          )
        ),
        catchError((err) =>
          of([
            {
              apiurl: entry.apiurl,
              message: err.message || "Unknown error",
              error: true,
              type: entry.apitype,
            } as IapiInfo<T>,
          ])
        )
      )
    )
  ).pipe(map((results) => results.flat()));
}

export function ApiGetControlDbRxjs<T extends object>(
  apiControlDbUrl: { apiurl: string }[]
): Observable<IapiInfo<T>[]> {
  return forkJoin(
    apiControlDbUrl.map((entry) =>
      ApiRequestRxjs<T>(entry.apiurl).pipe(
        map((result) =>
          result.items.map((item) =>
            ({
              ...item,
              type: "ControlDb",
              message: result.message || "",
              error: result.error || false,
              apiurl: entry.apiurl,
            }) as IapiInfo<T>
          )
        ),
        catchError((err) =>
          of([
            {
              apiurl: entry.apiurl,
              message: err.message || "Unknown error",
              error: true,
              type: "ControlDb",
            } as IapiInfo<T>,
          ])
        )
      )
    )
  ).pipe(map((results) => results.flat()));
}
