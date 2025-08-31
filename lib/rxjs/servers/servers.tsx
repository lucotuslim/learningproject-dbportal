import { catchError, concat, forkJoin, map, merge, mergeAll, mergeMap, Observable, of, tap, race, toArray, from } from "rxjs";
import { switchMap } from 'rxjs';
import { IapiInfo } from "@/interfaces/generic";
import { ApiRequestRxjs, getApiEndpoint } from '@/lib/rxjs/generic';
import { clientinfo } from "../controldb/controldb";
import { IClientInfo } from "@/interfaces/controldb";

export function getServerByName<T extends { MachineName?: string }>(
  serverName: string
): Observable<IapiInfo<T>[]> {
  return getApiEndpoint(serverName, "server").pipe(
    switchMap((api) =>
      ApiGetServerInfoDetails<T>(
        { apiurl: api.ServerUrl, apitype: "ClientDb" },
      )
    )
  );
}

export function getAllServer<T extends { MachineName?: string }>(
  apiControlDbUrls: { apiurl: string , apitype: string }[]
): Observable<IapiInfo<T>[]> {

  return ApiGetControlDbRxjs<T>(apiControlDbUrls).pipe(
    tap(controldbs =>
      controldbs.forEach(controldb =>
        console.log("MachineName:", controldb?.MachineName ?? "N/A")
      )
    ),
    // filter out entries without MachineName
    map(controldbs =>
      controldbs.filter(
        controldb => !!controldb.MachineName && controldb.MachineName.trim() !== ""
      )
    ),
    // Wait for ApiGetControlDbRxjs to complete, then process next step
    switchMap(controldbs => {
      if (controldbs.length === 0) return of([]);
      const calls = controldbs.map(controldb =>
        GetClientServerFunction<T>([{ ServerName: controldb.MachineName! }])
      );
      // Use merge to emit results as soon as each completes
      return merge(...calls).pipe(
        toArray(),
        map(results => [...results.flat(), ...controldbs])
      );
    })
  );
}

export function ApiGetServerInfoDetails<T extends object>(
  apiUrl: { apiurl: string, apitype: string }
): Observable<IapiInfo<T>[]> {

  return ApiRequestRxjs<T>(apiUrl.apiurl, apiUrl.apitype).pipe(
    tap((result) => {
      console.log('ApiGetServerInfoDetails result:', {
        apiurl: apiUrl.apiurl,
        apitype: apiUrl.apitype,
        items: result.items,
        message: result.message,
        error: result.error
      });
    }),
    map((result) =>
      result.items.map((item) =>
        ({
          ...item,
          apitype: apiUrl.apitype,
          message: result.message || "",
          error: result.error || false,
          apiurl: apiUrl.apiurl,
        }) as IapiInfo<T>
      )
    ),
    catchError((err) =>
      of([
        {
          apiurl: apiUrl.apiurl,
          message: err.message || "Unknown error",
          error: true,
          apitype: apiUrl.apitype,
        } as IapiInfo<T>,
      ])
    )
  );

}

export function GetClientServerFunction<T extends object>(
  ControlDbServer: { ServerName: string }[]
): Observable<IapiInfo<T>[]> {
  // create an array of Observables for each ControlDbServer to fetch its clientinfo
  return forkJoin(
    ControlDbServer.map((ctrl) =>
      getApiEndpoint(ctrl.ServerName, "clientinfo").pipe(
        switchMap((api) => clientinfo<IClientInfo>([{ apiurl: api.ServerUrl, apitype: "ClientDb" }]))
      )
    )
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
              ApiGetServerInfoDetails<T>(
                { apiurl: api.ServerUrl, apitype: "ClientDb" },
              )
            )
          )
        );
        return forkJoin(serverDetailStreams).pipe(map((results) => results.flat()));
      })
    );
}

export function ApiGetControlDbRxjs<T extends object>(
  apiControlDbUrl: { apiurl: string; apitype: string }[]
): Observable<IapiInfo<T>[]> {
  return from(apiControlDbUrl).pipe(
    mergeMap((entry) =>
      ApiRequestRxjs<T>(entry.apiurl, entry.apitype).pipe(
        mergeMap((result) =>
          from(
            result.items.map(
              (item) =>
                ({
                  ...item,
                  apitype: "ControlDb",
                  message: result.message ?? "",
                  error: result.error ?? false,
                  apiurl: entry.apiurl,
                }) as IapiInfo<T>
            )
          )
        ),
        catchError((err) =>
          of({
            apiurl: entry.apiurl,
            message: err.message ?? "Unknown error",
            error: true,
            apitype: "ControlDb",
          } as IapiInfo<T>)
        )
      )
    ),
    toArray() // collect all emitted IapiInfo<T> into a single array
  );
}