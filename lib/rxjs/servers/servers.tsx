import { catchError, filter, forkJoin, from, map, mergeMap, Observable, of, tap } from "rxjs";
import { switchMap, throwError } from 'rxjs';
import { IapiInfo } from "@/interfaces/generic";
import { apiSetting } from "@/config/apisetting"
import { ApiRequestRxjs, getApiEndpoint } from '@/lib/rxjs/generic';
import { IServerInfoDetails } from "@/interfaces/server";
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

  return forkJoin([controldb$]).pipe(
    // forkJoin([controldb$]) emits an array of arrays, so destructure
    switchMap(([servers]) =>
      // map each server to its getApiEndpoint observable
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
    // flatten array-of-arrays
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

export function GetClientServerFunction(
  serverlist: { ServerName: string }[]
): Observable<IapiInfo<IServerInfoDetails>[]> {
  return forkJoin(
    serverlist.map((entry) =>
      getApiEndpoint(entry.ServerName, "clientinfo").pipe(
        switchMap((api) => clientinfo<IClientInfo>([{ apiurl: api.ServerUrl }]))
      )
    )
  ).pipe(
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

      if (servers.length === 0) return of([] as IapiInfo<IServerInfoDetails>[]);

      const serverDetailStreams = servers.map((servername) =>
        getApiEndpoint(servername, "server").pipe(
          switchMap((api) =>
            ApiGetServerInfoDetails<IServerInfoDetails>([
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
