import { getAllServer } from "@/lib/rxjs/servers/servers";
import { IServerInfoDetails } from "@/interfaces/server";
import { ApiRequestRxjs, getApiEndpoint } from '@/lib/rxjs/generic';
import { mergeMap, toArray, map } from 'rxjs/operators';
import { IapiInfo } from "@/interfaces/generic";
import { Observable, from } from "rxjs";

export function getAllDatabase<T extends { MachineName?: string }>(
  apiControlDbUrls: { apiurl: string , apitype: string }[]
) : Observable<IapiInfo<T>[]> {
  return getAllServer<IServerInfoDetails>(apiControlDbUrls).pipe(
    mergeMap(servers =>
      from(servers).pipe(
        mergeMap(server =>
          getApiEndpoint(server.MachineName!, "databases").pipe(
            mergeMap(api =>
              ApiRequestRxjs<T>(api.ServerUrl, "Database").pipe(
                map((res): IapiInfo<T> => ({ ...(res as any), message: (res as any)?.message ?? '' }))
              )
            )
          )
        ),
        toArray()
      )
    )
  );
}