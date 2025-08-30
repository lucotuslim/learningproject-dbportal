import { apiSetting } from '@/config/apisetting';
import { ApiInterface } from '@/interfaces/generic';
import { switchMap, throwError, map, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export function ApiRequestRxjs<T>(fetchUrl: string, options?: RequestInit, UrlType?: string) {
  return fromFetch(fetchUrl, options).pipe(
    switchMap(response => {
      if (!response.ok) {
        return throwError(() => new Error(`API error: ${response.status}`));
      }
      return response.json().then((json: ApiInterface<T>) => ({
        ...json,
        UrlType: UrlType ?? null
      })) as Promise<ApiInterface<T> & { UrlType?: string }>;
    })
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
