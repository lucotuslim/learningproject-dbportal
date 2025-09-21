import {  getAllServer } from "@/lib/rxjs/servers/servers";
import { IServerInfoDetails } from "@/interfaces/server";
import { ApiRequestRxjs, getApiEndpoint } from '@/lib/rxjs/generic';
import { mergeMap, toArray, map, catchError } from 'rxjs/operators';
import { IapiInfo } from "@/interfaces/generic";
import { Observable, from, of} from "rxjs";

export function getAllDatabase<T extends { MachineName?: string }>(
  apiControlDbUrls: { apiurl: string , apitype: string }[]
): Observable<IapiInfo<T>[]> {
  return getAllServer<IServerInfoDetails>(apiControlDbUrls).pipe(
    mergeMap(servers =>
      from(servers).pipe(
        mergeMap(server =>
          getApiEndpoint(server.MachineName!, "databases").pipe(
            mergeMap(api =>
              ApiRequestRxjs<T>(api.ServerUrl, "Database").pipe(
                mergeMap((res) =>
                  from(res.items.map((item) => ({
                    ...item,
                    message: res.message ?? '',
                    error: res.error ?? false,
                    apiurl: api.ServerUrl,
                    apitype: 'Database',
                    MachineName: server.MachineName
                  } as IapiInfo<T>)))
                ),
                catchError((err) =>
                  of({
                    error: true,
                    message: err.message ?? 'Unknown error',
                    apiurl: api.ServerUrl,
                    apitype: 'Database',
                    MachineName: server.MachineName
                  } as IapiInfo<T>)
                )
              )
            )
          )
        ),
        toArray()
      )
    )
  );
}

export function GetDatabase <T extends object>
(serverName: string, 
databaseName: string) 
: Observable<IapiInfo<T>[]> {

  return ApiRequestRxjs<T>(
    `http://${serverName}api:3000/api/database/${databaseName}`, 
    "DatabaseDetail"
    ).pipe(
      map(result =>
        result.items.map(item => ({
          ...item,
          apitype: "Database",
          message: result.message ?? "",
          error: result.error ?? false,
          apiurl: `http://${serverName}api:3000/api/database/${databaseName}/master`,
        }) as IapiInfo<T>)
      )
    );
  // return getApiEndpoint(serverName, "server").pipe(
  //   switchMap((api) =>
  //     ApiGetServerInfoDetails<T>(
  //       { apiurl: api.ServerUrl, apitype: "ClientDb" },
  //     )
  //   )
  // );

}


