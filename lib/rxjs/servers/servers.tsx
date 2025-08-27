import { catchError, filter, forkJoin, from, map, mergeMap, Observable, of, tap } from "rxjs";
import { switchMap } from 'rxjs';
import { IapiInfo } from "@/interfaces/generic";
import { ApiRequestRxjs, getApiEndpoint } from '@/lib/rxjs/generic';
import { clientinfo } from "../controldb/controldb";
import { IClientInfo } from "@/interfaces/controldb";

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

  const clientserver$ = controldb$.pipe(
    mergeMap(controldbs =>
      // controldbs is an array, map each to an Observable and flatten
      forkJoin(
        controldbs.map(controldb =>
          GetClientServerFunction({ ServerName: controldb!.MachineName! })
        )
      )
    ),
    map(results => results.flat()) // flatten the array of arrays
  )
  
  return forkJoin([controldb$, clientserver$]).pipe(
    switchMap(([servers]) =>
      forkJoin(
        (servers as IapiInfo<T>[]).map(server =>
          getApiEndpoint(server.MachineName!, "server").pipe(
            switchMap((api: { ServerUrl: string }) =>
              ApiGetServerInfoDetails<T>([{ apiurl: api.ServerUrl, apitype: "ControlDb" }])
            )
          )
        )
      )
    ),
    map(results => results.flat())
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


export function GetClientServerFunction<T extends object>(
  ControlDbServer: { ServerName: string }
): Observable<IapiInfo<T>[]> {
  return getApiEndpoint(ControlDbServer.ServerName, "clientinfo").pipe(
        switchMap((api) => clientinfo<IClientInfo>([{ apiurl: api.ServerUrl }]))
      )
  .pipe(
    // flatten to list of client items
    map((results) => results.flat() as IapiInfo<IClientInfo>[]),
    // derive distinct server names from client items and fetch server details
    switchMap((clientItems) => {
      const servers = Array.from(
        new Set(
          clientItems
            .map((ci) => (ci as any).server)
            .filter(Boolean)
        )
      );

      if (servers.length === 0) return of([] as IapiInfo<T>[]);

      const serverDetailStreams = servers.map((servername) =>
        getApiEndpoint(servername, "server").pipe(
          switchMap((api) =>
            ApiGetServerInfoDetails<T>([
              { apiurl: api.ServerUrl, apitype: "ClientDb" },
            ])
          )
        )
      );
      return forkJoin(serverDetailStreams).pipe(map((results) => results.flat()));
    })
  );
}

export function ApiGetClientDbRxjs<T extends object>(
  apiClientDbUrl: { apiurl: string }[]
): Observable<IapiInfo<T>[]> {
  return forkJoin(
    apiClientDbUrl.map((entry) =>
      ApiRequestRxjs<T>(entry.apiurl).pipe(
        map((result) =>
          result.items.map((item) =>
            ({
              ...item,
              type: "ClientDb",
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
              type: "ClientDb",
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
