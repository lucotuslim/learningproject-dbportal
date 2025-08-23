import { catchError, forkJoin, map, of } from "rxjs";
import { ApiInterface, ISqlServerInstance } from '@/interfaces/generic';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, throwError } from 'rxjs';
import { IapiControlDbUrlWithSqlServer } from "@/interfaces/controldb";

export function serverwithapi(servername: string) {
  return of(servername).pipe(
    map(name => ({
      Servername: name,
      ServerUrl: `http://${name}:3000/api/server`
    })),
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

export function ApiGetControlDbRxjs<T>(
  apiControlDbUrl: { apiurl: string }[]
) {
  return forkJoin(
    apiControlDbUrl.map((entry) =>
      ApiRequestRxjs<ISqlServerInstance>(entry.apiurl).pipe(
        map((result) =>
          result.items.map((item) => ({
            ...item,
            type: 'ControlDb',
            message: result.message || "",
            error: result.error || false,
            apiurl: entry.apiurl,
          }))
        ),
        catchError((err) =>
          of([
            {
              apiurl: entry.apiurl,
              message: err.message || "Unknown error",
              error: true,
              type: 'ControlDb',
            } as IapiControlDbUrlWithSqlServer,
          ])
        )
      )
    )
  ).pipe(
    map((results) => results.flat())
  );
}

